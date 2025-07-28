export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      automation_permissions: {
        Row: {
          automation_id: string
          created_at: string | null
          employee_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_level: string
        }
        Insert: {
          automation_id: string
          created_at?: string | null
          employee_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string
        }
        Update: {
          automation_id?: string
          created_at?: string | null
          employee_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_settings: {
        Row: {
          auto_create_invoice_from_quote: boolean
          created_at: string
          email_auto_send: boolean
          email_message: string | null
          email_subject: string | null
          email_template: string
          final_follow_up_days: number
          first_follow_up_days: number
          follow_up_enabled: boolean
          id: string
          mark_overdue_after_days: number
          reminder_template: string | null
          second_follow_up_days: number
          send_on_create: boolean
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_template: string | null
        }
        Insert: {
          auto_create_invoice_from_quote?: boolean
          created_at?: string
          email_auto_send?: boolean
          email_message?: string | null
          email_subject?: string | null
          email_template?: string
          final_follow_up_days?: number
          first_follow_up_days?: number
          follow_up_enabled?: boolean
          id?: string
          mark_overdue_after_days?: number
          reminder_template?: string | null
          second_follow_up_days?: number
          send_on_create?: boolean
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_template?: string | null
        }
        Update: {
          auto_create_invoice_from_quote?: boolean
          created_at?: string
          email_auto_send?: boolean
          email_message?: string | null
          email_subject?: string | null
          email_template?: string
          final_follow_up_days?: number
          first_follow_up_days?: number
          follow_up_enabled?: boolean
          id?: string
          mark_overdue_after_days?: number
          reminder_template?: string | null
          second_follow_up_days?: number
          send_on_create?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_template?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
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
      customer_custom_data: {
        Row: {
          created_at: string | null
          customer_id: string | null
          field_id: string | null
          field_value: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          field_id?: string | null
          field_value?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          field_id?: string | null
          field_value?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_custom_data_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_custom_data_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "template_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_equipment: {
        Row: {
          brand: string | null
          created_at: string
          customer_id: string
          equipment_type: string
          id: string
          model: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          updated_at: string
          user_id: string
          warranty_expiry: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          customer_id: string
          equipment_type?: string
          id?: string
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id: string
          warranty_expiry?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          customer_id?: string
          equipment_type?: string
          id?: string
          model?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_equipment_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_templates: {
        Row: {
          applied_at: string | null
          customer_id: string | null
          id: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          customer_id?: string | null
          id?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          customer_id?: string | null
          id?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_templates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          company_address: string | null
          contact_person: string | null
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
          address?: string | null
          company_address?: string | null
          contact_person?: string | null
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
          address?: string | null
          company_address?: string | null
          contact_person?: string | null
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
      email_attachments: {
        Row: {
          attachment_id: string | null
          content_type: string
          created_at: string
          email_id: string
          file_path: string | null
          filename: string
          id: string
          is_downloaded: boolean
          size_bytes: number
          user_id: string
        }
        Insert: {
          attachment_id?: string | null
          content_type: string
          created_at?: string
          email_id: string
          file_path?: string | null
          filename: string
          id?: string
          is_downloaded?: boolean
          size_bytes: number
          user_id: string
        }
        Update: {
          attachment_id?: string | null
          content_type?: string
          created_at?: string
          email_id?: string
          file_path?: string | null
          filename?: string
          id?: string
          is_downloaded?: boolean
          size_bytes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
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
      email_integrations: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          provider_id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider_id: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider_id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_sync_status: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          last_sync_token: string | null
          provider_id: string
          sync_status: string
          total_emails_synced: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_token?: string | null
          provider_id: string
          sync_status?: string
          total_emails_synced?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_token?: string | null
          provider_id?: string
          sync_status?: string
          total_emails_synced?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_threads: {
        Row: {
          created_at: string
          id: string
          labels: Json | null
          last_message_at: string
          message_count: number
          participants: Json
          provider_id: string
          subject: string
          thread_id: string
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          labels?: Json | null
          last_message_at: string
          message_count?: number
          participants?: Json
          provider_id: string
          subject: string
          thread_id: string
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          labels?: Json | null
          last_message_at?: string
          message_count?: number
          participants?: Json
          provider_id?: string
          subject?: string
          thread_id?: string
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          bcc_emails: Json | null
          body_html: string | null
          body_text: string | null
          cc_emails: Json | null
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          importance: string | null
          is_draft: boolean
          is_read: boolean
          is_sent: boolean
          labels: Json | null
          message_date: string
          provider_id: string
          provider_message_id: string
          reply_to: string | null
          subject: string
          thread_id: string
          to_emails: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          bcc_emails?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          importance?: string | null
          is_draft?: boolean
          is_read?: boolean
          is_sent?: boolean
          labels?: Json | null
          message_date: string
          provider_id: string
          provider_message_id: string
          reply_to?: string | null
          subject: string
          thread_id: string
          to_emails: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          bcc_emails?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          importance?: string | null
          is_draft?: boolean
          is_read?: boolean
          is_sent?: boolean
          labels?: Json | null
          message_date?: string
          provider_id?: string
          provider_message_id?: string
          reply_to?: string | null
          subject?: string
          thread_id?: string
          to_emails?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "email_threads"
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
      employee_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string
          email: string
          employee_id: string
          expires_at: string | null
          id: string
          invitation_token: string
          is_used: boolean | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          created_by: string
          email: string
          employee_id: string
          expires_at?: string | null
          id?: string
          invitation_token: string
          is_used?: boolean | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string
          email?: string
          employee_id?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string
          is_used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_employee_id_fkey"
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
          automation_scope: string | null
          can_access_customer_pii: boolean | null
          can_access_financial_automations: boolean | null
          can_access_sensitive_automations: boolean | null
          can_create_automations: boolean | null
          can_create_quotes: boolean | null
          can_delete_automations: boolean | null
          can_delete_customers: boolean | null
          can_delete_quotes: boolean | null
          can_edit_automations: boolean | null
          can_edit_basic_settings: boolean | null
          can_edit_billing_settings: boolean | null
          can_edit_customers: boolean | null
          can_edit_integration_settings: boolean | null
          can_edit_quotes: boolean | null
          can_edit_security_settings: boolean | null
          can_execute_automations: boolean | null
          can_export_customer_data: boolean | null
          can_manage_automation_permissions: boolean | null
          can_manage_company_settings: boolean | null
          can_manage_employee_settings: boolean | null
          can_manage_employees: boolean | null
          can_modify_pricing_automations: boolean | null
          can_update_customer_status_onsite: boolean | null
          can_view_analytics: boolean | null
          can_view_automations: boolean | null
          can_view_company_settings: boolean | null
          can_view_customers: boolean | null
          can_view_quotes: boolean | null
          created_at: string
          customer_access_scope: string | null
          employee_id: string
          id: string
          privilege_description: string | null
          privilege_name: string
          requires_financial_approval: boolean | null
          updated_at: string
        }
        Insert: {
          automation_scope?: string | null
          can_access_customer_pii?: boolean | null
          can_access_financial_automations?: boolean | null
          can_access_sensitive_automations?: boolean | null
          can_create_automations?: boolean | null
          can_create_quotes?: boolean | null
          can_delete_automations?: boolean | null
          can_delete_customers?: boolean | null
          can_delete_quotes?: boolean | null
          can_edit_automations?: boolean | null
          can_edit_basic_settings?: boolean | null
          can_edit_billing_settings?: boolean | null
          can_edit_customers?: boolean | null
          can_edit_integration_settings?: boolean | null
          can_edit_quotes?: boolean | null
          can_edit_security_settings?: boolean | null
          can_execute_automations?: boolean | null
          can_export_customer_data?: boolean | null
          can_manage_automation_permissions?: boolean | null
          can_manage_company_settings?: boolean | null
          can_manage_employee_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_modify_pricing_automations?: boolean | null
          can_update_customer_status_onsite?: boolean | null
          can_view_analytics?: boolean | null
          can_view_automations?: boolean | null
          can_view_company_settings?: boolean | null
          can_view_customers?: boolean | null
          can_view_quotes?: boolean | null
          created_at?: string
          customer_access_scope?: string | null
          employee_id: string
          id?: string
          privilege_description?: string | null
          privilege_name: string
          requires_financial_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          automation_scope?: string | null
          can_access_customer_pii?: boolean | null
          can_access_financial_automations?: boolean | null
          can_access_sensitive_automations?: boolean | null
          can_create_automations?: boolean | null
          can_create_quotes?: boolean | null
          can_delete_automations?: boolean | null
          can_delete_customers?: boolean | null
          can_delete_quotes?: boolean | null
          can_edit_automations?: boolean | null
          can_edit_basic_settings?: boolean | null
          can_edit_billing_settings?: boolean | null
          can_edit_customers?: boolean | null
          can_edit_integration_settings?: boolean | null
          can_edit_quotes?: boolean | null
          can_edit_security_settings?: boolean | null
          can_execute_automations?: boolean | null
          can_export_customer_data?: boolean | null
          can_manage_automation_permissions?: boolean | null
          can_manage_company_settings?: boolean | null
          can_manage_employee_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_modify_pricing_automations?: boolean | null
          can_update_customer_status_onsite?: boolean | null
          can_view_analytics?: boolean | null
          can_view_automations?: boolean | null
          can_view_company_settings?: boolean | null
          can_view_customers?: boolean | null
          can_view_quotes?: boolean | null
          created_at?: string
          customer_access_scope?: string | null
          employee_id?: string
          id?: string
          privilege_description?: string | null
          privilege_name?: string
          requires_financial_approval?: boolean | null
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
          auth_user_id: string | null
          company_owner_id: string
          created_at: string
          department: string | null
          designation: string
          email: string
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_token: string | null
          is_invited: boolean | null
          last_login_at: string | null
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
          auth_user_id?: string | null
          company_owner_id: string
          created_at?: string
          department?: string | null
          designation: string
          email: string
          employee_number: string
          first_name: string
          hire_date?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          is_invited?: boolean | null
          last_login_at?: string | null
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
          auth_user_id?: string | null
          company_owner_id?: string
          created_at?: string
          department?: string | null
          designation?: string
          email?: string
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          is_invited?: boolean | null
          last_login_at?: string | null
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
      industry_customer_templates: {
        Row: {
          created_at: string
          field_definitions: Json
          id: string
          industry: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_definitions: Json
          id?: string
          industry: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_definitions?: Json
          id?: string
          industry?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      industry_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      job_completions: {
        Row: {
          after_status: string | null
          before_status: string | null
          completed_at: string | null
          created_at: string | null
          customer_id: string
          employee_id: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          notes: string | null
        }
        Insert: {
          after_status?: string | null
          before_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_id: string
          employee_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
        }
        Update: {
          after_status?: string | null
          before_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string
          employee_id?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_completions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_completions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          updated_at?: string
          user_id?: string
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
      privilege_change_audit: {
        Row: {
          changed_by: string
          created_at: string | null
          employee_id: string
          id: string
          ip_address: unknown | null
          new_value: boolean | null
          old_value: boolean | null
          privilege_name: string
          reason: string | null
        }
        Insert: {
          changed_by: string
          created_at?: string | null
          employee_id: string
          id?: string
          ip_address?: unknown | null
          new_value?: boolean | null
          old_value?: boolean | null
          privilege_name: string
          reason?: string | null
        }
        Update: {
          changed_by?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          ip_address?: unknown | null
          new_value?: boolean | null
          old_value?: boolean | null
          privilege_name?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privilege_change_audit_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privilege_change_audit_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_type: string | null
          company: string | null
          company_address: string | null
          company_email: string | null
          company_logo_url: string | null
          company_phone: string | null
          created_at: string
          email: string | null
          employee_count: number | null
          first_name: string | null
          id: string
          industry: string | null
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_type?: string | null
          company?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_phone?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          id: string
          industry?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_type?: string | null
          company?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_phone?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
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
      scheduled_calls: {
        Row: {
          call_type: string
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          priority: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          call_type: string
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          priority?: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          call_type?: string
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          priority?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_calls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      template_fields: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_required: boolean | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: string
          id?: string
          is_required?: boolean | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_fields_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
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
      complete_employee_registration: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      create_employee_invitation: {
        Args: { p_employee_id: string; p_email: string; p_created_by: string }
        Returns: string
      }
      generate_employee_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_email_history: {
        Args: { customer_id_param: string }
        Returns: {
          attachments: string[] | null
          created_at: string
          customer_id: string
          id: string
          message: string
          sender: string
          status: string
          subject: string
        }[]
      }
      insert_email_history: {
        Args: {
          p_customer_id: string
          p_sender: string
          p_subject: string
          p_message: string
          p_attachments?: string[]
          p_status?: string
        }
        Returns: string
      }
      log_privilege_change: {
        Args: {
          p_employee_id: string
          p_privilege_name: string
          p_old_value: boolean
          p_new_value: boolean
          p_reason?: string
        }
        Returns: undefined
      }
      validate_invitation_token: {
        Args: { p_token: string }
        Returns: {
          employee_id: string
          email: string
          is_valid: boolean
          employee_data: Json
        }[]
      }
    }
    Enums: {
      employee_role:
        | "admin"
        | "manager"
        | "supervisor"
        | "employee"
        | "intern"
        | "onsite_worker"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      employee_role: [
        "admin",
        "manager",
        "supervisor",
        "employee",
        "intern",
        "onsite_worker",
      ],
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
