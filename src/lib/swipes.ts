import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { DemoAwareOptions, MutationResult, Swipe, SwipeDirection } from '../types';

export const QUEUED_SWIPES_KEY = 'datejared:queued-swipes';
export const LOCAL_SWIPES_KEY = 'datejared:local-swipes';
export const VIEWED_COUNT_KEY = 'datejared:viewed-count';
export const SIMILARITY_ACKNOWLEDGED_KEY = 'datejared:similarity-acknowledged';

export type QueuedSwipe = {
  jaredProfileId: string;
  direction: SwipeDirection;
  queuedAt: string;
};

export type LocalSwipe = QueuedSwipe;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getQueuedSwipes(): QueuedSwipe[] {
  return readJson<QueuedSwipe[]>(QUEUED_SWIPES_KEY, []);
}

export function getLocalSwipes(): LocalSwipe[] {
  return readJson<LocalSwipe[]>(LOCAL_SWIPES_KEY, []);
}

export function getViewedCount(): number {
  return readJson<number>(VIEWED_COUNT_KEY, 0);
}

export function hasAcknowledgedSimilarityModal(): boolean {
  return readJson<boolean>(SIMILARITY_ACKNOWLEDGED_KEY, false);
}

export function acknowledgeSimilarityModal() {
  writeJson(SIMILARITY_ACKNOWLEDGED_KEY, true);
}

export function recordAnonymousSwipe(jaredProfileId: string, direction: SwipeDirection): QueuedSwipe[] {
  const viewedCount = getViewedCount() + 1;
  writeJson(VIEWED_COUNT_KEY, viewedCount);

  const swipe = {
    jaredProfileId,
    direction,
    queuedAt: new Date().toISOString()
  };

  const nextLocalSwipes = [...getLocalSwipes().filter((localSwipe) => localSwipe.jaredProfileId !== jaredProfileId), swipe];
  writeJson(LOCAL_SWIPES_KEY, nextLocalSwipes);

  if (direction === 'left') {
    return getQueuedSwipes();
  }

  const nextQueue = [...getQueuedSwipes().filter((queuedSwipe) => queuedSwipe.jaredProfileId !== jaredProfileId), swipe];
  writeJson(QUEUED_SWIPES_KEY, nextQueue);

  return nextQueue;
}

export async function replayQueuedSwipes(): Promise<{ replayed: number; retained: QueuedSwipe[]; reason?: string }> {
  const queuedSwipes = getQueuedSwipes();
  const retained: QueuedSwipe[] = [];
  let replayed = 0;

  for (const queuedSwipe of queuedSwipes) {
    const result = await recordSwipe(queuedSwipe.jaredProfileId, queuedSwipe.direction);

    if (result.error) {
      retained.push(queuedSwipe);
      continue;
    }

    replayed += 1;
  }

  writeJson(QUEUED_SWIPES_KEY, retained);

  return {
    replayed,
    retained,
    reason: retained.length ? 'Queued likes are saved locally until live data is available.' : undefined
  };
}

export async function recordSwipe(
  jaredProfileId: string,
  direction: SwipeDirection,
  options?: DemoAwareOptions
): Promise<MutationResult<Swipe>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<Swipe>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client.rpc('record_swipe', {
    p_jared_profile_id: jaredProfileId,
    p_direction: direction
  });

  return { data, error, demoMode: false };
}
