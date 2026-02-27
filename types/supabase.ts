export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          anon_id: string
          content: string
          parent_id: string | null
          upvotes: number
          downvotes: number
          created_at: string
        }
        Insert: {
          id?: string
          anon_id: string
          content: string
          parent_id?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
        }
        Update: {
          id?: string
          anon_id?: string
          content?: string
          parent_id?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          post_id: string
          fingerprint: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          fingerprint: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          fingerprint?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_vote: {
        Args: { p_post_id: string; p_vote_type: string }
        Returns: undefined
      }
      decrement_vote: {
        Args: { p_post_id: string; p_vote_type: string }
        Returns: undefined
      }
      switch_vote: {
        Args: { p_post_id: string; p_old_type: string; p_new_type: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
