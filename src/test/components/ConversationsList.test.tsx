import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConversationsList from '@/components/conversations/ConversationsList';

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago'),
}));

// Mock conversation data
const mockConversations = [
  {
    id: 'conv-1',
    type: 'email' as const,
    subject: 'Test Email Subject',
    status: 'active' as const,
    last_message_at: '2024-01-01T10:00:00Z',
    customer_id: 'cust-1',
    employee_id: 'emp-1',
    unread_count: 3,
    last_message_preview: 'This is a preview of the last message content',
  },
  {
    id: 'conv-2',
    type: 'whatsapp' as const,
    subject: null,
    status: 'closed' as const,
    last_message_at: '2024-01-01T09:00:00Z',
    customer_id: 'cust-2',
    employee_id: null,
    unread_count: 0,
    last_message_preview: 'WhatsApp message preview',
  },
  {
    id: 'conv-3',
    type: 'internal_chat' as const,
    subject: 'Internal Discussion',
    status: 'archived' as const,
    last_message_at: null,
    customer_id: null,
    employee_id: 'emp-2',
    unread_count: 1,
    last_message_preview: null,
  },
];

const defaultProps = {
  conversations: mockConversations,
  selectedId: null,
  onSelect: vi.fn(),
  filter: 'all',
  searchQuery: '',
  loading: false,
};

