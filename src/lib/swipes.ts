import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { DemoAwareOptions, MutationResult, Swipe, SwipeDirection } from '../types';

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
