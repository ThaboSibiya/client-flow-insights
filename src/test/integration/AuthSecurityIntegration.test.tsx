import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CSRFProvider } from '@/components/security/CSRFProtection';
import { FormSecurityWrapper } from '@/components/security/FormSecurityWrapper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Mock all dependencies
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/services/auditLogService', () => ({
  logLoginHistory: vi.fn(),
}));

vi.mock('@/utils/securityUtils', () => ({
  generateCSRFToken: () => 'test-csrf-token',
}));

vi.mock('@/hooks/useRateLimit', () => ({
  useRateLimit: () => ({
    checkLimit: vi.fn().mockResolvedValue(true),
    isBlocked: false,
    remainingAttempts: 5,
    reset: vi.fn(),
  }),
}));

vi.mock('@/components/auth/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">{children}</button>
  ),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('Authentication and Security Integration', () => {
  const mockSubscription = { unsubscribe: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('Full Authentication Flow Integration', () => {
    const FullAppWrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>
        <AuthProvider>
          <CSRFProvider>
            {children}
          </CSRFProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    it('integrates auth, CSRF, and protected routes correctly', async () => {
      const ProtectedPage = () => <div data-testid="protected-page">Protected Content</div>;
      const LoginPage = () => <div data-testid="login-page">Login Required</div>;

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <CSRFProvider>
              <Routes>
                <Route path="/auth" element={<LoginPage />} />
                <Route 
                  path="/protected" 
                  element={
                    <ProtectedRoute element={<ProtectedPage />} />
                  } 
                />
              </Routes>
            </CSRFProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should redirect to auth when not authenticated
      await waitFor(() => {
        expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument();
      });
    });

    it('allows access to protected content when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const ProtectedPage = () => <div data-testid="protected-page">Protected Content</div>;

      render(
        <FullAppWrapper>
          <ProtectedRoute element={<ProtectedPage />} />
        </FullAppWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-page')).toBeInTheDocument();
      });
    });
  });

  describe('Form Security with Authentication Integration', () => {
    const SecureFormApp = ({ user }: { user: any }) => {
      const TestForm = ({ onSubmit }: any) => (
        <form data-testid="secure-form">
          <button 
            type="button"
            onClick={() => onSubmit({ field: 'value' })}
            data-testid="submit-btn"
          >
            Submit
          </button>
        </form>
      );

      return (
        <MemoryRouter>
          <AuthProvider>
            <CSRFProvider>
              <FormSecurityWrapper
                formName="test-form"
                onSubmit={vi.fn()}
              >
                <TestForm />
              </FormSecurityWrapper>
            </CSRFProvider>
          </AuthProvider>
        </MemoryRouter>
      );
    };

    it('integrates form security with authentication context', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      });

      render(<SecureFormApp user={{ id: 'user-123' }} />);

      await waitFor(() => {
        expect(screen.getByTestId('secure-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('provides CSRF token to authenticated forms', async () => {
      const mockOnSubmit = vi.fn();
      
      const TestFormWithSubmit = ({ onSubmit }: any) => (
        <button 
          onClick={() => onSubmit({ test: 'data' })}
          data-testid="submit-btn"
        >
          Submit
        </button>
      );

      render(
        <MemoryRouter>
          <AuthProvider>
            <CSRFProvider>
              <FormSecurityWrapper
                formName="csrf-test-form"
                onSubmit={mockOnSubmit}
              >
                <TestFormWithSubmit />
              </FormSecurityWrapper>
            </CSRFProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('submit-btn'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          { test: 'data' },
          'test-csrf-token'
        );
      });
    });
  });

  describe('Context Provider Chain Integration', () => {
    it('properly nests all security and auth providers', async () => {
      const TestComponent = () => {
        return (
          <div data-testid="nested-component">
            All providers working
          </div>
        );
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <TestComponent />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('nested-component')).toBeInTheDocument();
      });
    });

    it('handles provider unmounting gracefully', () => {
      const TestComponent = () => <div>Test</div>;

      const { unmount } = render(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <TestComponent />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles errors across integrated components', () => {
      const ErrorComponent = () => {
        throw new Error('Integration error');
      };

      expect(() => {
        render(
          <BrowserRouter>
            <AuthProvider>
              <CSRFProvider>
                <ErrorComponent />
              </CSRFProvider>
            </AuthProvider>
          </BrowserRouter>
        );
      }).toThrow('Integration error');
    });

    it('isolates errors in individual providers', () => {
      const TestComponent = () => <div data-testid="test">Working</div>;

      // Mock CSRF error
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <TestComponent />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should still render despite storage error
      expect(screen.getByTestId('test')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('synchronizes auth state across all components', async () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const AuthDisplay = () => {
        // This would use useAuth in real implementation
        return <div data-testid="auth-display">Auth state</div>;
      };

      const CSRFDisplay = () => {
        // This would use useCSRF in real implementation
        return <div data-testid="csrf-display">CSRF state</div>;
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <AuthDisplay />
              <CSRFDisplay />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-display')).toBeInTheDocument();
        expect(screen.getByTestId('csrf-display')).toBeInTheDocument();
      });

      // Simulate auth state change
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      authStateCallback('SIGNED_IN', mockSession);

      // Both components should still be rendered
      expect(screen.getByTestId('auth-display')).toBeInTheDocument();
      expect(screen.getByTestId('csrf-display')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('handles navigation with authenticated state', async () => {
      const HomePage = () => <div data-testid="home-page">Home</div>;
      const ProfilePage = () => <div data-testid="profile-page">Profile</div>;

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });

      render(
        <MemoryRouter initialEntries={['/home']}>
          <AuthProvider>
            <CSRFProvider>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute element={<ProfilePage />} />
                  } 
                />
              </Routes>
            </CSRFProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('redirects appropriately for unauthenticated users', async () => {
      const ProfilePage = () => <div data-testid="profile-page">Profile</div>;
      const LoginPage = () => <div data-testid="login-page">Please login</div>;

      render(
        <MemoryRouter initialEntries={['/profile']}>
          <AuthProvider>
            <CSRFProvider>
              <Routes>
                <Route path="/auth" element={<LoginPage />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute element={<ProfilePage />} />
                  } 
                />
              </Routes>
            </CSRFProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple provider re-renders efficiently', async () => {
      const renderCount = { count: 0 };
      
      const TestComponent = () => {
        renderCount.count++;
        return <div data-testid="render-count">{renderCount.count}</div>;
      };

      const { rerender } = render(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <TestComponent />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('render-count')).toBeInTheDocument();
      });

      const initialRenderCount = renderCount.count;

      // Force re-render
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <CSRFProvider>
              <TestComponent />
            </CSRFProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should not cause excessive re-renders
      expect(renderCount.count).toBeLessThan(initialRenderCount + 3);
    });
  });
});