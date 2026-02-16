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
      users: {
        Row: {
          id: string
          email: string
          name: string
          political_lean: string
          belief_profile: Json | null
          dialogues_participated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          political_lean: string
          belief_profile?: Json | null
          dialogues_participated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          political_lean?: string
          belief_profile?: Json | null
          dialogues_participated?: number
          created_at?: string
          updated_at?: string
        }
      }
      dialogues: {
        Row: {
          id: string
          topic: string
          description: string | null
          created_by: string
          status: string
          synthesis_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic: string
          description?: string | null
          created_by: string
          status?: string
          synthesis_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic?: string
          description?: string | null
          created_by?: string
          status?: string
          synthesis_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dialogue_participants: {
        Row: {
          id: string
          dialogue_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          dialogue_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          dialogue_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          dialogue_id: string
          user_id: string | null
          user_name: string
          user_lean: string | null
          content: string
          is_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          dialogue_id: string
          user_id?: string | null
          user_name: string
          user_lean?: string | null
          content: string
          is_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          dialogue_id?: string
          user_id?: string | null
          user_name?: string
          user_lean?: string | null
          content?: string
          is_ai?: boolean
          created_at?: string
        }
      }
      syntheses: {
        Row: {
          id: string
          dialogue_id: string
          topic: string
          synthesis: Json
          approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dialogue_id: string
          topic: string
          synthesis: Json
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dialogue_id?: string
          topic?: string
          synthesis?: Json
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      verifications: {
        Row: {
          id: string
          synthesis_id: string
          user_id: string
          decision: string
          created_at: string
        }
        Insert: {
          id?: string
          synthesis_id: string
          user_id: string
          decision: string
          created_at?: string
        }
        Update: {
          id?: string
          synthesis_id?: string
          user_id?: string
          decision?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
