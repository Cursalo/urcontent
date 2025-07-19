export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_questions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          correct: boolean | null
          created_at: string
          id: string
          question_data: Json
          source: string | null
          updated_at: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          correct?: boolean | null
          created_at?: string
          id?: string
          question_data: Json
          source?: string | null
          updated_at?: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          correct?: boolean | null
          created_at?: string
          id?: string
          question_data?: Json
          source?: string | null
          updated_at?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          device_type: string | null
          focus_metrics: Json | null
          id: string
          module_scores: Json | null
          score_estimate: number | null
          session_recording_url: string | null
          session_type: Database["public"]["Enums"]["session_type_enum"]
          started_at: string | null
          time_spent: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          device_type?: string | null
          focus_metrics?: Json | null
          id?: string
          module_scores?: Json | null
          score_estimate?: number | null
          session_recording_url?: string | null
          session_type: Database["public"]["Enums"]["session_type_enum"]
          started_at?: string | null
          time_spent?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          device_type?: string | null
          focus_metrics?: Json | null
          id?: string
          module_scores?: Json | null
          score_estimate?: number | null
          session_recording_url?: string | null
          session_type?: Database["public"]["Enums"]["session_type_enum"]
          started_at?: string | null
          time_spent?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          ai_generated: boolean | null
          approved_by: string | null
          average_time_spent: number | null
          content: string
          correct_answer: number
          created_at: string | null
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_enum"]
          domain: Database["public"]["Enums"]["domain_enum"]
          effectiveness_score: number | null
          explanation: string | null
          id: string
          options: Json
          skill: string
          source: string | null
          times_answered: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          approved_by?: string | null
          average_time_spent?: number | null
          content: string
          correct_answer: number
          created_at?: string | null
          created_by?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_enum"]
          domain: Database["public"]["Enums"]["domain_enum"]
          effectiveness_score?: number | null
          explanation?: string | null
          id?: string
          options: Json
          skill: string
          source?: string | null
          times_answered?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          approved_by?: string | null
          average_time_spent?: number | null
          content?: string
          correct_answer?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_enum"]
          domain?: Database["public"]["Enums"]["domain_enum"]
          effectiveness_score?: number | null
          explanation?: string | null
          id?: string
          options?: Json
          skill?: string
          source?: string | null
          times_answered?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          message_type: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          message_type?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          message_type?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          group_type: string | null
          id: string
          max_members: number | null
          name: string
          target_test_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          max_members?: number | null
          name: string
          target_test_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          max_members?: number | null
          name?: string
          target_test_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          created_at: string | null
          current_score: number | null
          id: string
          is_active: boolean | null
          name: string
          plan_data: Json | null
          target_date: string | null
          target_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_score?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          plan_data?: Json | null
          target_date?: string | null
          target_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_score?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          plan_data?: Json | null
          target_date?: string | null
          target_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tutoring_sessions: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          meeting_url: string | null
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          status: string | null
          student_id: string
          subject: Database["public"]["Enums"]["domain_enum"]
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          status?: string | null
          student_id: string
          subject: Database["public"]["Enums"]["domain_enum"]
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string
          subject?: Database["public"]["Enums"]["domain_enum"]
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutoring_sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tutors: {
        Row: {
          availability: Json | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          hourly_rate: number | null
          rating: number | null
          subjects: Json | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          hourly_rate?: number | null
          rating?: number | null
          subjects?: Json | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          hourly_rate?: number | null
          rating?: number | null
          subjects?: Json | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          hint_used: boolean | null
          id: string
          is_correct: boolean | null
          question_id: string
          session_id: string
          time_spent: number | null
          user_answer: number | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          session_id: string
          time_spent?: number | null
          user_answer?: number | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          session_id?: string
          time_spent?: number | null
          user_answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          age: number | null
          age_group: Database["public"]["Enums"]["age_group_enum"] | null
          city: string | null
          country: string | null
          created_at: string
          first_name: string
          has_score_report: boolean | null
          id: string
          last_name: string
          linkedin_url: string | null
          motivation: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          preferences: Json | null
          sat_score: number | null
          score_report: string | null
          score_report_text: string | null
          score_report_url: string | null
          subscription_plan: string
          target_date: string | null
          target_sat_score: number
          time_zone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Insert: {
          age?: number | null
          age_group?: Database["public"]["Enums"]["age_group_enum"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name: string
          has_score_report?: boolean | null
          id?: string
          last_name: string
          linkedin_url?: string | null
          motivation?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferences?: Json | null
          sat_score?: number | null
          score_report?: string | null
          score_report_text?: string | null
          score_report_url?: string | null
          subscription_plan?: string
          target_date?: string | null
          target_sat_score: number
          time_zone?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Update: {
          age?: number | null
          age_group?: Database["public"]["Enums"]["age_group_enum"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string
          has_score_report?: boolean | null
          id?: string
          last_name?: string
          linkedin_url?: string | null
          motivation?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferences?: Json | null
          sat_score?: number | null
          score_report?: string | null
          score_report_text?: string | null
          score_report_url?: string | null
          subscription_plan?: string
          target_date?: string | null
          target_sat_score?: number
          time_zone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_tests: number
          correct_answers_count: number
          created_at: string
          id: string
          last_test_date: string | null
          tree_sync_timestamp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_tests?: number
          correct_answers_count?: number
          created_at?: string
          id?: string
          last_test_date?: string | null
          tree_sync_timestamp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_tests?: number
          correct_answers_count?: number
          created_at?: string
          id?: string
          last_test_date?: string | null
          tree_sync_timestamp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      age_group_enum: "18-22" | "23-29" | "30-39" | "40+"
      difficulty_enum: "easy" | "medium" | "hard"
      domain_enum: "reading" | "writing" | "math"
      session_type_enum: "practice" | "mock_test" | "diagnostic"
      user_type_enum: "student" | "professional" | "military" | "international"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never