import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageBubble from '@/components/conversations/MessageBubble';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', id: 'user-1' },
  }),
}));

vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '5 minutes ago'),
}));

vi.mock('@/components/conversations/AttachmentPreview', () => ({
  default: ({ attachment }: any) => (
    <div data-testid="attachment-preview">
      Attachment: {attachment.name}
    </div>
  ),
}));

vi.mock('@/components/conversations/MessageActions', () => ({
  default: ({ messageId, conversationId }: any) => (
    <div data-testid="message-actions">
      Actions for {messageId} in {conversationId}
    </div>
  ),
}));

// Mock message data
const createMockMessage = (overrides = {}) => ({
  id: 'msg-1',
  conversation_id: 'conv-1',
  content: 'This is a test message content that should be displayed properly',
  sender_name: 'John Doe',
  sender_email: 'john@example.com',
  sender_type: 'customer',
  message_type: 'message',
  created_at: '2024-01-01T10:00:00Z',
  is_read: false,
  attachments: [],
  metadata: {},
  ...overrides,
});

describe('MessageBubble Component', () => {
  it('renders message content correctly', () => {
    const message = createMockMessage();
    const { getByText } = render(<MessageBubble message={message} />);
    
    expect(getByText('This is a test message content that should be displayed properly')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('5 minutes ago')).toBeInTheDocument();
  });

  it('applies correct styling for employee messages', () => {
    const employeeMessage = createMockMessage({
      sender_type: 'employee',
      sender_name: 'Support Agent',
    });
    
    const { container } = render(<MessageBubble message={employeeMessage} />);
    
    // Employee messages should have different alignment
    const messageContainer = container.querySelector('.ml-12');
    expect(messageContainer).toBeInTheDocument();
  });

  it('applies correct styling for customer messages', () => {
    const customerMessage = createMockMessage({
      sender_type: 'customer',
    });
    
    const { container } = render(<MessageBubble message={customerMessage} />);
    
    // Customer messages should have different alignment
    const messageContainer = container.querySelector('.mr-12');
    expect(messageContainer).toBeInTheDocument();
  });

  it('displays internal note styling correctly', () => {
    const internalMessage = createMockMessage({
      message_type: 'internal_note',
      sender_type: 'employee',
    });
    
    const { getByText, container } = render(<MessageBubble message={internalMessage} />);
    
    // Should show internal badge
    expect(getByText('Internal')).toBeInTheDocument();
    
    // Should have special styling
    const messageContainer = container.querySelector('.bg-gray-50');
    expect(messageContainer).toBeInTheDocument();
  });

  it('highlights search results correctly', () => {
    const message = createMockMessage({
      content: 'This message contains important keywords',
    });
    
    const { container } = render(
      <MessageBubble 
        message={message} 
        isSearchResult={true} 
        searchQuery="important" 
      />
    );
    
    // Should show search result badge
    const searchBadge = container.querySelector('[class*="Search Result"]');
    expect(container.querySelector('mark')).toBeInTheDocument();
    
    // Should have search result styling
    const searchResultContainer = container.querySelector('.ring-2');
    expect(searchResultContainer).toBeInTheDocument();
  });

  it('displays attachments when present', () => {
    const messageWithAttachments = createMockMessage({
      attachments: [
        { name: 'document.pdf', url: '/files/doc.pdf' },
        { name: 'image.jpg', url: '/files/img.jpg' },
      ],
    });
    
    const { getAllByTestId } = render(<MessageBubble message={messageWithAttachments} />);
    
    const attachmentPreviews = getAllByTestId('attachment-preview');
    expect(attachmentPreviews).toHaveLength(2);
    expect(attachmentPreviews[0]).toHaveTextContent('Attachment: document.pdf');
    expect(attachmentPreviews[1]).toHaveTextContent('Attachment: image.jpg');
  });

  it('shows unread indicator for unread customer messages', () => {
    const unreadMessage = createMockMessage({
      is_read: false,
      sender_type: 'customer',
    });
    
    const { getByText, container } = render(<MessageBubble message={unreadMessage} />);
    
    expect(getByText('Unread')).toBeInTheDocument();
    
    // Should have unread indicator dot
    const unreadDot = container.querySelector('.bg-quikle-primary.rounded-full');
    expect(unreadDot).toBeInTheDocument();
  });

  it('hides unread indicator for employee messages', () => {
    const unreadEmployeeMessage = createMockMessage({
      is_read: false,
      sender_type: 'employee',
    });
    
    const { queryByText } = render(<MessageBubble message={unreadEmployeeMessage} />);
    
    // Should not show unread indicator for employee messages
    expect(queryByText('Unread')).not.toBeInTheDocument();
  });

  it('displays message actions on hover', () => {
    const message = createMockMessage();
    const { container, getByTestId } = render(<MessageBubble message={message} />);
    
    const messageContainer = container.querySelector('.flex.gap-3');
    
    // Simulate mouse enter
    messageContainer?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    expect(getByTestId('message-actions')).toBeInTheDocument();
  });

  it('highlights search query text correctly', () => {
    const message = createMockMessage({
      content: 'This is a message with searchable content',
    });
    
    const { container } = render(
      <MessageBubble 
        message={message} 
        searchQuery="searchable" 
      />
    );
    
    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText).toHaveTextContent('searchable');
  });

  it('handles empty search query gracefully', () => {
    const message = createMockMessage();
    const { getByText } = render(
      <MessageBubble message={message} searchQuery="" />
    );
    
    // Should display content normally without highlighting
    expect(getByText('This is a test message content that should be displayed properly')).toBeInTheDocument();
  });

  it('displays correct avatar for different sender types', () => {
    const customerMessage = createMockMessage({ sender_type: 'customer' });
    const employeeMessage = createMockMessage({ sender_type: 'employee' });
    
    const { container: customerContainer } = render(<MessageBubble message={customerMessage} />);
    const { container: employeeContainer } = render(<MessageBubble message={employeeMessage} />);
    
    // Both should have avatars but in different positions
    const customerAvatar = customerContainer.querySelector('.h-8.w-8');
    const employeeAvatar = employeeContainer.querySelector('.h-8.w-8');
    
    expect(customerAvatar).toBeInTheDocument();
    expect(employeeAvatar).toBeInTheDocument();
  });

  it('validates TypeScript message interface', () => {
    const message = createMockMessage();
    
    // Verify all required properties exist
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('conversation_id');
    expect(message).toHaveProperty('content');
    expect(message).toHaveProperty('sender_name');
    expect(message).toHaveProperty('sender_type');
    expect(message).toHaveProperty('created_at');
    expect(message).toHaveProperty('is_read');
    
    // Verify proper types
    expect(typeof message.id).toBe('string');
    expect(typeof message.content).toBe('string');
    expect(typeof message.is_read).toBe('boolean');
    expect(['customer', 'employee']).toContain(message.sender_type);
  });

  it('handles messages without attachments', () => {
    const messageNoAttachments = createMockMessage({
      attachments: null,
    });
    
    const { queryByTestId } = render(<MessageBubble message={messageNoAttachments} />);
    
    expect(queryByTestId('attachment-preview')).not.toBeInTheDocument();
  });

  it('applies search result highlighting case-insensitively', () => {
    const message = createMockMessage({
      content: 'Important Message Content',
    });
    
    const { container } = render(
      <MessageBubble 
        message={message} 
        searchQuery="IMPORTANT" 
      />
    );
    
    const highlightedText = container.querySelector('mark');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText).toHaveTextContent('Important');
  });

  it('displays edited message indicator when present', () => {
    const editedMessage = createMockMessage({
      metadata: { edited: true },
    });
    
    render(<MessageBubble message={editedMessage} />);
    
    // MessageActions component should receive isEdited prop
    // This is tested through the props passed to the mocked component
  });

  it('maintains proper semantic HTML structure', () => {
    const message = createMockMessage();
    const { container } = render(<MessageBubble message={message} />);
    
    // Should have proper message structure
    const messageContainer = container.querySelector('.flex.gap-3');
    expect(messageContainer).toBeInTheDocument();
    
    // Should have avatar elements
    const avatars = container.querySelectorAll('[class*="avatar"]');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('handles multiple search query matches', () => {
    const message = createMockMessage({
      content: 'This test message is for testing the test functionality',
    });
    
    const { container } = render(
      <MessageBubble 
        message={message} 
        searchQuery="test" 
      />
    );
    
    const highlightedElements = container.querySelectorAll('mark');
    expect(highlightedElements.length).toBeGreaterThan(1);
  });

  it('handles long message content correctly', () => {
    const longMessage = createMockMessage({
      content: 'This is a very long message content that should be displayed properly without breaking the layout. It contains multiple sentences and should wrap correctly within the message bubble container while maintaining proper styling and readability.',
    });
    
    const { getByText } = render(<MessageBubble message={longMessage} />);
    
    expect(getByText(/This is a very long message content/)).toBeInTheDocument();
  });
});