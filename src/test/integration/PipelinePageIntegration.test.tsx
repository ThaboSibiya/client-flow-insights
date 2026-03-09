import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Pipeline from '@/pages/Pipeline';

// Mock all external dependencies for integration testing
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

// Mock stores
vi.mock('@/stores/customerStore', () => ({
  useCustomerStore: () => ({
    customers: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'new' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'existing' },
    ],
    setCustomers: vi.fn(),
    setError: vi.fn(),
    optimisticUpdateCustomer: vi.fn(),
  }),
}));

vi.mock('@/stores/ticketStore', () => ({
  useTicketStore: () => ({
    optimisticAddTicket: vi.fn(),
  }),
}));

vi.mock('@/hooks/useOptimisticUpdates', () => ({
  useOptimisticUpdates: () => ({
    updateCustomerOptimistically: vi.fn(),
    deleteCustomerOptimistically: vi.fn(),
    updateTicketOptimistically: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCustomerData', () => ({
  useCustomerData: () => ({
    fetchCustomers: vi.fn(),
  }),
}));

// Mock DND kit for integration tests
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn(),
}));

// Mock complex child components for integration testing
vi.mock('@/components/pipeline/AddStageDialog', () => ({
  default: ({ open }: any) => 
    open ? <div data-testid="add-stage-dialog">Add Stage Dialog</div> : null,
}));

vi.mock('@/components/pipeline/PipelineMetrics', () => ({
  default: ({ type }: any) => <div data-testid="pipeline-metrics">Metrics: {type}</div>,
}));

vi.mock('@/components/pipeline/DroppableStage', () => ({
  default: ({ stage, type }: any) => (
    <div data-testid={`stage-${stage.id}`} data-type={type}>
      Stage: {stage.name}
    </div>
  ),
}));

vi.mock('@/components/pipeline/TicketPipeline', () => ({
  default: () => <div data-testid="ticket-pipeline">Ticket Pipeline Component</div>,
}));

vi.mock('@/components/pipeline/AutomationManagerNew', () => ({
  default: () => <div data-testid="automation-manager">Automation Manager</div>,
}));

vi.mock('@/components/pipeline/PipelineSettings', () => ({
  default: () => <div data-testid="pipeline-settings">Pipeline Settings</div>,
}));

vi.mock('@/components/pipeline/automation/WebhookWorkflowsManager', () => ({
  default: () => <div data-testid="webhook-workflows">Webhook Workflows</div>,
}));

