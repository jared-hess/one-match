import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import { fallbackJaredProfiles } from '../data/jaredProfiles';
import type { DemoAwareOptions, JaredProfile, JaredProfileInsert, JaredProfileUpdate, MutationResult } from '../types';

export async function listActiveJaredProfiles(): Promise<JaredProfile[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return fallbackJaredProfiles;
  }

  const { data, error } = await supabase.client
    .from('jared_profiles')
    .select('*')
    .eq('active', true)
    .eq('archived', false)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data?.length ? data : fallbackJaredProfiles;
}

export async function getVisibleJaredProfile(idOrSlug: string): Promise<JaredProfile | null> {
  const profiles = await listActiveJaredProfiles();

  return profiles.find((profile) => profile.id === idOrSlug || profile.slug === idOrSlug) ?? null;
}

export async function listAllJaredProfilesForJared(): Promise<JaredProfile[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('jared_profiles')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createJaredProfile(
  input: JaredProfileInsert,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<JaredProfile>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client.from('jared_profiles').insert(input).select('*').single();

  return { data, error, demoMode: false };
}

export async function updateJaredProfile(
  id: string,
  input: JaredProfileUpdate,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<JaredProfile>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }
  const { data, error } = await supabase.client.from('jared_profiles').update(input).eq('id', id).select('*').single();

  return { data, error, demoMode: false };
}

export async function archiveJaredProfile(id: string, options?: DemoAwareOptions): Promise<MutationResult<JaredProfile>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<JaredProfile>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }
  const { data, error } = await supabase.client
    .from('jared_profiles')
    .update({ active: false, archived: true })
    .eq('id', id)
    .select('*')
    .single();

  return { data, error, demoMode: false };
}
