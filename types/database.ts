export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          photo_url?: string | null;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          photo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          photo_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          photo_url?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          from_user_id: string;
          to_item_id: string;
          to_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_item_id: string;
          to_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_item_id?: string;
          to_user_id?: string;
          created_at?: string;
        };
      };
      dislikes: {
        Row: {
          id: string;
          from_user_id: string;
          to_item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_item_id?: string;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          item_a_id: string;
          item_b_id: string;
          created_at: string;
          last_message_at: string | null;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          item_a_id: string;
          item_b_id: string;
          created_at?: string;
          last_message_at?: string | null;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          item_a_id?: string;
          item_b_id?: string;
          last_message_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          text: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          text: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          text?: string;
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_mutual_likes: {
        Args: {
          user_a: string;
          user_b: string;
        };
        Returns: {
          has_mutual_likes: boolean;
          item_a_id: string | null;
          item_b_id: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
