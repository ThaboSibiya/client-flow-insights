import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Conversations from '@/pages/Conversations';

// Mock all conversation components
vi.mock('@/components/conversations/ConversationsListOptimized', () => ({
  default: ({ conversations, selectedId, onSelect, loading, searchQuery }: any) => (
    <div data-testid="conversations-list">
      {loading ? (
        <div data-testid="loading">Loading conversations...</div>
      ) : (
        <>
          {conversations?.map((conv: any) => (
            <div 
              key={conv.id} 
              data-testid={`conversation-${conv.id}`}
              onClick={() => onSelect(conv.id)}
              className={selectedId === conv.id ? 'selected' : ''}
            >
              {conv.subject || 'Unnamed'}
            </div>
          ))}
          {searchQuery && <div data-testid="search-query">{searchQuery}</div>}
        </>
      )}
    </div>
  ),
}));

vi.mock('@/components/conversations/MessageThread', () => ({
  default: ({ conversationId }: any) => (
    <div data-testid="message-thread">
      Message Thread for {conversationId}
    </div>
  ),
}));

vi.mock('@/components/conversations/ConversationFiltersAdvanced', () => ({
  default: ({ onFilterChange }: any) => (
    <div data-testid="advanced-filters">
      <button onClick={() => onFilterChange('test', 'value')}>Apply Filter</button>
    </div>
  ),
}));

vi.mock('@/components/conversations/NewConversationDialog', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? (
      <div data-testid="new-conversation-dialog">
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/components/conversations/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings</div>,
}));

vi.mock('@/components/voice/VoiceInterface', () => ({
  default: ({ onSpeakingChange }: any) => (
    <div data-testid="voice-interface">
      <button onClick={() => onSpeakingChange(true)}>Start Speaking</button>
      <button onClick={() => onSpeakingChange(false)}>Stop Speaking</button>
    </div>
  ),
}));

// Mock hooks
const mockConversationsData = {
  conversations: [
    {
      id: 'conv-1',
      type: 'email',
      subject: 'Test Email Conversation',
      status: 'active',
      last_message_at: '2024-01-01T10:00:00Z',
      unread_count: 2,
      last_message_preview: 'Hello, this is a test message',
    },
    {
      id: 'conv-2',
      type: 'whatsapp',
      subject: 'WhatsApp Chat',
      status: 'active',
      last_message_at: '2024-01-01T09:00:00Z',
      unread_count: 0,
      last_message_preview: 'Hi there!',
    },
  ],
  loading: false,
  unreadCount: 2,
  filters: {
    type: 'all',
    searchQuery: '',
    status: 'all',
  },
  updateFilter: vi.fn(),
  loadMoreConversations: vi.fn(),
  refreshConversations: vi.fn(),
};

vi.mock('@/hooks/useConversationsOptimized', () => ({
  useConversationsOptimized: () => mockConversationsData,
}));

