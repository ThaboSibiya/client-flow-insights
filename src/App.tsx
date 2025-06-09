
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMProvider } from "./context/CRMContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/error/ErrorBoundary";

import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Onboarding from "./pages/Onboarding";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <CRMProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                      <Route index element={<Index />} />
                      <Route path="dashboard" element={
                        <ErrorBoundary>
                          <Dashboard />
                        </ErrorBoundary>
                      } />
                      <Route path="customers" element={
                        <ErrorBoundary>
                          <Customers />
                        </ErrorBoundary>
                      } />
                      <Route path="onboarding" element={
                        <ErrorBoundary>
                          <Onboarding />
                        </ErrorBoundary>
                      } />
                      <Route path="analytics" element={
                        <ErrorBoundary>
                          <Analytics />
                        </ErrorBoundary>
                      } />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </CRMProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
