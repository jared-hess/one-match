import {
  createDemoMutationResult,
  createUnavailableMutationResult,
  isDemoModeEnabled
} from './demoMode';
import { getSupabase } from './supabase';
import type {
  Conversation,
  DemoAwareOptions,
  Message,
  MutationResult,
  Profile,
  Relationship
} from '../types';

export type MessagingConversation = {
  conversation: Conversation;
  relationship: Relationship;
  userProfile: Profile | null;
  latestMessage: Message | null;
  unreadCount: number;
};

export type NormalMessagingState =
  | {
      state: 'ready';
      currentUserId: string;
      item: MessagingConversation;
      messages: Message[];
    }
  | {
      state: 'blocked';
      currentUserId: string | null;
      title: string;
      description: string;
    };

export type MessageSubscription = {
  realtime: boolean;
  reason: string | null;
  unsubscribe: () => void;
};

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function latestMessageFor(conversationId: string, messages: Message[]): Message | null {
  return messages.find((message) => message.conversation_id === conversationId) ?? null;
}

function unreadCountFor(
  conversationId: string,
  currentUserId: string | null,
  messages: Message[]
): number {
  if (!currentUserId) {
    return 0;
  }

  return messages.filter(
    (message) =>
      message.conversation_id === conversationId &&
      message.sender_id !== currentUserId &&
      !message.read_at
  ).length;
}

export function isMatchedOpenConversation(
  relationship: Relationship,
  conversation: Conversation
): boolean {
  return (
    relationship.id === conversation.relationship_id &&
    relationship.status === 'matched' &&
    conversation.status === 'open'
  );
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return null;
  }

  const user = await supabase.client.auth.getUser();
  return user.data.user?.id ?? null;
}

async function fetchProfilesByUserIds(userIds: string[]): Promise<Profile[]> {
  if (!userIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client.from('profiles').select('*').in('user_id', userIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchRelationshipsByIds(relationshipIds: string[]): Promise<Relationship[]> {
  if (!relationshipIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('relationships')
    .select('*')
    .in('id', relationshipIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchLatestMessagesForConversations(conversationIds: string[]): Promise<Message[]> {
  if (!conversationIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function buildMessagingConversation(
  conversation: Conversation,
  relationshipsById: Map<string, Relationship>,
  profilesByUserId: Map<string, Profile>,
  latestMessages: Message[],
  currentUserId: string | null
): MessagingConversation | null {
  const relationship = relationshipsById.get(conversation.relationship_id);

  if (!relationship || !isMatchedOpenConversation(relationship, conversation)) {
    return null;
  }

  return {
    conversation,
    relationship,
    userProfile: profilesByUserId.get(conversation.user_id) ?? null,
    latestMessage: latestMessageFor(conversation.id, latestMessages),
    unreadCount: unreadCountFor(conversation.id, currentUserId, latestMessages)
  };
}

export async function fetchConversations(): Promise<Conversation[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchJaredMessagingConversations(): Promise<MessagingConversation[]> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return [];
  }

  const { data: conversations, error } = await supabase.client
    .from('conversations')
    .select('*')
    .eq('jared_user_id', currentUserId)
    .eq('status', 'open')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  const openConversations = conversations ?? [];
  const relationshipIds = uniqueValues(
    openConversations.map((conversation) => conversation.relationship_id)
  );
  const userIds = uniqueValues(openConversations.map((conversation) => conversation.user_id));
  const [relationships, profiles, latestMessages] = await Promise.all([
    fetchRelationshipsByIds(relationshipIds),
    fetchProfilesByUserIds(userIds),
    fetchLatestMessagesForConversations(openConversations.map((conversation) => conversation.id))
  ]);
  const relationshipsById = new Map(
    relationships.map((relationship) => [relationship.id, relationship])
  );
  const profilesByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));

  return openConversations
    .map((conversation) =>
      buildMessagingConversation(
        conversation,
        relationshipsById,
        profilesByUserId,
        latestMessages,
        currentUserId
      )
    )
    .filter((item): item is MessagingConversation => Boolean(item));
}

export async function fetchJaredMessagingConversation(
  conversationId: string
): Promise<MessagingConversation | null> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return null;
  }
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return null;
  }

  const { data: conversation, error } = await supabase.client
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('jared_user_id', currentUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!conversation) {
    return null;
  }

  const [relationship, profiles, latestMessages] = await Promise.all([
    fetchRelationshipsByIds([conversation.relationship_id]),
    fetchProfilesByUserIds([conversation.user_id]),
    fetchLatestMessagesForConversations([conversation.id])
  ]);

  return buildMessagingConversation(
    conversation,
    new Map(relationship.map((item) => [item.id, item])),
    new Map(profiles.map((profile) => [profile.user_id, profile])),
    latestMessages,
    currentUserId
  );
}

export async function fetchNormalMessagingState(): Promise<NormalMessagingState> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return {
      state: 'blocked',
      currentUserId: null,
      title: 'Start the conversation',
      description: supabase.reason
    };
  }
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return {
      state: 'blocked',
      currentUserId: null,
      title: 'Start the conversation',
      description: 'Sign in after Jared matches back to open a private conversation.'
    };
  }

  const { data: relationships, error: relationshipError } = await supabase.client
    .from('relationships')
    .select('*')
    .eq('user_id', currentUserId)
    .order('updated_at', { ascending: false });

  if (relationshipError) {
    throw relationshipError;
  }

  const matchedRelationship = relationships?.find(
    (relationship) => relationship.status === 'matched'
  );

  if (!matchedRelationship) {
    return {
      state: 'blocked',
      currentUserId,
      title: 'Start the conversation',
      description: 'You can send a message only after You and Jared matched.'
    };
  }

  const { data: conversation, error: conversationError } = await supabase.client
    .from('conversations')
    .select('*')
    .eq('relationship_id', matchedRelationship.id)
    .eq('user_id', currentUserId)
    .maybeSingle();

  if (conversationError) {
    throw conversationError;
  }

  if (!conversation || conversation.status !== 'open') {
    return {
      state: 'blocked',
      currentUserId,
      title: 'You and Jared matched',
      description:
        'The conversation is not open yet, so messaging stays unavailable and no duplicate conversation is created.'
    };
  }

  const messages = await fetchMessages(conversation.id);
  const item = buildMessagingConversation(
    conversation,
    new Map([[matchedRelationship.id, matchedRelationship]]),
    new Map(),
    messages.slice().reverse(),
    currentUserId
  );

  if (!item) {
    return {
      state: 'blocked',
      currentUserId,
      title: 'Start the conversation',
      description: 'Messaging opens only for a matched relationship with an open conversation.'
    };
  }

  return {
    state: 'ready',
    currentUserId,
    item,
    messages
  };
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

