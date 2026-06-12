import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { DemoAwareOptions, MutationResult } from '../types';

export const JARED_PROFILE_PHOTOS_BUCKET = 'jared-profile-photos';

export type PhotoUploadResult = {
  path: string;
  publicUrl: string;
};

export async function uploadJaredProfilePhoto(
  path: string,
  file: File,
  options?: DemoAwareOptions
): Promise<MutationResult<PhotoUploadResult>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<PhotoUploadResult>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client.storage.from(JARED_PROFILE_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    return { data: null, error, demoMode: false };
  }

  const publicUrl = supabase.client.storage.from(JARED_PROFILE_PHOTOS_BUCKET).getPublicUrl(data.path).data.publicUrl;

  return {
    data: {
      path: data.path,
      publicUrl
    },
    error: null,
    demoMode: false
  };
}