describe('ConversationsList Component', () => {
  it('renders conversations correctly', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    expect(getByText('Test Email Subject')).toBeInTheDocument();
    expect(getByText('Internal Discussion')).toBeInTheDocument();
    expect(getByText('This is a preview of the last message content')).toBeInTheDocument();
  });

  it('displays loading state with skeletons', () => {
    const { container } = render(
      <ConversationsList {...defaultProps} loading={true} conversations={undefined} />
    );
    
    // Should render skeleton components
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no conversations exist', () => {
    const { getByText } = render(
      <ConversationsList {...defaultProps} conversations={[]} />
    );
    
    expect(getByText('No conversations found')).toBeInTheDocument();
  });

  it('displays search results with "no found" message', () => {
    const { getByText } = render(
      <ConversationsList 
        {...defaultProps} 
        conversations={[]} 
        searchQuery="nonexistent" 
      />
    );
    
    expect(getByText('No conversations found for "nonexistent"')).toBeInTheDocument();
  });

  it('handles conversation selection correctly', () => {
    const mockOnSelect = vi.fn();
    const { getByText } = render(
      <ConversationsList {...defaultProps} onSelect={mockOnSelect} />
    );
    
    const conversation = getByText('Test Email Subject').closest('[role="button"], div[class*="cursor-pointer"]');
    conversation?.click();
    
    expect(mockOnSelect).toHaveBeenCalledWith('conv-1');
  });

  it('applies selected styling correctly', () => {
    const { container } = render(
      <ConversationsList {...defaultProps} selectedId="conv-1" />
    );
    
    const selectedCard = container.querySelector('.border-quikle-primary');
    expect(selectedCard).toBeInTheDocument();
  });

  it('displays correct type icons for different conversation types', () => {
    const { container } = render(<ConversationsList {...defaultProps} />);
    
    // Should have different colored badges for different types
    const emailBadge = container.querySelector('.bg-blue-500');
    const whatsappBadge = container.querySelector('.bg-green-500');
    const internalBadge = container.querySelector('.bg-purple-500');
    
    expect(emailBadge).toBeInTheDocument();
    expect(whatsappBadge).toBeInTheDocument();
    expect(internalBadge).toBeInTheDocument();
  });

  it('shows unread count badges correctly', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    expect(getByText('3')).toBeInTheDocument(); // Unread count for conv-1
    expect(getByText('1')).toBeInTheDocument(); // Unread count for conv-3
  });

  it('displays employee assigned indicator', () => {
    const { container } = render(<ConversationsList {...defaultProps} />);
    
    // Should show UserCheck icon for conversations with employee_id
    const userCheckIcons = container.querySelectorAll('.text-green-500');
    expect(userCheckIcons.length).toBeGreaterThan(0);
  });

  it('renders status badges with correct variants', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    expect(getByText('active')).toBeInTheDocument();
    expect(getByText('closed')).toBeInTheDocument();
    expect(getByText('archived')).toBeInTheDocument();
  });

  it('highlights search text correctly', () => {
    const { container } = render(
      <ConversationsList {...defaultProps} searchQuery="Email" />
    );
    
    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
  });

  it('handles conversations without last_message_at gracefully', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    // Should still render conversation even without timestamp
    expect(getByText('Internal Discussion')).toBeInTheDocument();
  });

  it('shows fallback names for conversations without subjects', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    // Conv-2 has no subject, should show customer_id as fallback
    expect(getByText('cust-2')).toBeInTheDocument();
  });

  it('displays message previews correctly', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    expect(getByText('This is a preview of the last message content')).toBeInTheDocument();
    expect(getByText('WhatsApp message preview')).toBeInTheDocument();
    expect(getByText('No messages yet')).toBeInTheDocument(); // For conv-3 with null preview
  });

  it('validates TypeScript interface compliance', () => {
    const conversation = mockConversations[0];
    
    // Verify all required properties exist
    expect(conversation).toHaveProperty('id');
    expect(conversation).toHaveProperty('type');
    expect(conversation).toHaveProperty('status');
    expect(conversation).toHaveProperty('last_message_at');
    
    // Verify correct types
    expect(typeof conversation.id).toBe('string');
    expect(['email', 'whatsapp', 'internal_chat', 'form_submission']).toContain(conversation.type);
    expect(['active', 'closed', 'archived']).toContain(conversation.status);
  });

  it('handles edge cases for conversation data', () => {
    const edgeCaseConversations = [
      {
        id: 'edge-1',
        type: 'form_submission' as const,
        subject: '',
        status: 'active' as const,
        last_message_at: '2024-01-01T08:00:00Z',
        customer_id: null,
        employee_id: null,
        unread_count: 0,
        last_message_preview: '',
      },
    ];

    const { getByText } = render(
      <ConversationsList 
        {...defaultProps} 
        conversations={edgeCaseConversations} 
      />
    );
    
    // Should handle empty/null values gracefully
    expect(getByText('Unnamed Conversation')).toBeInTheDocument();
    expect(getByText('No messages yet')).toBeInTheDocument();
  });

  it('applies hover effects correctly', () => {
    const { container } = render(<ConversationsList {...defaultProps} />);
    
    const conversationCard = container.querySelector('.hover\\:shadow-md');
    expect(conversationCard).toBeInTheDocument();
  });

  it('maintains proper semantic HTML structure', () => {
    const { container } = render(<ConversationsList {...defaultProps} />);
    
    // Should have proper card structure
    const cards = container.querySelectorAll('[class*="cursor-pointer"]');
    expect(cards.length).toBe(mockConversations.length);
    
    // Should have proper avatar elements
    const avatars = container.querySelectorAll('[class*="avatar"]');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('handles undefined conversations prop gracefully', () => {
    const { getByText } = render(
      <ConversationsList {...defaultProps} conversations={undefined} />
    );
    
    expect(getByText('No conversations found')).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    const { getByText } = render(<ConversationsList {...defaultProps} />);
    
    // Mock should return "2 hours ago"
    expect(getByText('2 hours ago')).toBeInTheDocument();
  });

  it('handles search highlighting with case sensitivity', () => {
    const { container } = render(
      <ConversationsList {...defaultProps} searchQuery="EMAIL" />
    );
    
    // Should highlight regardless of case
    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
  });

  it('displays form submission type correctly', () => {
    const formConversations = [
      {
        id: 'form-1',
        type: 'form_submission' as const,
        subject: 'Contact Form',
        status: 'active' as const,
        last_message_at: '2024-01-01T10:00:00Z',
        customer_id: 'cust-form',
        employee_id: null,
        unread_count: 0,
        last_message_preview: 'Form submission content',
      },
    ];

    const { container } = render(
      <ConversationsList {...defaultProps} conversations={formConversations} />
    );
    
    // Should show orange badge for form submissions
    const formBadge = container.querySelector('.bg-orange-500');
    expect(formBadge).toBeInTheDocument();
  });
});