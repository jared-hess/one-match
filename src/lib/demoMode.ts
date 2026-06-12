import type { MutationResult } from '../types';
import { fallbackJaredProfiles } from '../data/jaredProfiles';
import type { JaredProfile, SwipeDirection } from '../types';

export const DEMO_MODE_STORAGE_KEY = 'datejared:demo-mode';
export const JARED_DEMO_STATE_KEY = 'datejared:jared-demo-state';
export const DEMO_DECK_SIZES = [5, 7, 10] as const;

export type DemoDeckSize = (typeof DEMO_DECK_SIZES)[number];

export type DemoSwipe = {
  jaredProfileId: string;
  direction: SwipeDirection;
  swipedAt: string;
};

export type JaredDemoState = {
  deckSize: DemoDeckSize;
  viewedProfileIds: string[];
  swipes: DemoSwipe[];
  similarityRevealed: boolean;
};

export type DemoModeOptions = {
  demoMode?: boolean;
};

export function isDemoModeEnabled(options?: DemoModeOptions): boolean {
  if (options?.demoMode !== undefined) {
    return options.demoMode;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(enabled));
}

export function createDemoMutationResult<T>(data: T | null = null): MutationResult<T> {
  return {
    data,
    error: null,
    demoMode: true
  };
}

export function createUnavailableMutationResult<T>(message: string): MutationResult<T> {
  return {
    data: null,
    error: new Error(message),
    demoMode: false
  };
}

export function isDemoDeckSize(value: number): value is DemoDeckSize {
  return DEMO_DECK_SIZES.includes(value as DemoDeckSize);
}

function defaultDemoState(deckSize: DemoDeckSize = 5): JaredDemoState {
  return {
    deckSize,
    viewedProfileIds: [],
    swipes: [],
    similarityRevealed: false
  };
}

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

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getJaredDemoState(): JaredDemoState {
  const state = readJson<JaredDemoState>(JARED_DEMO_STATE_KEY, defaultDemoState());
  const deckSize = isDemoDeckSize(state.deckSize) ? state.deckSize : 5;

  return {
    deckSize,
    viewedProfileIds: Array.isArray(state.viewedProfileIds) ? state.viewedProfileIds : [],
    swipes: Array.isArray(state.swipes) ? state.swipes : [],
    similarityRevealed: Boolean(state.similarityRevealed)
  };
}

export function resetJaredDemoState(deckSize: DemoDeckSize): JaredDemoState {
  const nextState = defaultDemoState(deckSize);
  setDemoModeEnabled(true);
  writeJson(JARED_DEMO_STATE_KEY, nextState);
  return nextState;
}

export function recordJaredDemoSwipe(jaredProfileId: string, direction: SwipeDirection): JaredDemoState {
  const currentState = getJaredDemoState();
  const viewedProfileIds = currentState.viewedProfileIds.includes(jaredProfileId)
    ? currentState.viewedProfileIds
    : [...currentState.viewedProfileIds, jaredProfileId];
  const nextState: JaredDemoState = {
    ...currentState,
    viewedProfileIds,
    swipes: [
      ...currentState.swipes.filter((swipe) => swipe.jaredProfileId !== jaredProfileId),
      {
        jaredProfileId,
        direction,
        swipedAt: new Date().toISOString()
      }
    ]
  };

  writeJson(JARED_DEMO_STATE_KEY, nextState);
  return nextState;
}

export function markJaredDemoSimilarityRevealed(): JaredDemoState {
  const nextState = {
    ...getJaredDemoState(),
    similarityRevealed: true
  };
  writeJson(JARED_DEMO_STATE_KEY, nextState);
  return nextState;
}

export function getDemoEligibleJaredProfiles(profiles: JaredProfile[]): JaredProfile[] {
  const sourceProfiles = profiles.length ? profiles : fallbackJaredProfiles;

  return sourceProfiles
    .filter((profile) => profile.demo_eligible && profile.active && !profile.archived)
    .sort((first, second) => first.sort_order - second.sort_order);
}

export function buildJaredDemoDeck(profiles: JaredProfile[], deckSize: DemoDeckSize): JaredProfile[] {
  const eligibleProfiles = getDemoEligibleJaredProfiles(profiles);
  const fallbackEligibleProfiles = getDemoEligibleJaredProfiles(fallbackJaredProfiles);
  const pool = eligibleProfiles.length >= deckSize ? eligibleProfiles : [...eligibleProfiles, ...fallbackEligibleProfiles];
  const uniqueProfiles = [...new Map(pool.map((profile) => [profile.id, profile])).values()];

  return uniqueProfiles.slice(0, deckSize);
}
