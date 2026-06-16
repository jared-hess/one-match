import {
  createDemoMutationResult,
  createUnavailableMutationResult,
  isDemoModeEnabled
} from './demoMode';
import { getSupabase } from './supabase';
import type {
  DeletionRequest,
  DeletionRequestStatus,
  DemoAwareOptions,
  MutationResult
} from '../types';

export type DeletionRequestUpdate = {
  status: DeletionRequestStatus;
  notes?: string | null;
};

function timestampForStatus(
  status: DeletionRequestStatus
): Pick<DeletionRequest, 'completed_at' | 'cancelled_at'> {
  if (status === 'completed') {
    return {
      completed_at: new Date().toISOString(),
      cancelled_at: null
    };
  }

  if (status === 'cancelled') {
    return {
      completed_at: null,
      cancelled_at: new Date().toISOString()
    };
  }

  return {
    completed_at: null,
    cancelled_at: null
  };
}

export async function createOwnDeletionRequest(
  options?: DemoAwareOptions
): Promise<MutationResult<DeletionRequest>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<DeletionRequest>();
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const user = await supabase.client.auth.getUser();

  if (!user.data.user) {
    return createUnavailableMutationResult('Sign in before requesting account and data deletion.');
  }

  const { data, error } = await supabase.client.rpc('request_deletion');

  return { data, error, demoMode: false };
}

export async function fetchOwnDeletionRequests(): Promise<DeletionRequest[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const user = await supabase.client.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('deletion_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchDeletionRequestsForJared(): Promise<DeletionRequest[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('deletion_requests')
    .select('*')
    .order('requested_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateDeletionRequestForJared(
  id: string,
  input: DeletionRequestUpdate,
  options?: DemoAwareOptions
): Promise<MutationResult<DeletionRequest>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<DeletionRequest>();
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client
    .from('deletion_requests')
    .update({
      status: input.status,
      notes: input.notes,
      ...timestampForStatus(input.status)
    })
    .eq('id', id)
    .select('*')
    .single();

  return { data, error, demoMode: false };
}