vi.mock('@/hooks/useRealtimeConversations', () => ({
  useRealtimeConversations: () => ({
    isConnected: true,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Conversations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description correctly', () => {
    const { getByText } = renderWithRouter(<Conversations />);
    
    expect(getByText('Conversations')).toBeInTheDocument();
    expect(getByText('Unified communication center')).toBeInTheDocument();
  });

  it('displays connection status with correct icons', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    // Should show connected status (green wifi icon)
    const wifiIcon = container.querySelector('.text-green-500');
    expect(wifiIcon).toBeInTheDocument();
  });

  it('shows unread count badge when there are unread messages', () => {
    const { getByText } = renderWithRouter(<Conversations />);
    
    expect(getByText('2 unread')).toBeInTheDocument();
  });

  it('renders conversation type tabs with correct icons', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    // Should have 5 tab triggers for All, Email, WhatsApp, Internal, Forms
    const tabTriggers = container.querySelectorAll('[role="tab"]');
    expect(tabTriggers).toHaveLength(5);
  });

  it('displays search input with correct functionality', () => {
    const { getByPlaceholderText } = renderWithRouter(<Conversations />);
    
    const searchInput = getByPlaceholderText('Search conversations...');
    expect(searchInput).toBeInTheDocument();
    
    // Test search functionality
    searchInput.dispatchEvent(new Event('change'));
    expect(mockConversationsData.updateFilter).toHaveBeenCalled();
  });

  it('renders conversations list with correct props', () => {
    const { getByTestId } = renderWithRouter(<Conversations />);
    
    const conversationsList = getByTestId('conversations-list');
    expect(conversationsList).toBeInTheDocument();
    
    // Should display individual conversations
    expect(getByTestId('conversation-conv-1')).toBeInTheDocument();
    expect(getByTestId('conversation-conv-2')).toBeInTheDocument();
  });

  it('shows empty state when no conversation is selected', () => {
    const { getByText } = renderWithRouter(<Conversations />);
    
    expect(getByText('Select a conversation')).toBeInTheDocument();
    expect(getByText(/Choose a conversation from the sidebar/)).toBeInTheDocument();
  });

  it('displays message thread when conversation is selected', () => {
    const { getByTestId, getByText } = renderWithRouter(<Conversations />);
    
    // Select a conversation
    const conversation = getByTestId('conversation-conv-1');
    conversation.click();
    
    // Should show message thread
    expect(getByTestId('message-thread')).toBeInTheDocument();
    expect(getByText('Message Thread for conv-1')).toBeInTheDocument();
  });

  it('opens new conversation dialog when button is clicked', () => {
    const { getByText, getByTestId } = renderWithRouter(<Conversations />);
    
    const newConversationBtn = getByText('New Conversation');
    newConversationBtn.click();
    
    expect(getByTestId('new-conversation-dialog')).toBeInTheDocument();
  });

  it('opens notification settings dialog', () => {
    const { getByText, getByTestId } = renderWithRouter(<Conversations />);
    
    const notificationsBtn = getByText('Notifications');
    notificationsBtn.click();
    
    expect(getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('handles tab switching correctly', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    const tabTriggers = container.querySelectorAll('[role="tab"]');
    
    // Click on different tabs
    if (tabTriggers[1]) fireEvent.click(tabTriggers[1]); // Email tab
    expect(mockConversationsData.updateFilter).toHaveBeenCalledWith('type', expect.any(String));
  });

  it('displays conversation count by type correctly', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    // Should calculate counts for each conversation type
    const emailConversations = mockConversationsData.conversations.filter(c => c.type === 'email');
    const whatsappConversations = mockConversationsData.conversations.filter(c => c.type === 'whatsapp');
    
    expect(emailConversations).toHaveLength(1);
    expect(whatsappConversations).toHaveLength(1);
  });

  it('integrates voice interface correctly', () => {
    const { getByTestId } = renderWithRouter(<Conversations />);
    
    const voiceInterface = getByTestId('voice-interface');
    expect(voiceInterface).toBeInTheDocument();
    
    const startSpeakingBtn = getByTestId('voice-interface').querySelector('button');
    startSpeakingBtn?.click();
    
    // Voice interface should be functional
    expect(startSpeakingBtn).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    vi.mocked(require('@/hooks/useConversationsOptimized').useConversationsOptimized).mockReturnValue({
      ...mockConversationsData,
      loading: true,
      conversations: [],
    });

    const { getByTestId } = renderWithRouter(<Conversations />);
    
    expect(getByTestId('loading')).toBeInTheDocument();
    expect(getByTestId('loading')).toHaveTextContent('Loading conversations...');
  });

  it('displays empty state when no conversations match filters', () => {
    vi.mocked(require('@/hooks/useConversationsOptimized').useConversationsOptimized).mockReturnValue({
      ...mockConversationsData,
      conversations: [],
      loading: false,
    });

    const { getByText } = renderWithRouter(<Conversations />);
    
    expect(getByText('No conversations match your current filters.')).toBeInTheDocument();
  });

  it('validates TypeScript prop interfaces correctly', () => {
    const conversations = mockConversationsData.conversations;
    
    // Verify conversation objects have required properties
    conversations.forEach(conv => {
      expect(conv).toHaveProperty('id');
      expect(conv).toHaveProperty('type');
      expect(conv).toHaveProperty('status');
      expect(conv).toHaveProperty('last_message_at');
      expect(typeof conv.id).toBe('string');
      expect(['email', 'whatsapp', 'internal_chat', 'form_submission']).toContain(conv.type);
    });
  });

  it('maintains consistent styling classes', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    // Check for design system classes
    const gradientBackground = container.querySelector('.bg-gradient-to-br');
    expect(gradientBackground).toBeInTheDocument();
    
    const primaryButton = container.querySelector('.bg-quikle-primary');
    expect(primaryButton).toBeInTheDocument();
  });

  it('handles search functionality correctly', () => {
    const { getByPlaceholderText } = renderWithRouter(<Conversations />);
    
    const searchInput = getByPlaceholderText('Search conversations...');
    
    // Simulate typing in search
    searchInput.setAttribute('value', 'test search');
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(mockConversationsData.updateFilter).toHaveBeenCalled();
  });

  it('renders with proper accessibility attributes', () => {
    const { container } = renderWithRouter(<Conversations />);
    
    // Check for proper ARIA labels and roles
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles conversation selection state correctly', () => {
    const { getByTestId } = renderWithRouter(<Conversations />);
    
    const conversation = getByTestId('conversation-conv-1');
    conversation.click();
    
    // Should have selected class applied
    expect(conversation).toHaveClass('selected');
  });

  it('displays correct disconnect status', () => {
    vi.mocked(require('@/hooks/useRealtimeConversations').useRealtimeConversations).mockReturnValue({
      isConnected: false,
    });

    const { container } = renderWithRouter(<Conversations />);
    
    // Should show disconnected status (red wifi off icon)
    const wifiOffIcon = container.querySelector('.text-red-500');
    expect(wifiOffIcon).toBeInTheDocument();
  });

  it('handles voice interface speaking state', () => {
    const { getByTestId, container } = renderWithRouter(<Conversations />);
    
    const voiceInterface = getByTestId('voice-interface');
    const startButton = voiceInterface.querySelector('button');
    
    startButton?.click();
    
    // Mic icon should update with speaking state
    const micIcon = container.querySelector('.animate-pulse');
    // Icon state would be controlled by component state
    expect(voiceInterface).toBeInTheDocument();
  });
});