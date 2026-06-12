export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'user' | 'jared';
export type SwipeDirection = 'left' | 'right' | 'super';
export type RelationshipStatus = 'pending' | 'matched' | 'passed' | 'unmatched' | 'archived';
export type ConversationStatus = 'open' | 'archived';
export type DeletionRequestStatus = 'requested' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  role: UserRole;
  display_name: string | null;
  city: string | null;
  bio: string | null;
  looking_for: string | null;
  good_first_date: string | null;
  social_link: string | null;
  photo_urls: string[];
  age_confirmed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JaredProfile {
  id: string;
  slug: string;
  internal_label: string;
  display_name: string;
  age_label: string;
  location: string;
  bio: string;
  prompts: Json;
  tags: string[];
  image_urls: string[];
  sort_order: number;
  demo_eligible: boolean;
  active: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  jared_profile_id: string;
  direction: SwipeDirection;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  user_id: string;
  jared_user_id: string;
  status: RelationshipStatus;
  first_liked_profile_id: string | null;
  latest_liked_profile_id: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  relationship_id: string;
  user_id: string;
  jared_user_id: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface JaredNote {
  id: string;
  relationship_id: string;
  author_user_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface DeletionRequest {
  id: string;
  user_id: string;
  status: DeletionRequestStatus;
  requested_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DemoAwareOptions = {
  demoMode?: boolean;
};

export type MutationResult<T> = {
  data: T | null;
  error: Error | null;
  demoMode: boolean;
};
