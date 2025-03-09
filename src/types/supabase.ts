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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          notification_preferences: Json
          timezone: string
          language: string
          theme: string
          created_at: string
          updated_at: string
          last_active_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          timezone?: string
          language?: string
          theme?: string
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          timezone?: string
          language?: string
          theme?: string
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: number
          status: 'pending' | 'in_progress' | 'completed' | 'archived'
          due_date: string | null
          ai_priority_score: number | null
          completed_at: string | null
          category: string | null
          tags: string[] | null
          parent_task_id: string | null
          estimated_duration: number | null
          actual_duration: number | null
          recurring_pattern: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'archived'
          due_date?: string | null
          ai_priority_score?: number | null
          completed_at?: string | null
          category?: string | null
          tags?: string[] | null
          parent_task_id?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'archived'
          due_date?: string | null
          ai_priority_score?: number | null
          completed_at?: string | null
          category?: string | null
          tags?: string[] | null
          parent_task_id?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          task_id: string
          reminder_time: string
          status: 'pending' | 'sent' | 'cancelled'
          type: 'one_time' | 'recurring'
          recurrence_rule: string | null
          notification_method: string[]
          custom_message: string | null
          created_at: string
          updated_at: string
          notification_id: string | null
        }
        Insert: {
          id?: string
          task_id: string
          reminder_time: string
          status?: 'pending' | 'sent' | 'cancelled'
          type?: 'one_time' | 'recurring'
          recurrence_rule?: string | null
          notification_method?: string[]
          custom_message?: string | null
          created_at?: string
          updated_at?: string
          notification_id?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          reminder_time?: string
          status?: 'pending' | 'sent' | 'cancelled'
          type?: 'one_time' | 'recurring'
          recurrence_rule?: string | null
          notification_method?: string[]
          custom_message?: string | null
          created_at?: string
          updated_at?: string
          notification_id?: string | null
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