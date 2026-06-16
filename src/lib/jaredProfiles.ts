import {
  createDemoMutationResult,
  createUnavailableMutationResult,
  isDemoModeEnabled
} from './demoMode';
import { getSupabase } from './supabase';
import { fallbackJaredProfiles } from '../data/jaredProfiles';
import type {
  DemoAwareOptions,
  JaredProfile,
  JaredProfileInsert,
  JaredProfileUpdate,
  MutationResult
} from '../types';

export type JaredProfileSortMove = 'up' | 'down';

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

export async function getJaredProfileForJared(id: string): Promise<JaredProfile | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return (
      fallbackJaredProfiles.find((profile) => profile.id === id || profile.slug === id) ?? null
    );
  }

  const { data, error } = await supabase.client
    .from('jared_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
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

  const { data, error } = await supabase.client
    .from('jared_profiles')
    .insert(input)
    .select('*')
    .single();

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
  const { data, error } = await supabase.client
    .from('jared_profiles')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  return { data, error, demoMode: false };
}

export async function archiveJaredProfile(
  id: string,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
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

export async function reorderJaredProfilePhotos(
  profile: JaredProfile,
  fromIndex: number,
  toIndex: number,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
  const nextUrls = moveArrayItem(profile.image_urls, fromIndex, toIndex);

  return updateJaredProfile(profile.id, { image_urls: nextUrls }, options);
}

export async function removeJaredProfilePhoto(
  profile: JaredProfile,
  imageUrl: string,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
  return updateJaredProfile(
    profile.id,
    { image_urls: profile.image_urls.filter((url) => url !== imageUrl) },
    options
  );
}

export async function updateJaredProfileSortOrder(
  profiles: JaredProfile[],
  profileId: string,
  move: JaredProfileSortMove,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredProfile>> {
  const currentIndex = profiles.findIndex((profile) => profile.id === profileId);
  const targetIndex = move === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= profiles.length) {
    return { data: profiles[currentIndex] ?? null, error: null, demoMode: false };
  }

  const reordered = moveArrayItem(profiles, currentIndex, targetIndex);
  const movedProfile = reordered[targetIndex];
  const previousSortOrder = profiles[currentIndex].sort_order;
  const targetSortOrder = profiles[targetIndex].sort_order;

  await updateJaredProfile(profiles[targetIndex].id, { sort_order: previousSortOrder }, options);
  return updateJaredProfile(movedProfile.id, { sort_order: targetSortOrder }, options);
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);

  return nextItems;
}