export async function canSendMessage(conversationId: string, senderId: string): Promise<boolean> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return false;
  }

  const { data: conversation, error: conversationError } = await supabase.client
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();

  if (conversationError || !conversation || conversation.status !== 'open') {
    return false;
  }

  if (senderId !== conversation.user_id && senderId !== conversation.jared_user_id) {
    return false;
  }

  const { data: relationship, error: relationshipError } = await supabase.client
    .from('relationships')
    .select('*')
    .eq('id', conversation.relationship_id)
    .maybeSingle();

  return !relationshipError && relationship?.status === 'matched';
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  options?: DemoAwareOptions
): Promise<MutationResult<Message>> {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return { data: null, error: new Error('Message body is required.'), demoMode: false };
  }

  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<Message>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  if (!(await canSendMessage(conversationId, senderId))) {
    return createUnavailableMutationResult(
      'Messaging is available only for matched relationships with open conversations.'
    );
  }

  const { data, error } = await supabase.client
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body: trimmedBody })
    .select('*')
    .single();

  return { data, error, demoMode: false };
}

export async function sendCurrentUserMessage(
  conversationId: string,
  body: string,
  options?: DemoAwareOptions
): Promise<MutationResult<Message>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<Message>(null);
  }

  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return createUnavailableMutationResult('Sign in before sending a message.');
  }

  return sendMessage(conversationId, currentUserId, body, options);
}

export async function markReceivedMessagesRead(
  conversationId: string
): Promise<MutationResult<Message[]>> {
  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return createUnavailableMutationResult('Sign in before marking messages read.');
  }

  const { data, error } = await supabase.client
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', currentUserId)
    .is('read_at', null)
    .select('*');

  return { data: data ?? null, error, demoMode: false };
}

export function subscribeToConversationMessages(
  conversationId: string,
  onChange: () => void
): MessageSubscription {
  const supabase = getSupabase();

  if (!supabase.available) {
    return {
      realtime: false,
      reason: supabase.reason,
      unsubscribe: () => undefined
    };
  }

  const channel = supabase.client
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      () => onChange()
    )
    .subscribe();

  return {
    realtime: true,
    reason: null,
    unsubscribe: () => {
      void channel.unsubscribe();
    }
  };
}
