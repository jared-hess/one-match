import type {
  Conversation,
  DeletionRequest,
  JaredNote,
  JaredProfile,
  Json,
  Message,
  Profile,
  Relationship,
  Swipe
} from './domain';

type RowTable<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProfileInsert = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & {
  user_id: string;
  role?: 'user';
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'role'>> & {
  role?: 'user';
};

export type JaredProfileInsert = Partial<Omit<JaredProfile, 'id' | 'created_at' | 'updated_at'>> & {
  slug: string;
  internal_label: string;
  bio: string;
};

export type JaredProfileUpdate = Partial<Omit<JaredProfile, 'id' | 'created_at' | 'updated_at'>>;

export type MessageInsert = Pick<Message, 'conversation_id' | 'sender_id' | 'body'>;

export interface Database {
  public: {
    Tables: {
      profiles: RowTable<Profile, ProfileInsert, ProfileUpdate>;
      jared_profiles: RowTable<JaredProfile, JaredProfileInsert, JaredProfileUpdate>;
      swipes: RowTable<Swipe>;
      relationships: RowTable<Relationship>;
      conversations: RowTable<Conversation>;
      messages: RowTable<Message, MessageInsert>;
      jared_notes: RowTable<JaredNote>;
      deletion_requests: RowTable<DeletionRequest>;
    };
    Views: Record<string, never>;
    Functions: {
      record_swipe: {
        Args: {
          p_jared_profile_id: string;
          p_direction: Swipe['direction'];
        };
        Returns: Swipe;
      };
      jared_decide_relationship: {
        Args: {
          p_relationship_id: string;
          p_status: Relationship['status'];
        };
        Returns: Relationship;
      };
      ensure_conversation_for_match: {
        Args: {
          p_relationship_id: string;
        };
        Returns: Conversation;
      };
      request_deletion: {
        Args: Record<string, never>;
        Returns: DeletionRequest;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, Json>;
  };
}
