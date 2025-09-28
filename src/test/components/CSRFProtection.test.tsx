import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CSRFProvider, useCSRF, withCSRFProtection } from '@/components/security/CSRFProtection';

// Mock the generateCSRFToken utility
const mockGenerateCSRFToken = vi.fn();
vi.mock('@/utils/securityUtils', () => ({
  generateCSRFToken: () => mockGenerateCSRFToken(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('CSRFProtection Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateCSRFToken.mockReturnValue('test-csrf-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CSRFProvider Component Isolation', () => {
    it('provides CSRF context to children', () => {
      const TestChild = () => {
        const { token } = useCSRF();
        return <div data-testid="csrf-token">{token}</div>;
      };

      render(
        <CSRFProvider>
          <TestChild />
        </CSRFProvider>
      );

      expect(screen.getByTestId('csrf-token')).toHaveTextContent('test-csrf-token-123');
    });

    it('generates new token when none exists in session storage', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      render(
        <CSRFProvider>
          <div>Test</div>
        </CSRFProvider>
      );

      expect(mockGenerateCSRFToken).toHaveBeenCalledTimes(1);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', 'test-csrf-token-123');
    });

    it('uses existing token from session storage', () => {
      mockSessionStorage.getItem.mockReturnValue('existing-token-456');

      const TestChild = () => {
        const { token } = useCSRF();
        return <div data-testid="csrf-token">{token}</div>;
      };

      render(
        <CSRFProvider>
          <TestChild />
        </CSRFProvider>
      );

      expect(screen.getByTestId('csrf-token')).toHaveTextContent('existing-token-456');
      expect(mockGenerateCSRFToken).not.toHaveBeenCalled();
    });

    it('refreshes token when refreshToken is called', () => {
      const TestChild = () => {
        const { token, refreshToken } = useCSRF();
        return (
          <div>
            <div data-testid="csrf-token">{token}</div>
            <button onClick={refreshToken} data-testid="refresh-button">
              Refresh
            </button>
          </div>
        );
      };

      mockSessionStorage.getItem.mockReturnValue('old-token');
      mockGenerateCSRFToken.mockReturnValue('new-token-789');

      render(
        <CSRFProvider>
          <TestChild />
        </CSRFProvider>
      );

      expect(screen.getByTestId('csrf-token')).toHaveTextContent('old-token');

      act(() => {
        screen.getByTestId('refresh-button').click();
      });

      expect(screen.getByTestId('csrf-token')).toHaveTextContent('new-token-789');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', 'new-token-789');
    });
  });

  describe('useCSRF Hook Validation', () => {
    it('provides token and refreshToken function', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CSRFProvider>{children}</CSRFProvider>
      );

      const { result } = renderHook(() => useCSRF(), { wrapper });

      expect(result.current.token).toBe('test-csrf-token-123');
      expect(typeof result.current.refreshToken).toBe('function');
    });

    it('throws error when used outside CSRFProvider', () => {
      expect(() => {
        renderHook(() => useCSRF());
      }).toThrow('useCSRF must be used within a CSRFProvider');
    });

    it('updates token when refreshToken is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CSRFProvider>{children}</CSRFProvider>
      );

      const { result } = renderHook(() => useCSRF(), { wrapper });

      mockGenerateCSRFToken.mockReturnValue('refreshed-token');

      act(() => {
        result.current.refreshToken();
      });

      expect(result.current.token).toBe('refreshed-token');
    });
  });

  describe('withCSRFProtection HOC', () => {
    it('wraps component with CSRF protection', () => {
      const TestComponent = ({ testProp }: { testProp: string }) => (
        <div data-testid="protected-component">{testProp}</div>
      );

      const ProtectedComponent = withCSRFProtection(TestComponent);

      render(
        <CSRFProvider>
          <ProtectedComponent testProp="test value" />
        </CSRFProvider>
      );

      expect(screen.getByTestId('protected-component')).toHaveTextContent('test value');
    });

    it('shows loading state when no token available', () => {
      const TestComponent = () => <div data-testid="protected-component">Protected</div>;
      const ProtectedComponent = withCSRFProtection(TestComponent);

      // Mock empty token
      const EmptyCSRFProvider = ({ children }: { children: React.ReactNode }) => {
        const contextValue = {
          token: '',
          refreshToken: vi.fn(),
        };
        
        return (
          <div>{children}</div>
        );
      };

      render(
        <EmptyCSRFProvider>
          <ProtectedComponent />
        </EmptyCSRFProvider>
      );

      expect(screen.queryByTestId('protected-component')).not.toBeInTheDocument();
    });

    it('preserves component props through HOC', () => {
      interface TestProps {
        title: string;
        count: number;
        onClick: () => void;
      }

      const TestComponent = ({ title, count, onClick }: TestProps) => (
        <div>
          <span data-testid="title">{title}</span>
          <span data-testid="count">{count}</span>
          <button onClick={onClick} data-testid="button">Click</button>
        </div>
      );

      const ProtectedComponent = withCSRFProtection(TestComponent);
      const mockOnClick = vi.fn();

      render(
        <CSRFProvider>
          <ProtectedComponent 
            title="Test Title" 
            count={42} 
            onClick={mockOnClick} 
          />
        </CSRFProvider>
      );

      expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
      expect(screen.getByTestId('count')).toHaveTextContent('42');
      
      act(() => {
        screen.getByTestId('button').click();
      });
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Boundary Tests', () => {
    it('handles errors in child components gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      expect(() => {
        render(
          <CSRFProvider>
            <ErrorComponent />
          </CSRFProvider>
        );
      }).toThrow('Test error');
    });

    it('handles sessionStorage errors gracefully', () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const TestChild = () => {
        const { token } = useCSRF();
        return <div data-testid="csrf-token">{token}</div>;
      };

      // Should still work and generate a new token
      render(
        <CSRFProvider>
          <TestChild />
        </CSRFProvider>
      );

      expect(screen.getByTestId('csrf-token')).toHaveTextContent('test-csrf-token-123');
    });
  });

  describe('Integration Tests', () => {
    it('integrates properly with multiple child components', () => {
      const ChildA = () => {
        const { token } = useCSRF();
        return <div data-testid="child-a">{token}</div>;
      };

      const ChildB = () => {
        const { token, refreshToken } = useCSRF();
        return (
          <div>
            <div data-testid="child-b">{token}</div>
            <button onClick={refreshToken} data-testid="refresh-b">Refresh</button>
          </div>
        );
      };

      render(
        <CSRFProvider>
          <ChildA />
          <ChildB />
        </CSRFProvider>
      );

      expect(screen.getByTestId('child-a')).toHaveTextContent('test-csrf-token-123');
      expect(screen.getByTestId('child-b')).toHaveTextContent('test-csrf-token-123');

      mockGenerateCSRFToken.mockReturnValue('new-shared-token');

      act(() => {
        screen.getByTestId('refresh-b').click();
      });

      expect(screen.getByTestId('child-a')).toHaveTextContent('new-shared-token');
      expect(screen.getByTestId('child-b')).toHaveTextContent('new-shared-token');
    });

    it('maintains token consistency across component updates', () => {
      const TestComponent = ({ showExtra }: { showExtra: boolean }) => {
        const { token } = useCSRF();
        return (
          <div>
            <div data-testid="token">{token}</div>
            {showExtra && <div data-testid="extra">Extra content</div>}
          </div>
        );
      };

      const { rerender } = render(
        <CSRFProvider>
          <TestComponent showExtra={false} />
        </CSRFProvider>
      );

      const initialToken = screen.getByTestId('token').textContent;

      rerender(
        <CSRFProvider>
          <TestComponent showExtra={true} />
        </CSRFProvider>
      );

      expect(screen.getByTestId('token')).toHaveTextContent(initialToken!);
      expect(screen.getByTestId('extra')).toBeInTheDocument();
    });
  });

  describe('TypeScript Interface Compliance', () => {
    it('provides correct TypeScript types', () => {
      const TypedComponent = () => {
        const context = useCSRF();
        
        // These should compile without TypeScript errors
        const token: string = context.token;
        const refreshToken: () => void = context.refreshToken;
        
        return (
          <div>
            <span data-testid="token-type">{typeof token}</span>
            <span data-testid="refresh-type">{typeof refreshToken}</span>
          </div>
        );
      };

      render(
        <CSRFProvider>
          <TypedComponent />
        </CSRFProvider>
      );

      expect(screen.getByTestId('token-type')).toHaveTextContent('string');
      expect(screen.getByTestId('refresh-type')).toHaveTextContent('function');
    });
  });
});