import { createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { DemoAwareOptions, MutationResult, Profile, ProfileUpdate } from '../types';

export type OwnProfileUpsert = Omit<ProfileUpdate, 'role'> & {
  user_id: string;
  email: string | null;
};

export async function fetchOwnProfile(): Promise<Profile | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return null;
  }

  const user = await supabase.client.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase.client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertOwnProfile(
  input: OwnProfileUpsert,
  options?: DemoAwareOptions
): Promise<MutationResult<Profile>> {
  if (isDemoModeEnabled(options)) {
    return { data: null, error: null, demoMode: true };
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client
    .from('profiles')
    .upsert({ ...input, role: 'user' }, { onConflict: 'user_id' })
    .select('*')
    .single();

  return { data, error, demoMode: false };
}

export async function updateOwnProfile(
  input: ProfileUpdate,
  options?: DemoAwareOptions
): Promise<MutationResult<Profile>> {
  if (isDemoModeEnabled(options)) {
    return { data: null, error: null, demoMode: true };
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const safeInput: ProfileUpdate = { ...input, role: 'user' };
  const user = await supabase.client.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return createUnavailableMutationResult('Sign in before updating your profile.');
  }

  const { data, error } = await supabase.client
    .from('profiles')
    .update(safeInput)
    .eq('user_id', userId)
    .select('*')
    .single();

  return { data, error, demoMode: false };
}
