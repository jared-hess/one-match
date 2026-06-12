import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type { Conversation, DemoAwareOptions, Message, MutationResult } from '../types';

export async function fetchConversations(): Promise<Conversation[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client.from('conversations').select('*').order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  options?: DemoAwareOptions
): Promise<MutationResult<Message>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<Message>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const { data, error } = await supabase.client
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select('*')
    .single();

  return { data, error, demoMode: false };
}
