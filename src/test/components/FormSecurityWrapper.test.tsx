import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormSecurityWrapper } from '@/components/security/FormSecurityWrapper';

// Mock dependencies
const mockUseCSRF = vi.fn();
const mockUseRateLimit = vi.fn();

vi.mock('@/components/security/CSRFProtection', () => ({
  useCSRF: () => mockUseCSRF(),
}));

vi.mock('@/hooks/useRateLimit', () => ({
  useRateLimit: () => mockUseRateLimit(),
}));

// Mock UI components
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe('FormSecurityWrapper Component', () => {
  const mockOnSubmit = vi.fn();
  const mockCheckLimit = vi.fn();
  const mockReset = vi.fn();

  const defaultProps = {
    formName: 'test-form',
    onSubmit: mockOnSubmit,
    maxAttempts: 5,
    windowMs: 60000,
    children: <form data-testid="test-form">Test Form</form>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default CSRF mock
    mockUseCSRF.mockReturnValue({
      token: 'test-csrf-token',
    });

    // Default rate limit mock
    mockUseRateLimit.mockReturnValue({
      checkLimit: mockCheckLimit,
      isBlocked: false,
      remainingAttempts: 5,
      reset: mockReset,
    });

    mockCheckLimit.mockResolvedValue(true);
  });

  describe('Component Isolation Tests', () => {
    it('renders children when not blocked', () => {
      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(screen.getByTestId('test-form')).toBeInTheDocument();
    });

    it('shows blocked state when rate limited', () => {
      mockUseRateLimit.mockReturnValue({
        checkLimit: mockCheckLimit,
        isBlocked: true,
        remainingAttempts: 0,
        reset: mockReset,
      });

      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        'Too many attempts. Please wait a moment before trying again.'
      );
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.queryByTestId('test-form')).not.toBeInTheDocument();
    });

    it('shows warning when few attempts remaining', () => {
      mockUseRateLimit.mockReturnValue({
        checkLimit: mockCheckLimit,
        isBlocked: false,
        remainingAttempts: 2,
        reset: mockReset,
      });

      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        '2 attempts remaining before temporary lockout.'
      );
    });

    it('does not show warning when attempts are above threshold', () => {
      mockUseRateLimit.mockReturnValue({
        checkLimit: mockCheckLimit,
        isBlocked: false,
        remainingAttempts: 4,
        reset: mockReset,
      });

      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(screen.queryByText(/attempts remaining/)).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('passes correct props to useRateLimit hook', () => {
      const customProps = {
        ...defaultProps,
        maxAttempts: 10,
        windowMs: 120000,
      };

      render(<FormSecurityWrapper {...customProps} />);
      
      expect(mockUseRateLimit).toHaveBeenCalledWith({
        resource: 'test-form',
        maxAttempts: 10,
        windowMs: 120000,
      });
    });

    it('uses default props when not provided', () => {
      const minimalProps = {
        formName: 'minimal-form',
        onSubmit: mockOnSubmit,
        children: <form>Minimal Form</form>,
      };

      render(<FormSecurityWrapper {...minimalProps} />);
      
      expect(mockUseRateLimit).toHaveBeenCalledWith({
        resource: 'minimal-form',
        maxAttempts: 5,
        windowMs: 60000,
      });
    });

    it('clones children with additional props', () => {
      const TestForm = ({ onSubmit, disabled }: any) => (
        <form data-testid="test-form" data-disabled={disabled}>
          <button onClick={() => onSubmit && onSubmit({ test: 'data' })}>
            Submit
          </button>
        </form>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      const form = screen.getByTestId('test-form');
      expect(form).toHaveAttribute('data-disabled', 'false');
    });
  });

  describe('Form Submission Handling', () => {
    it('handles successful form submission', async () => {
      const TestForm = ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ test: 'data' })} data-testid="submit-btn">
          Submit
        </button>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      await waitFor(() => {
        expect(mockCheckLimit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' }, 'test-csrf-token');
      });
    });

    it('prevents submission when blocked', async () => {
      mockUseRateLimit.mockReturnValue({
        checkLimit: mockCheckLimit,
        isBlocked: true,
        remainingAttempts: 0,
        reset: mockReset,
      });

      const TestForm = ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ test: 'data' })}>Submit</button>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      // Should not render the form when blocked
      expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('prevents submission when rate limit check fails', async () => {
      mockCheckLimit.mockResolvedValue(false);

      const TestForm = ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ test: 'data' })} data-testid="submit-btn">
          Submit
        </button>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      await waitFor(() => {
        expect(mockCheckLimit).toHaveBeenCalled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('shows submitting state during form submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const TestForm = ({ onSubmit, disabled }: any) => (
        <div>
          <button onClick={() => onSubmit({ test: 'data' })} data-testid="submit-btn">
            Submit
          </button>
          <div data-testid="disabled-state">{disabled.toString()}</div>
        </div>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      // Should show submitting overlay
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' }, 'test-csrf-token');
      });
    });

    it('handles submission errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

      const TestForm = ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ test: 'data' })} data-testid="submit-btn">
          Submit
        </button>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      await expect(async () => {
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });
      }).rejects.toThrow('Submission failed');

      expect(consoleError).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('Hook Usage Validation', () => {
    it('correctly uses useCSRF hook', () => {
      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(mockUseCSRF).toHaveBeenCalledTimes(1);
    });

    it('correctly uses useRateLimit hook with proper config', () => {
      render(<FormSecurityWrapper {...defaultProps} />);
      
      expect(mockUseRateLimit).toHaveBeenCalledWith({
        resource: 'test-form',
        maxAttempts: 5,
        windowMs: 60000,
      });
    });

    it('handles missing CSRF token', () => {
      mockUseCSRF.mockReturnValue({
        token: '',
      });

      const TestForm = ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ test: 'data' })} data-testid="submit-btn">
          Submit
        </button>
      );

      render(
        <FormSecurityWrapper {...defaultProps}>
          <TestForm />
        </FormSecurityWrapper>
      );

      fireEvent.click(screen.getByTestId('submit-btn'));

      expect(mockOnSubmit).toHaveBeenCalledWith({ test: 'data' }, '');
    });
  });

  describe('Reset Functionality', () => {
    it('calls reset function when Try Again button is clicked', () => {
      mockUseRateLimit.mockReturnValue({
        checkLimit: mockCheckLimit,
        isBlocked: true,
        remainingAttempts: 0,
        reset: mockReset,
      });

      render(<FormSecurityWrapper {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Try Again'));
      
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Boundary Tests', () => {
    it('handles errors in child components', () => {
      const ErrorForm = () => {
        throw new Error('Form error');
      };

      expect(() => {
        render(
          <FormSecurityWrapper {...defaultProps}>
            <ErrorForm />
          </FormSecurityWrapper>
        );
      }).toThrow('Form error');
    });

    it('handles hook errors gracefully', () => {
      mockUseCSRF.mockImplementation(() => {
        throw new Error('CSRF hook error');
      });

      expect(() => {
        render(<FormSecurityWrapper {...defaultProps} />);
      }).toThrow('CSRF hook error');
    });
  });

  describe('TypeScript Interface Compliance', () => {
    it('accepts all required props', () => {
      const requiredProps = {
        formName: 'required-form',
        onSubmit: vi.fn(),
        children: <form>Required Form</form>,
      };

      render(<FormSecurityWrapper {...requiredProps} />);
      
      expect(screen.getByText('Required Form')).toBeInTheDocument();
    });

    it('accepts optional props with defaults', () => {
      const propsWithOptionals = {
        formName: 'optional-form',
        onSubmit: vi.fn(),
        children: <form>Optional Form</form>,
        maxAttempts: 10,
        windowMs: 120000,
      };

      render(<FormSecurityWrapper {...propsWithOptionals} />);
      
      expect(screen.getByText('Optional Form')).toBeInTheDocument();
    });
  });
});