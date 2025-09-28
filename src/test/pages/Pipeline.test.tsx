import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Pipeline from '@/pages/Pipeline';

// Mock all pipeline components
vi.mock('@/components/pipeline/CustomerPipeline', () => ({
  default: () => <div data-testid="customer-pipeline">Customer Pipeline</div>,
}));

vi.mock('@/components/pipeline/TicketPipeline', () => ({
  default: () => <div data-testid="ticket-pipeline">Ticket Pipeline</div>,
}));

vi.mock('@/components/pipeline/AutomationManager', () => ({
  default: () => <div data-testid="automation-manager">Automation Manager</div>,
}));

vi.mock('@/components/pipeline/PipelineSettings', () => ({
  default: () => <div data-testid="pipeline-settings">Pipeline Settings</div>,
}));

vi.mock('@/components/pipeline/automation/IntegrationAutomationsManager', () => ({
  default: () => <div data-testid="integration-automations">Integration Automations</div>,
}));

vi.mock('@/components/pipeline/automation/WebhookWorkflowsManager', () => ({
  default: () => <div data-testid="webhook-workflows">Webhook Workflows</div>,
}));

vi.mock('@/components/error/PipelineErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pipeline-error-boundary">{children}</div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Pipeline Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description correctly', () => {
    const { getByText } = renderWithRouter(<Pipeline />);
    
    expect(getByText('Pipeline & Integrations')).toBeInTheDocument();
    expect(getByText('Manage pipelines, integrations & automations')).toBeInTheDocument();
  });

  it('renders all tab triggers', () => {
    const { getByText } = renderWithRouter(<Pipeline />);
    
    expect(getByText('Customers')).toBeInTheDocument();
    expect(getByText('Tickets')).toBeInTheDocument();
    expect(getByText('Integrations')).toBeInTheDocument();
    expect(getByText('Webhooks')).toBeInTheDocument();
    expect(getByText('Automations')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('renders customer pipeline by default', () => {
    const { getByTestId } = renderWithRouter(<Pipeline />);
    
    expect(getByTestId('customer-pipeline')).toBeInTheDocument();
  });

  it('switches to ticket pipeline when tickets tab is clicked', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithRouter(<Pipeline />);
    
    // Click tickets tab
    const ticketsTab = getByText('Tickets');
    ticketsTab.click();
    
    // Should show ticket pipeline and hide customer pipeline
    expect(getByTestId('ticket-pipeline')).toBeInTheDocument();
    expect(queryByTestId('customer-pipeline')).not.toBeInTheDocument();
  });

  it('switches to integrations tab correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<Pipeline />);
    
    const integrationsTab = getByText('Integrations');
    integrationsTab.click();
    
    expect(getByTestId('integration-automations')).toBeInTheDocument();
  });

  it('switches to webhooks tab correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<Pipeline />);
    
    const webhooksTab = getByText('Webhooks');
    webhooksTab.click();
    
    expect(getByTestId('webhook-workflows')).toBeInTheDocument();
  });

  it('switches to automations tab correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<Pipeline />);
    
    const automationsTab = getByText('Automations');
    automationsTab.click();
    
    expect(getByTestId('automation-manager')).toBeInTheDocument();
  });

  it('switches to settings tab correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<Pipeline />);
    
    const settingsTab = getByText('Settings');
    settingsTab.click();
    
    expect(getByTestId('pipeline-settings')).toBeInTheDocument();
  });

  it('wraps components in error boundaries', () => {
    const { getAllByTestId } = renderWithRouter(<Pipeline />);
    
    // Should have error boundaries
    const errorBoundaries = getAllByTestId('pipeline-error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('applies proper styling classes', () => {
    const { container } = renderWithRouter(<Pipeline />);
    
    // Check for main layout classes
    const mainDiv = container.querySelector('.space-y-6');
    expect(mainDiv).toBeInTheDocument();
    
    // Check for gradient text styling
    const title = container.querySelector('.bg-gradient-to-r');
    expect(title).toBeInTheDocument();
  });

  it('renders tab icons correctly', () => {
    const { container } = renderWithRouter(<Pipeline />);
    
    // Check for Lucide icons (they render as SVG elements)
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('maintains tab state correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<Pipeline />);
    
    // Switch to tickets tab
    const ticketsTab = getByText('Tickets');
    ticketsTab.click();
    expect(getByTestId('ticket-pipeline')).toBeInTheDocument();
    
    // Switch to settings tab
    const settingsTab = getByText('Settings');
    settingsTab.click();
    expect(getByTestId('pipeline-settings')).toBeInTheDocument();
    
    // Switch back to customers tab
    const customersTab = getByText('Customers');
    customersTab.click();
    expect(getByTestId('customer-pipeline')).toBeInTheDocument();
  });

  it('handles TypeScript tab value correctly', () => {
    // This test ensures that the TabValue type is working correctly
    const { getByText } = renderWithRouter(<Pipeline />);
    
    // All tabs should be clickable without TypeScript errors
    const tabs = ['Customers', 'Tickets', 'Integrations', 'Webhooks', 'Automations', 'Settings'];
    
    tabs.forEach(tabName => {
      const tab = getByText(tabName);
      expect(tab).toBeInTheDocument();
      expect(() => tab.click()).not.toThrow();
    });
  });
});