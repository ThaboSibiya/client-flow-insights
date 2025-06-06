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
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_history: {
        Row: {
          attachments: string[] | null
          created_at: string
          customer_id: string
          id: string
          message: string
          sender: string
          status: string
          subject: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          customer_id: string
          id?: string
          message: string
          sender: string
          status?: string
          subject: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          customer_id?: string
          id?: string
          message?: string
          sender?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ticket_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
          user_id: string
          user_name: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          ticket_id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          ticket_id: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          ticket_id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_internal: boolean | null
          ticket_id: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      ticket_satisfaction: {
        Row: {
          created_at: string
          customer_id: string
          feedback: string | null
          id: string
          rating: number
          ticket_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          feedback?: string | null
          id?: string
          rating: number
          ticket_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          feedback?: string | null
          id?: string
          rating?: number
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_satisfaction_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_satisfaction_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to_id: string | null
          assigned_to_name: string | null
          closed_at: string | null
          created_at: string
          customer_id: string
          description: string | null
          estimated_time_minutes: number | null
          id: string
          priority: string
          resolution_time_minutes: number | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to_id?: string | null
          assigned_to_name?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          priority?: string
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to_id?: string | null
          assigned_to_name?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          priority?: string
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
