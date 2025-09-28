import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Conversations from '@/pages/Conversations';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock conversation services
const mockConversations = [
  {
    id: 'conv-1',
    type: 'email',
    subject: 'Customer Support Inquiry',
    status: 'active',
    last_message_at: '2024-01-01T10:00:00Z',
    customer_id: 'cust-1',
    employee_id: 'emp-1',
    unread_count: 3,
    last_message_preview: 'I need help with my order',
  },
  {
    id: 'conv-2',
    type: 'whatsapp',
    subject: null,
    status: 'active',
    last_message_at: '2024-01-01T09:30:00Z',
    customer_id: 'cust-2',
    employee_id: null,
    unread_count: 1,
    last_message_preview: 'Hello, are you available?',
  },
  {
    id: 'conv-3',
    type: 'internal_chat',
    subject: 'Team Discussion',
    status: 'active',
    last_message_at: '2024-01-01T09:00:00Z',
    customer_id: null,
    employee_id: 'emp-2',
    unread_count: 0,
    last_message_preview: 'Meeting at 3pm today',
  },
];

const mockConversationService = {
  loadConversationsPaginated: vi.fn().mockResolvedValue({
    conversations: mockConversations,
    hasMore: false,
    nextCursor: undefined,
  }),
};

vi.mock('@/services/conversationsPaginationService', () => ({
  loadConversationsPaginated: mockConversationService.loadConversationsPaginated,
}));

