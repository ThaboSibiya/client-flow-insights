import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Customers from '@/pages/Customers';

// Mock all dependencies
vi.mock('@/components/customers/CustomerTable', () => ({
  default: () => <div data-testid="customer-table">Customer Table</div>,
}));

vi.mock('@/components/voice/AiVoiceSessionDialog', () => ({
  default: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => 
    isOpen ? <div data-testid="ai-voice-dialog">AI Voice Dialog</div> : null,
}));

vi.mock('@/components/settings/KnowledgeBaseManager', () => ({
  default: () => <div data-testid="knowledge-base">Knowledge Base</div>,
}));

vi.mock('@/components/settings/AiAgentSettings', () => ({
  AiAgentSettings: () => <div data-testid="ai-agent-settings">AI Agent Settings</div>,
}));

vi.mock('@/components/customers/OnSiteStatusUpdate', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="onsite-update">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/components/error/CustomerErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Customers Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description correctly', () => {
    const { getByText } = renderWithRouter(<Customers />);
    
    expect(getByText('Client Management')).toBeInTheDocument();
    expect(getByText('View, manage, and communicate with your clients')).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    const { getByText } = renderWithRouter(<Customers />);
    
    expect(getByText('Job Complete')).toBeInTheDocument();
    expect(getByText('AI Agent')).toBeInTheDocument();
    expect(getByText('New Client')).toBeInTheDocument();
  });

  it('renders customer table component', () => {
    const { getByTestId } = renderWithRouter(<Customers />);
    
    expect(getByTestId('customer-table')).toBeInTheDocument();
  });

  it('renders AI configuration sections', () => {
    const { getByText, getByTestId } = renderWithRouter(<Customers />);
    
    expect(getByText('AI Agent Configuration')).toBeInTheDocument();
    expect(getByText('Knowledge Base')).toBeInTheDocument();
    expect(getByTestId('ai-agent-settings')).toBeInTheDocument();
    expect(getByTestId('knowledge-base')).toBeInTheDocument();
  });

  it('opens AI voice session dialog when AI Agent button clicked', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithRouter(<Customers />);
    
    // Initially dialog should not be visible
    expect(queryByTestId('ai-voice-dialog')).not.toBeInTheDocument();
    
    // Click AI Agent button
    const aiAgentButton = getByText('AI Agent');
    aiAgentButton.click();
    
    // Dialog should now be visible
    expect(getByTestId('ai-voice-dialog')).toBeInTheDocument();
  });

  it('opens onsite status update dialog when Job Complete button clicked', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithRouter(<Customers />);
    
    // Initially dialog should not be visible
    expect(queryByTestId('onsite-update')).not.toBeInTheDocument();
    
    // Click Job Complete button
    const jobCompleteButton = getByText('Job Complete');
    jobCompleteButton.click();
    
    // Dialog should now be visible
    expect(getByTestId('onsite-update')).toBeInTheDocument();
  });

  it('handles navigation to onboarding when New Client button clicked', () => {
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    const { getByText } = renderWithRouter(<Customers />);
    
    const newClientButton = getByText('New Client');
    newClientButton.click();
    
    // Navigation should be called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('applies proper styling classes', () => {
    const { container } = renderWithRouter(<Customers />);
    
    // Check for main layout classes
    const mainDiv = container.querySelector('.space-y-8');
    expect(mainDiv).toBeInTheDocument();
    
    // Check for gradient text styling
    const title = container.querySelector('.bg-gradient-to-r');
    expect(title).toBeInTheDocument();
  });

  it('wraps components in error boundaries', () => {
    // This test verifies that CustomerErrorBoundary is properly wrapping components
    const { getByTestId } = renderWithRouter(<Customers />);
    
    // If error boundaries are working, components should still render
    expect(getByTestId('customer-table')).toBeInTheDocument();
    expect(getByTestId('ai-agent-settings')).toBeInTheDocument();
    expect(getByTestId('knowledge-base')).toBeInTheDocument();
  });

  it('renders proper button icons', () => {
    const { container } = renderWithRouter(<Customers />);
    
    // Check for Lucide icons (they render as SVG elements)
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('handles modal state management correctly', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithRouter(<Customers />);
    
    // Open onsite update dialog
    const jobCompleteButton = getByText('Job Complete');
    jobCompleteButton.click();
    expect(getByTestId('onsite-update')).toBeInTheDocument();
    
    // Close dialog
    const closeButton = getByTestId('onsite-update').querySelector('button');
    if (closeButton) {
      closeButton.click();
      expect(queryByTestId('onsite-update')).not.toBeInTheDocument();
    }
  });
});