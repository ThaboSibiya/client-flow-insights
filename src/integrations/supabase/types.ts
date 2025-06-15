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
      conversations: {
        Row: {
          company_owner_id: string
          created_at: string
          customer_id: string | null
          employee_id: string | null
          id: string
          last_message_at: string | null
          status: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          company_owner_id: string
          created_at?: string
          customer_id?: string | null
          employee_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          company_owner_id?: string
          created_at?: string
          customer_id?: string | null
          employee_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
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
      employee_attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_login_history: {
        Row: {
          employee_id: string
          id: string
          ip_address: string | null
          login_timestamp: string
          user_agent: string | null
        }
        Insert: {
          employee_id: string
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_agent?: string | null
        }
        Update: {
          employee_id?: string
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_login_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_privileges: {
        Row: {
          can_create_quotes: boolean | null
          can_delete_customers: boolean | null
          can_delete_quotes: boolean | null
          can_edit_customers: boolean | null
          can_edit_quotes: boolean | null
          can_manage_company_settings: boolean | null
          can_manage_employees: boolean | null
          can_view_analytics: boolean | null
          can_view_customers: boolean | null
          can_view_quotes: boolean | null
          created_at: string
          employee_id: string
          id: string
          privilege_description: string | null
          privilege_name: string
          updated_at: string
        }
        Insert: {
          can_create_quotes?: boolean | null
          can_delete_customers?: boolean | null
          can_delete_quotes?: boolean | null
          can_edit_customers?: boolean | null
          can_edit_quotes?: boolean | null
          can_manage_company_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_view_analytics?: boolean | null
          can_view_customers?: boolean | null
          can_view_quotes?: boolean | null
          created_at?: string
          employee_id: string
          id?: string
          privilege_description?: string | null
          privilege_name: string
          updated_at?: string
        }
        Update: {
          can_create_quotes?: boolean | null
          can_delete_customers?: boolean | null
          can_delete_quotes?: boolean | null
          can_edit_customers?: boolean | null
          can_edit_quotes?: boolean | null
          can_manage_company_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_view_analytics?: boolean | null
          can_view_customers?: boolean | null
          can_view_quotes?: boolean | null
          created_at?: string
          employee_id?: string
          id?: string
          privilege_description?: string | null
          privilege_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_privileges_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_owner_id: string
          created_at: string
          department: string | null
          designation: string
          email: string
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          manager_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["employee_role"]
          salary: number | null
          status: Database["public"]["Enums"]["employee_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_owner_id: string
          created_at?: string
          department?: string | null
          designation: string
          email: string
          employee_number: string
          first_name: string
          hire_date?: string
          id?: string
          last_name: string
          manager_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_owner_id?: string
          created_at?: string
          department?: string | null
          designation?: string
          email?: string
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          manager_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      file_access_history: {
        Row: {
          accessed_at: string
          action: string
          employee_id: string
          file_path: string
          id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          employee_id: string
          file_path: string
          id?: string
        }
        Update: {
          accessed_at?: string
          action?: string
          employee_id?: string
          file_path?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_access_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          company_owner_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          form_data: Json
          form_name: string
          id: string
          ip_address: string | null
          processed: boolean | null
          source_url: string | null
          user_agent: string | null
        }
        Insert: {
          company_owner_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          form_data: Json
          form_name: string
          id?: string
          ip_address?: string | null
          processed?: boolean | null
          source_url?: string | null
          user_agent?: string | null
        }
        Update: {
          company_owner_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          form_data?: Json
          form_name?: string
          id?: string
          ip_address?: string | null
          processed?: boolean | null
          source_url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_count: number | null
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          metadata: Json | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string
          sender_phone: string | null
          sender_type: string
        }
        Insert: {
          attachment_count?: number | null
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type: string
          metadata?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name: string
          sender_phone?: string | null
          sender_type: string
        }
        Update: {
          attachment_count?: number | null
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          metadata?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_phone?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          desktop_notifications: boolean
          email_notifications: boolean
          id: string
          notification_frequency: string
          push_notifications: boolean
          sound_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          desktop_notifications?: boolean
          email_notifications?: boolean
          id?: string
          notification_frequency?: string
          push_notifications?: boolean
          sound_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          desktop_notifications?: boolean
          email_notifications?: boolean
          id?: string
          notification_frequency?: string
          push_notifications?: boolean
          sound_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      quote_invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quote_invoice_id: string
          rate: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quote_invoice_id: string
          rate?: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quote_invoice_id?: string
          rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_invoice_items_quote_invoice_id_fkey"
            columns: ["quote_invoice_id"]
            isOneToOne: false
            referencedRelation: "quotes_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes_invoices: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          discount: number
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          number: string
          status: Database["public"]["Enums"]["quote_invoice_status"]
          subject: string | null
          subtotal: number
          tax: number
          terms: string | null
          total: number
          type: Database["public"]["Enums"]["quote_invoice_type"]
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number: string
          status?: Database["public"]["Enums"]["quote_invoice_status"]
          subject?: string | null
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          type: Database["public"]["Enums"]["quote_invoice_type"]
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          status?: Database["public"]["Enums"]["quote_invoice_status"]
          subject?: string | null
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          type?: Database["public"]["Enums"]["quote_invoice_type"]
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      generate_employee_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      employee_role: "admin" | "manager" | "supervisor" | "employee" | "intern"
      employee_status: "active" | "inactive" | "suspended" | "terminated"
      quote_invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "overdue"
        | "accepted"
        | "rejected"
      quote_invoice_type: "quote" | "invoice"
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
    Enums: {
      employee_role: ["admin", "manager", "supervisor", "employee", "intern"],
      employee_status: ["active", "inactive", "suspended", "terminated"],
      quote_invoice_status: [
        "draft",
        "sent",
        "paid",
        "overdue",
        "accepted",
        "rejected",
      ],
      quote_invoice_type: ["quote", "invoice"],
    },
  },
} as const
