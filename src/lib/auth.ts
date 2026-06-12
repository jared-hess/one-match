import type { Session, User } from '@supabase/supabase-js';
import { getAuthCallbackUrl, getSupabase } from './supabase';
import { fetchOwnProfile } from './profiles';
import type { Profile } from '../types';

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
};

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return null;
  }

  const { data, error } = await supabase.client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return null;
  }

  const { data, error } = await supabase.client.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getAuthState(): Promise<AuthState> {
  const session = await getCurrentSession();
  const user = session?.user ?? null;
  const profile = user ? await fetchOwnProfile() : null;

  return { session, user, profile };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabase();

  if (!supabase.available) {
    throw new Error(supabase.reason);
  }

  const { error } = await supabase.client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl()
    }
  });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return;
  }

  const { error } = await supabase.client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function handleAuthCallback(): Promise<string> {
  const state = await getAuthState();
  return getPostAuthRoute(state.profile);
}

export function getPostAuthRoute(profile: Profile | null): string {
  if (!profile) {
    return '/complete-profile';
  }

  if (profile.role === 'jared') {
    return '/jared';
  }

  if (!profile.age_confirmed || !profile.onboarding_completed_at) {
    return '/onboarding';
  }

  return '/swipe';
}

export function isJaredProfile(profile: Profile | null): boolean {
  return profile?.role === 'jared';
}