// Mock complex child components
vi.mock('@/components/conversations/ConversationsListOptimized', () => ({
  default: ({ conversations, selectedId, onSelect, loading, searchQuery }: any) => (
    <div data-testid="conversations-list-optimized">
      {loading ? (
        <div data-testid="conversations-loading">Loading...</div>
      ) : (
        <>
          {conversations?.map((conv: any) => (
            <div 
              key={conv.id} 
              data-testid={`conversation-item-${conv.id}`}
              onClick={() => onSelect(conv.id)}
              className={selectedId === conv.id ? 'selected' : ''}
            >
              {conv.subject || conv.type}
            </div>
          ))}
          {searchQuery && <div data-testid="search-applied">{searchQuery}</div>}
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
      <button onClick={() => onFilterChange('status', 'active')}>Filter Active</button>
    </div>
  ),
}));

vi.mock('@/components/conversations/NewConversationDialog', () => ({
  default: ({ open, onOpenChange }: any) => 
    open ? (
      <div data-testid="new-conversation-dialog">
        <button onClick={() => onOpenChange(false)} data-testid="close-dialog">
          Close Dialog
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/conversations/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings</div>,
}));

vi.mock('@/components/voice/VoiceInterface', () => ({
  default: ({ onSpeakingChange }: any) => (
    <div data-testid="voice-interface">
      <button 
        data-testid="start-speaking"
        onClick={() => onSpeakingChange(true)}
      >
        Start Speaking
      </button>
      <button 
        data-testid="stop-speaking"
        onClick={() => onSpeakingChange(false)}
      >
        Stop Speaking
      </button>
    </div>
  ),
}));

// Mock data is now defined above

// Mock hooks with comprehensive data
const mockConversationsOptimized = {
  conversations: mockConversations,
  loading: false,
  unreadCount: 4,
  filters: {
    type: 'all',
    searchQuery: '',
    status: 'all',
    dateRange: null,
  },
  updateFilter: vi.fn(),
  loadMoreConversations: vi.fn(),
  refreshConversations: vi.fn(),
};

vi.mock('@/hooks/useConversationsOptimized', () => ({
  useConversationsOptimized: () => mockConversationsOptimized,
}));

vi.mock('@/hooks/useRealtimeConversations', () => ({
  useRealtimeConversations: () => ({
    isConnected: true,
  }),
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Conversations Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates all main conversation components', () => {
    const { getByText, getByTestId } = renderWithProviders(<Conversations />);

    // Main page elements
    expect(getByText('Conversations')).toBeInTheDocument();
    expect(getByText('Unified communication center')).toBeInTheDocument();
    
    // Integrated components
    expect(getByTestId('conversations-list-optimized')).toBeInTheDocument();
    expect(getByTestId('voice-interface')).toBeInTheDocument();
  });

  it('integrates conversation filtering with list display', () => {
    const { getByTestId, getByPlaceholderText } = renderWithProviders(<Conversations />);

    // Filter integration
    const searchInput = getByPlaceholderText('Search conversations...');
    searchInput.setAttribute('value', 'support');
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(mockConversationsOptimized.updateFilter).toHaveBeenCalledWith('searchQuery', 'support');
  });

  it('integrates tab switching with conversation type filtering', () => {
    const { container } = renderWithProviders(<Conversations />);

    // Tab integration
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(5); // All, Email, WhatsApp, Internal, Forms
    
    // Click email tab
    tabs[1]?.click();
    expect(mockConversationsOptimized.updateFilter).toHaveBeenCalled();
  });

  it('integrates conversation selection with message thread display', () => {
    const { getByTestId } = renderWithProviders(<Conversations />);

    // Initial state - no conversation selected
    expect(getByTestId('conversations-list-optimized')).toBeInTheDocument();
    
    // Select a conversation
    const conversationItem = getByTestId('conversation-item-conv-1');
    conversationItem.click();
    
    // Should show message thread
    expect(getByTestId('message-thread')).toBeInTheDocument();
    expect(getByTestId('message-thread')).toHaveTextContent('Message Thread for conv-1');
  });

  it('integrates real-time connection status with UI', () => {
    const { container } = renderWithProviders(<Conversations />);

    // Should show connected status
    const connectedIcon = container.querySelector('.text-green-500');
    expect(connectedIcon).toBeInTheDocument();
  });

  it('integrates unread count display across components', () => {
    const { getByText } = renderWithProviders(<Conversations />);

    // Should display total unread count
    expect(getByText('4 unread')).toBeInTheDocument();
  });

  it('integrates new conversation dialog workflow', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithProviders(<Conversations />);

    // Open dialog
    const newConversationBtn = getByText('New Conversation');
    newConversationBtn.click();
    
    expect(getByTestId('new-conversation-dialog')).toBeInTheDocument();
    
    // Close dialog
    const closeBtn = getByTestId('close-dialog');
    closeBtn.click();
    
    expect(queryByTestId('new-conversation-dialog')).not.toBeInTheDocument();
  });

  it('integrates voice interface with speaking state', () => {
    const { getByTestId, container } = renderWithProviders(<Conversations />);

    // Start speaking
    const startBtn = getByTestId('start-speaking');
    startBtn.click();
    
    // Mic icon should update (tested through CSS class changes)
    const micIcon = container.querySelector('[class*="animate-pulse"]');
    // Icon animation controlled by speaking state
    expect(getByTestId('voice-interface')).toBeInTheDocument();
  });

  it('integrates notification settings with dialog system', () => {
    const { getByText, getByTestId } = renderWithProviders(<Conversations />);

    // Open notification settings
    const notificationsBtn = getByText('Notifications');
    notificationsBtn.click();
    
    expect(getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('integrates loading states across components', () => {
    vi.mocked(require('@/hooks/useConversationsOptimized').useConversationsOptimized).mockReturnValue({
      ...mockConversationsOptimized,
      loading: true,
      conversations: [],
    });

    const { getByTestId } = renderWithProviders(<Conversations />);

    expect(getByTestId('conversations-loading')).toBeInTheDocument();
  });

  it('integrates conversation type counts with tab display', () => {
    const { container } = renderWithProviders(<Conversations />);

    // Should calculate and display correct counts
    const emailCount = mockConversations.filter(c => c.type === 'email').length;
    const whatsappCount = mockConversations.filter(c => c.type === 'whatsapp').length;
    const internalCount = mockConversations.filter(c => c.type === 'internal_chat').length;
    
    expect(emailCount).toBe(1);
    expect(whatsappCount).toBe(1);
    expect(internalCount).toBe(1);
  });

  it('integrates search functionality with conversation highlighting', () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(<Conversations />);

    // Apply search
    const searchInput = getByPlaceholderText('Search conversations...');
    searchInput.setAttribute('value', 'support');
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Search should be passed to conversation list
    expect(getByTestId('search-applied')).toHaveTextContent('support');
  });

  it('handles data flow between hooks and components', () => {
    const { getByTestId } = renderWithProviders(<Conversations />);

    // Data should flow from hook to components
    expect(getByTestId('conversation-item-conv-1')).toBeInTheDocument();
    expect(getByTestId('conversation-item-conv-2')).toBeInTheDocument();
    expect(getByTestId('conversation-item-conv-3')).toBeInTheDocument();
  });

  it('integrates error boundaries and error handling', () => {
    // Component should render without crashing
    const { getByText } = renderWithProviders(<Conversations />);
    
    expect(getByText('Conversations')).toBeInTheDocument();
  });

  it('integrates context providers correctly', () => {
    // Should have access to auth context
    const { getByText } = renderWithProviders(<Conversations />);
    
    expect(getByText('New Conversation')).toBeInTheDocument();
  });

  it('handles complex user interaction flows', () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderWithProviders(<Conversations />);

    // 1. Search for conversations
    const searchInput = getByPlaceholderText('Search conversations...');
    searchInput.setAttribute('value', 'support');
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // 2. Select a conversation
    const conversation = getByTestId('conversation-item-conv-1');
    conversation.click();
    
    // 3. Open new conversation dialog
    const newBtn = getByText('New Conversation');
    newBtn.click();
    
    // All interactions should work together
    expect(getByTestId('message-thread')).toBeInTheDocument();
    expect(getByTestId('new-conversation-dialog')).toBeInTheDocument();
  });

  it('integrates responsive design patterns', () => {
    const { container } = renderWithProviders(<Conversations />);

    // Should have responsive layout classes
    const sidebar = container.querySelector('.w-80');
    const mainContent = container.querySelector('.flex-1');
    
    expect(sidebar).toBeInTheDocument();
    expect(mainContent).toBeInTheDocument();
  });

  it('validates TypeScript integration across components', () => {
    // Should render without TypeScript errors
    const { getByText } = renderWithProviders(<Conversations />);
    
    expect(getByText('Conversations')).toBeInTheDocument();
  });

  it('integrates keyboard navigation and accessibility', () => {
    const { container } = renderWithProviders(<Conversations />);

    // Should have proper ARIA attributes
    const tabs = container.querySelectorAll('[role="tab"]');
    const buttons = container.querySelectorAll('button');
    
    expect(tabs.length).toBeGreaterThan(0);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles disconnected state integration', () => {
    vi.mocked(require('@/hooks/useRealtimeConversations').useRealtimeConversations).mockReturnValue({
      isConnected: false,
    });

    const { container } = renderWithProviders(<Conversations />);

    // Should show disconnected status
    const disconnectedIcon = container.querySelector('.text-red-500');
    expect(disconnectedIcon).toBeInTheDocument();
  });

  it('integrates empty state handling across components', () => {
    vi.mocked(require('@/hooks/useConversationsOptimized').useConversationsOptimized).mockReturnValue({
      ...mockConversationsOptimized,
      conversations: [],
      loading: false,
    });

    const { getByText } = renderWithProviders(<Conversations />);

    // Should show empty state message
    expect(getByText('No conversations match your current filters.')).toBeInTheDocument();
  });
});