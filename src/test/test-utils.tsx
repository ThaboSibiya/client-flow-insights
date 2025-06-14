
import React from 'react';
import { 
  render as rtlRender, 
  RenderOptions,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
  queryByText,
  getByText,
  findByText,
  queryByRole,
  getByRole,
  findByRole,
  queryByTestId,
  getByTestId,
  findByTestId
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';
import { TooltipProvider } from '@/components/ui/tooltip';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CRMProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CRMProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Export everything from @testing-library/react
export * from '@testing-library/react';

// Explicitly export commonly used utilities
export {
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
  queryByText,
  getByText,
  findByText,
  queryByRole,
  getByRole,
  findByRole,
  queryByTestId,
  getByTestId,
  findByTestId
};

// Override render with our custom version
export { customRender as render };
