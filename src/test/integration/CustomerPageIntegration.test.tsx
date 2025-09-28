import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Customers from '@/pages/Customers';

// Mock all dependencies for integration testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com' },
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock complex child components for integration testing
vi.mock('@/components/customers/table/CustomerTableContainer', () => ({
  default: () => <div data-testid="customer-table-container">Customer Table</div>,
}));

vi.mock('@/components/voice/AiVoiceSessionDialog', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => 
    isOpen ? <div data-testid="ai-voice-dialog">AI Dialog</div> : null,
}));

vi.mock('@/components/customers/OnSiteStatusUpdate', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => 
    isOpen ? <div data-testid="onsite-update">OnSite Update</div> : null,
}));

vi.mock('@/components/settings/KnowledgeBaseManager', () => ({
  default: () => <div data-testid="knowledge-base">Knowledge Base</div>,
}));

vi.mock('@/components/settings/AiAgentSettings', () => ({
  AiAgentSettings: () => <div data-testid="ai-settings">AI Settings</div>,
}));

vi.mock('@/components/error/CustomerErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
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

describe('Customer Page Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('integrates all main components correctly', () => {
    const { getByTestId, getByText } = renderWithProviders(<Customers />);

    // Check main page elements
    expect(getByText('Client Management')).toBeInTheDocument();
    expect(getByTestId('customer-table-container')).toBeInTheDocument();
    expect(getByTestId('ai-settings')).toBeInTheDocument();
    expect(getByTestId('knowledge-base')).toBeInTheDocument();
  });

  it('handles modal state interactions', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithProviders(<Customers />);

    // Initially no modals visible
    expect(queryByTestId('ai-voice-dialog')).not.toBeInTheDocument();
    expect(queryByTestId('onsite-update')).not.toBeInTheDocument();

    // Open AI Voice dialog
    const aiButton = getByText('AI Agent');
    aiButton.click();
    expect(getByTestId('ai-voice-dialog')).toBeInTheDocument();

    // Open OnSite update dialog
    const jobButton = getByText('Job Complete');
    jobButton.click();
    expect(getByTestId('onsite-update')).toBeInTheDocument();
  });

  it('integrates with routing correctly', () => {
    const mockNavigate = vi.fn();
    
    // Mock navigate function
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    const { getByText } = renderWithProviders(<Customers />);
    
    const newClientButton = getByText('New Client');
    newClientButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('integrates error boundaries properly', () => {
    const { getAllByTestId } = renderWithProviders(<Customers />);
    
    // Should have error boundaries wrapping components
    const errorBoundaries = getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('integrates data flow between components', () => {
    const { getByTestId } = renderWithProviders(<Customers />);
    
    // Customer table should receive data from hooks
    expect(getByTestId('customer-table-container')).toBeInTheDocument();
    
    // Settings components should be independent
    expect(getByTestId('ai-settings')).toBeInTheDocument();
    expect(getByTestId('knowledge-base')).toBeInTheDocument();
  });

  it('handles authentication context integration', () => {
    // Component should render properly with mocked auth
    const { getByText } = renderWithProviders(<Customers />);
    
    expect(getByText('Client Management')).toBeInTheDocument();
  });

  it('integrates with React Query correctly', () => {
    // Should render without React Query errors
    expect(() => renderWithProviders(<Customers />)).not.toThrow();
  });

  it('handles component composition correctly', () => {
    const { container } = renderWithProviders(<Customers />);
    
    // Check layout structure
    const mainContainer = container.querySelector('.space-y-8');
    expect(mainContainer).toBeInTheDocument();
    
    // Check grid layout for settings
    const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('integrates styling system correctly', () => {
    const { container } = renderWithProviders(<Customers />);
    
    // Check for design system classes
    const gradientText = container.querySelector('.bg-gradient-to-r');
    expect(gradientText).toBeInTheDocument();
    
    const cardElements = container.querySelectorAll('.quikle-card');
    expect(cardElements.length).toBeGreaterThan(0);
  });

  it('handles component lifecycle integration', () => {
    const { unmount } = renderWithProviders(<Customers />);
    
    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it('integrates keyboard and accessibility features', () => {
    const { container } = renderWithProviders(<Customers />);
    
    // Check for proper button roles
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type');
    });
  });
});