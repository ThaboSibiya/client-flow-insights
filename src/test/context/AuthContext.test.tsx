import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock Supabase client
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

// Mock audit log service
const mockLogLoginHistory = vi.fn();
vi.mock('@/services/auditLogService', () => ({
  logLoginHistory: mockLogLoginHistory,
}));

describe('AuthContext', () => {
  const mockSubscription = {
    unsubscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
  });

  describe('AuthProvider Component Isolation', () => {
    it('provides auth context to children', async () => {
      const TestChild = () => {
        const { user, loading } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? user.email : 'No user'}</div>
            <div data-testid="loading">{loading.toString()}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    it('handles existing session on initialization', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const TestChild = () => {
        const { user, session, loading } = useAuth();
        return (
          <div>
            <div data-testid="user">{user?.email || 'No user'}</div>
            <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
            <div data-testid="loading">{loading.toString()}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('Has session');
    });

    it('sets up auth state change listener', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('cleans up subscription on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth State Changes', () => {
    it('handles SIGNED_IN event and logs login history', () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const TestChild = () => {
        const { user, session } = useAuth();
        return (
          <div>
            <div data-testid="user">{user?.id || 'No user'}</div>
            <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Simulate SIGNED_IN event
      authStateCallback('SIGNED_IN', mockSession);

      expect(screen.getByTestId('user')).toHaveTextContent('user-123');
      expect(screen.getByTestId('session')).toHaveTextContent('Has session');
      expect(mockLogLoginHistory).toHaveBeenCalledWith('user-123');
    });

    it('handles SIGNED_OUT event', () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const TestChild = () => {
        const { user, session } = useAuth();
        return (
          <div>
            <div data-testid="user">{user?.id || 'No user'}</div>
            <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      // Simulate SIGNED_OUT event
      authStateCallback('SIGNED_OUT', null);

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('session')).toHaveTextContent('No session');
      expect(mockLogLoginHistory).not.toHaveBeenCalled();
    });

    it('handles auth state changes without login history for non-signin events', () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Simulate TOKEN_REFRESHED event (not SIGNED_IN)
      authStateCallback('TOKEN_REFRESHED', mockSession);

      expect(mockLogLoginHistory).not.toHaveBeenCalled();
    });
  });

  describe('useAuth Hook Validation', () => {
    it('provides all context values', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('loading');
      expect(typeof result.current.signOut).toBe('function');
    });

    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('signOut function calls supabase auth signOut', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('starts with loading true', () => {
      const TestChild = () => {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading.toString()}</div>;
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      // Should be loading initially
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('sets loading false after session check', async () => {
      const TestChild = () => {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading.toString()}</div>;
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('sets loading false after auth state change', () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const TestChild = () => {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading.toString()}</div>;
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // Simulate auth state change
      authStateCallback('SIGNED_OUT', null);

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
    it('handles getSession errors gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Session error'));

      const TestChild = () => {
        const { loading, user } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="user">{user ? 'Has user' : 'No user'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      // Should still set loading to false even if getSession fails
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    it('handles signOut errors gracefully', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error('SignOut error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.signOut()).rejects.toThrow('SignOut error');
    });

    it('handles login history logging errors gracefully', () => {
      mockLogLoginHistory.mockImplementation(() => {
        throw new Error('Logging error');
      });

      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Should not crash when login history logging fails
      expect(() => {
        authStateCallback('SIGNED_IN', mockSession);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('properly integrates auth state changes with component updates', async () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const TestChild = () => {
        const { user, session, loading } = useAuth();
        return (
          <div>
            <div data-testid="user">{user?.email || 'No user'}</div>
            <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
            <div data-testid="loading">{loading.toString()}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Simulate sign in
      authStateCallback('SIGNED_IN', mockSession);

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('Has session');

      // Simulate sign out
      authStateCallback('SIGNED_OUT', null);

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('session')).toHaveTextContent('No session');
    });

    it('maintains consistent state across multiple child components', async () => {
      let authStateCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      const ChildA = () => {
        const { user } = useAuth();
        return <div data-testid="child-a">{user?.email || 'No user A'}</div>;
      };

      const ChildB = () => {
        const { user } = useAuth();
        return <div data-testid="child-b">{user?.email || 'No user B'}</div>;
      };

      render(
        <AuthProvider>
          <ChildA />
          <ChildB />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-a')).toHaveTextContent('No user A');
      });

      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Both children should update consistently
      authStateCallback('SIGNED_IN', mockSession);

      expect(screen.getByTestId('child-a')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('child-b')).toHaveTextContent('test@example.com');
    });
  });

  describe('TypeScript Interface Compliance', () => {
    it('provides correctly typed context values', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // These should be properly typed
      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.loading).toBe('boolean');
    });
  });
});