import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomerData } from '@/hooks/useCustomerData';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('useCustomerData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: { id: 'user123' },
      loading: false,
    });
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useCustomerData());
    
    expect(result.current.customers).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.fetchCustomers).toBe('function');
  });

  it('handles user not being loaded', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    const { result } = renderHook(() => useCustomerData());
    
    expect(result.current.customers).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('handles successful data fetch', async () => {
    const mockCustomers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockCustomers, error: null })),
        })),
      })),
    });

    const { result } = renderHook(() => useCustomerData());
    
    // Wait for hook to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(result.current.customers).toEqual(mockCustomers);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles fetch error correctly', async () => {
    const mockError = new Error('Failed to fetch');
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: mockError })),
        })),
      })),
    });

    const { result } = renderHook(() => useCustomerData());
    
    // Wait for hook to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(result.current.customers).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('refetches data when user changes', () => {
    const { rerender } = renderHook(() => useCustomerData());
    
    // Change user
    mockUseAuth.mockReturnValue({
      user: { id: 'user456' },
      loading: false,
    });
    
    rerender();
    
    // Should trigger new fetch
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
  });

  it('provides working fetchCustomers function', async () => {
    const { result } = renderHook(() => useCustomerData());
    
    // Call fetchCustomers manually
    await result.current.fetchCustomers();
    
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
  });
});