import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { DemoAwareOptions, MutationResult, Relationship, RelationshipStatus } from '../types';

export async function fetchOwnRelationships(): Promise<Relationship[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client.from('relationships').select('*').order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchJaredRelationships(status?: RelationshipStatus): Promise<Relationship[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  let query = supabase.client.from('relationships').select('*').order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function decideRelationship(
  relationshipId: string,
  status: Exclude<RelationshipStatus, 'pending'>,
  options?: DemoAwareOptions
): Promise<MutationResult<Relationship>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<Relationship>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client.rpc('jared_decide_relationship', {
    p_relationship_id: relationshipId,
    p_status: status
  });

  return { data, error, demoMode: false };
}

export function isRelationshipActionable(relationship: Relationship): boolean {
  return relationship.status === 'pending';
}

export function isRelationshipMatched(relationship: Relationship | null): boolean {
  return relationship?.status === 'matched';
}
