import { createDemoMutationResult, createUnavailableMutationResult, isDemoModeEnabled } from './demoMode';
import { getSupabase } from './supabase';
import type {
  Conversation,
  DemoAwareOptions,
  InboundRelationshipContext,
  JaredNote,
  JaredProfile,
  Message,
  MutationResult,
  Profile,
  Relationship,
  RelationshipDecisionResult,
  RelationshipStatus,
  Swipe
} from '../types';

export async function fetchOwnRelationships(): Promise<Relationship[]> {
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
    .from('relationships')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

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

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function isLikedSwipe(swipe: Swipe): boolean {
  return swipe.direction === 'right' || swipe.direction === 'super';
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

async function fetchJaredProfilesByIds(profileIds: string[]): Promise<JaredProfile[]> {
  if (!profileIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client.from('jared_profiles').select('*').in('id', profileIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchLikedSwipesForUsers(userIds: string[]): Promise<Swipe[]> {
  if (!userIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('swipes')
    .select('*')
    .in('user_id', userIds)
    .in('direction', ['right', 'super'])
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).filter(isLikedSwipe);
}

async function fetchNotesForRelationships(relationshipIds: string[]): Promise<JaredNote[]> {
  if (!relationshipIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('jared_notes')
    .select('*')
    .in('relationship_id', relationshipIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchConversationsForRelationships(relationshipIds: string[]): Promise<Conversation[]> {
  if (!relationshipIds.length) {
    return [];
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return [];
  }

  const { data, error } = await supabase.client
    .from('conversations')
    .select('*')
    .in('relationship_id', relationshipIds)
    .order('updated_at', { ascending: false });

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

export function isProfileCompleteForJared(profile: Profile | null): boolean {
  return Boolean(profile?.display_name?.trim() && profile.city?.trim() && profile.age_confirmed);
}

export async function fetchJaredInboundContexts(status?: RelationshipStatus): Promise<InboundRelationshipContext[]> {
  const relationships = await fetchJaredRelationships(status);
  const relationshipIds = relationships.map((relationship) => relationship.id);
  const userIds = uniqueValues(relationships.map((relationship) => relationship.user_id));
  const directProfileIds = uniqueValues(
    relationships.flatMap((relationship) => [relationship.first_liked_profile_id, relationship.latest_liked_profile_id])
  );

  const [profiles, swipes, notes, conversations] = await Promise.all([
    fetchProfilesByUserIds(userIds),
    fetchLikedSwipesForUsers(userIds),
    fetchNotesForRelationships(relationshipIds),
    fetchConversationsForRelationships(relationshipIds)
  ]);
  const allLikedProfileIds = uniqueValues([...directProfileIds, ...swipes.map((swipe) => swipe.jared_profile_id)]);
  const jaredProfiles = await fetchJaredProfilesByIds(allLikedProfileIds);
  const latestMessages = await fetchLatestMessagesForConversations(conversations.map((conversation) => conversation.id));

  const profilesByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const jaredProfileById = byId(jaredProfiles);
  const swipesByUserId = new Map<string, Swipe[]>();
  const notesByRelationshipId = new Map<string, JaredNote[]>();
  const conversationByRelationshipId = new Map(conversations.map((conversation) => [conversation.relationship_id, conversation]));
  const latestMessageByConversationId = new Map<string, Message>();

  swipes.forEach((swipe) => {
    swipesByUserId.set(swipe.user_id, [...(swipesByUserId.get(swipe.user_id) ?? []), swipe]);
  });

  notes.forEach((note) => {
    notesByRelationshipId.set(note.relationship_id, [...(notesByRelationshipId.get(note.relationship_id) ?? []), note]);
  });

  latestMessages.forEach((message) => {
    if (!latestMessageByConversationId.has(message.conversation_id)) {
      latestMessageByConversationId.set(message.conversation_id, message);
    }
  });

  return relationships.map((relationship) => {
    const likedProfileIds = uniqueValues([
      relationship.first_liked_profile_id,
      ...(swipesByUserId.get(relationship.user_id) ?? []).map((swipe) => swipe.jared_profile_id),
      relationship.latest_liked_profile_id
    ]);
    const conversation = conversationByRelationshipId.get(relationship.id) ?? null;

    return {
      relationship,
      userProfile: profilesByUserId.get(relationship.user_id) ?? null,
      likedProfiles: likedProfileIds.flatMap((profileId) => {
        const profile = jaredProfileById.get(profileId);
        return profile ? [profile] : [];
      }),
      firstLikedProfile: relationship.first_liked_profile_id ? jaredProfileById.get(relationship.first_liked_profile_id) ?? null : null,
      latestLikedProfile: relationship.latest_liked_profile_id ? jaredProfileById.get(relationship.latest_liked_profile_id) ?? null : null,
      notes: notesByRelationshipId.get(relationship.id) ?? [],
      conversation,
      latestMessage: conversation ? latestMessageByConversationId.get(conversation.id) ?? null : null
    } satisfies InboundRelationshipContext;
  });
}

export async function fetchJaredInboundContext(id: string): Promise<InboundRelationshipContext | null> {
  const contexts = await fetchJaredInboundContexts();

  return contexts.find((context) => context.relationship.id === id) ?? null;
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

export async function matchRelationshipBack(
  relationshipId: string,
  options?: DemoAwareOptions
): Promise<MutationResult<RelationshipDecisionResult>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<RelationshipDecisionResult>({ relationship: null, conversation: null });
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const decision = await decideRelationship(relationshipId, 'matched', options);

  if (decision.error) {
    return { data: null, error: decision.error, demoMode: false };
  }

  const { data: conversation, error } = await supabase.client.rpc('ensure_conversation_for_match', {
    p_relationship_id: relationshipId
  });

  return {
    data: {
      relationship: decision.data,
      conversation
    },
    error,
    demoMode: false
  };
}

export async function addJaredNote(
  relationshipId: string,
  note: string,
  options?: DemoAwareOptions
): Promise<MutationResult<JaredNote>> {
  if (isDemoModeEnabled(options)) {
    return createDemoMutationResult<JaredNote>(null);
  }

  const supabase = getSupabase();

  if (!supabase.available) {
    return createUnavailableMutationResult(supabase.reason);
  }

  const user = await supabase.client.auth.getUser();
  const authorUserId = user.data.user?.id;

  if (!authorUserId) {
    return createUnavailableMutationResult('Sign in as Jared before adding a private note.');
  }

  const trimmedNote = note.trim();

  if (!trimmedNote) {
    return createUnavailableMutationResult('Write a note before saving it.');
  }

  const { data, error } = await supabase.client
    .from('jared_notes')
    .insert({ relationship_id: relationshipId, author_user_id: authorUserId, note: trimmedNote })
    .select('*')
    .single();

  return { data, error, demoMode: false };
}

export function isRelationshipActionable(relationship: Relationship): boolean {
  return relationship.status === 'pending';
}

export function isRelationshipMatched(relationship: Relationship | null): boolean {
  return relationship?.status === 'matched';
}
