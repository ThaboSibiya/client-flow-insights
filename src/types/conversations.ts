
export interface Message {
  id: string;
  content: string;
  sender_email: string;
  sender_name: string;
  sender_type: 'employee' | 'customer';
  message_type: 'reply' | 'internal_note';
  created_at: string;
  is_read: boolean;
  attachments?: any[];
  attachment_count?: number;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  type: 'email' | 'whatsapp' | 'telegram' | 'internal_chat' | 'form_submission';
  subject?: string | null;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string | null;
  customer_id?: string | null;
  employee_id?: string | null;
  unread_count?: number;
  last_message_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationFilters {
  type: string;
  searchQuery: string;
}

export interface PaginationOptions {
  pageSize?: number;
  cursor?: string;
  filters?: ConversationFilters;
  sortBy?: 'last_message_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}
