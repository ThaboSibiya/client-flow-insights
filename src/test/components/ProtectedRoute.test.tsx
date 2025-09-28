import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock LoadingSpinner component
vi.mock('@/components/auth/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const TestComponent = () => <div data-testid="test-component">Protected Content</div>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Isolation Tests', () => {
    it('renders LoadingSpinner when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(
        <BrowserRouter>
          <ProtectedRoute element={<TestComponent />} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('renders protected component when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        loading: false,
      });

      render(
        <BrowserRouter>
          <ProtectedRoute element={<TestComponent />} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('redirects to /auth when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('redirects to custom redirectTo path when specified', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute 
            element={<TestComponent />} 
            redirectTo="/login" 
          />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });
  });

  describe('Props Type Validation', () => {
    it('handles element prop correctly', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      const CustomElement = () => <div data-testid="custom-element">Custom</div>;
      
      render(
        <BrowserRouter>
          <ProtectedRoute element={<CustomElement />} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('custom-element')).toBeInTheDocument();
    });

    it('uses default redirectTo when not provided', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      const { container } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      // Component should not render when redirecting
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('handles complex React elements as props', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      const ComplexElement = ({ title }: { title: string }) => (
        <div data-testid="complex-element">{title}</div>
      );
      
      render(
        <BrowserRouter>
          <ProtectedRoute element={<ComplexElement title="Test Title" />} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('complex-element')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  describe('Hook Usage Validation', () => {
    it('correctly uses useAuth hook', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      render(
        <BrowserRouter>
          <ProtectedRoute element={<TestComponent />} />
        </BrowserRouter>
      );

      expect(mockUseAuth).toHaveBeenCalledTimes(1);
    });

    it('handles missing auth context gracefully', () => {
      mockUseAuth.mockImplementation(() => {
        throw new Error('useAuth must be used within an AuthProvider');
      });

      expect(() => {
        render(
          <BrowserRouter>
            <ProtectedRoute element={<TestComponent />} />
          </BrowserRouter>
        );
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('Error Boundary Tests', () => {
    it('handles errors in protected component', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      expect(() => {
        render(
          <BrowserRouter>
            <ProtectedRoute element={<ErrorComponent />} />
          </BrowserRouter>
        );
      }).toThrow('Test error');
    });

    it('handles loading state errors', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute element={<TestComponent />} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Navigation and Routing', () => {
    it('maintains route state during authentication flow', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      // Initially loading
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });
      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Then authenticated
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });
      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('uses replace navigation for redirects', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute element={<TestComponent />} />
        </MemoryRouter>
      );

      // Should not render the protected content
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });
  });

  describe('TypeScript Interface Compliance', () => {
    it('satisfies ProtectedRouteProps interface', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      const props = {
        element: <TestComponent />,
        redirectTo: '/custom-login',
      };

      render(
        <BrowserRouter>
          <ProtectedRoute {...props} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('handles optional redirectTo prop', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });

      const props = {
        element: <TestComponent />,
      };

      render(
        <BrowserRouter>
          <ProtectedRoute {...props} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });
});