vi.mock('@/components/error/PipelineErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// CRM Context Provider wrapper
import { CRMProvider } from '@/context/CRMContext';

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
        <CRMProvider>
          {component}
        </CRMProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Pipeline Page Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('integrates all main pipeline components correctly', () => {
    const { getByText, getByTestId } = renderWithProviders(<Pipeline />);

    // Check main page elements
    expect(getByText('Pipeline & Integrations')).toBeInTheDocument();
    expect(getByText('Manage pipelines, integrations & automations')).toBeInTheDocument();
    
    // Should render customer pipeline by default
    expect(getByTestId('pipeline-metrics')).toBeInTheDocument();
    expect(getByTestId('dnd-context')).toBeInTheDocument();
  });

  it('integrates tab switching with component state', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithProviders(<Pipeline />);

    // Initially on customers tab
    expect(getByTestId('pipeline-metrics')).toBeInTheDocument();
    
    // Switch to tickets tab
    const ticketsTab = getByText('Tickets');
    ticketsTab.click();
    expect(getByTestId('ticket-pipeline')).toBeInTheDocument();
    
    // Switch to automations tab
    const automationsTab = getByText('Automations');
    automationsTab.click();
    expect(getByTestId('automation-manager')).toBeInTheDocument();
    
    // Switch to settings tab
    const settingsTab = getByText('Settings');
    settingsTab.click();
    expect(getByTestId('pipeline-settings')).toBeInTheDocument();
  });

  it('integrates CRM context with pipeline components', () => {
    const { getByTestId, getByText } = renderWithProviders(<Pipeline />);

    // Pipeline should receive customer data from CRM context
    expect(getByTestId('pipeline-metrics')).toBeInTheDocument();
    expect(getByText('Metrics: customer')).toBeInTheDocument();
  });

  it('integrates drag and drop functionality', () => {
    const { getByTestId } = renderWithProviders(<Pipeline />);

    // DND components should be integrated
    expect(getByTestId('dnd-context')).toBeInTheDocument();
    expect(getByTestId('sortable-context')).toBeInTheDocument();
    expect(getByTestId('drag-overlay')).toBeInTheDocument();
  });

  it('integrates error boundaries across components', () => {
    const { getAllByTestId } = renderWithProviders(<Pipeline />);

    // Should have error boundaries wrapping components
    const errorBoundaries = getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('integrates stage rendering with customer data', () => {
    const { getByTestId } = renderWithProviders(<Pipeline />);

    // Default stages should be rendered
    expect(getByTestId('stage-new')).toBeInTheDocument();
    expect(getByTestId('stage-contacted')).toBeInTheDocument();
    expect(getByTestId('stage-qualified')).toBeInTheDocument();
    expect(getByTestId('stage-closed')).toBeInTheDocument();
  });

  it('handles state management across tab switches', () => {
    const { getByText, getByTestId } = renderWithProviders(<Pipeline />);

    // Switch tabs and verify state persistence
    const ticketsTab = getByText('Tickets');
    ticketsTab.click();
    expect(getByTestId('ticket-pipeline')).toBeInTheDocument();

    // Switch back to customers
    const customersTab = getByText('Customers');
    customersTab.click();
    expect(getByTestId('pipeline-metrics')).toBeInTheDocument();
    expect(getByTestId('dnd-context')).toBeInTheDocument();
  });

  it('integrates authentication context properly', () => {
    // Component should render properly with mocked auth
    const { getByText } = renderWithProviders(<Pipeline />);
    
    expect(getByText('Pipeline & Integrations')).toBeInTheDocument();
  });

  it('integrates React Query correctly', () => {
    // Should render without React Query errors
    expect(() => renderWithProviders(<Pipeline />)).not.toThrow();
  });

  it('handles component composition and nesting', () => {
    const { container } = renderWithProviders(<Pipeline />);

    // Check nested component structure
    const tabsContainer = container.querySelector('.w-full');
    expect(tabsContainer).toBeInTheDocument();

    const spaceContainer = container.querySelector('.space-y-6');
    expect(spaceContainer).toBeInTheDocument();
  });

  it('integrates styling system consistently', () => {
    const { container } = renderWithProviders(<Pipeline />);

    // Check for design system classes
    const gradientText = container.querySelector('.bg-gradient-to-r');
    expect(gradientText).toBeInTheDocument();

    const gridLayout = container.querySelector('.grid.w-full.grid-cols-6');
    expect(gridLayout).toBeInTheDocument();
  });

  it('handles complex data flow between components', () => {
    const { getByTestId } = renderWithProviders(<Pipeline />);

    // Pipeline metrics should receive stage data
    const metrics = getByTestId('pipeline-metrics');
    expect(metrics).toBeInTheDocument();
    expect(metrics).toHaveTextContent('Metrics: customer');

    // Stages should render with proper data
    expect(getByTestId('stage-new')).toHaveAttribute('data-type', 'customer');
  });

  it('integrates keyboard and accessibility features', () => {
    const { container } = renderWithProviders(<Pipeline />);

    // Check for proper button roles
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Check for proper tab navigation
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('handles component lifecycle integration', () => {
    const { unmount } = renderWithProviders(<Pipeline />);

    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it('integrates webhook and integration components', () => {
    const { getByText, getByTestId } = renderWithProviders(<Pipeline />);

    // Test webhooks tab
    const webhooksTab = getByText('Webhooks');
    webhooksTab.click();
    expect(getByTestId('webhook-workflows')).toBeInTheDocument();

    // Test integrations tab
    const integrationsTab = getByText('Integrations');
    integrationsTab.click();
    expect(getByTestId('integration-automations')).toBeInTheDocument();
  });
});