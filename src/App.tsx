
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMProvider } from "./context/CRMContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/error/ErrorBoundary";
import { TourProvider } from "./components/tour/FeatureTour";

import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Onboarding from "./pages/Onboarding";
import Pipeline from "./pages/Pipeline";
import Analytics from "./pages/Analytics";
import QuoteInvoice from "./pages/QuoteInvoice";
import Finance from "./pages/Finance";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import EmployeeSetup from "./pages/EmployeeSetup";
import Documentation from "./pages/Documentation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Conversations from "./pages/Conversations";
import AuditLog from "./pages/AuditLog";
import EmailIntegration from "./pages/EmailIntegration";
import Integrations from "./pages/Integrations";
import Automations from "./pages/Automations";
import NotificationHistory from "./pages/NotificationHistory";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import OwnerProtectedRoute from "./components/auth/OwnerProtectedRoute";
import Settings from "./pages/Settings";
import CancellationPolicy from "./pages/CancellationPolicy";
import TermsOfService from "./pages/TermsOfService";
import ResetPassword from "./pages/ResetPassword";

// Settings sections
import GeneralSettings from "./components/settings/sections/GeneralSettings";
import NotificationSettings from "./components/settings/sections/NotificationSettings";
import AppearanceSettings from "./components/settings/sections/AppearanceSettings";
import CompanySettings from "./components/settings/sections/CompanySettings";
import QuoteSettings from "./components/settings/sections/QuoteSettings";
import EmployeeSettings from "./components/settings/sections/EmployeeSettings";
import AiAgentSettingsSection from "./components/settings/sections/AiAgentSettingsSection";
import AutomationSettings from "./components/settings/sections/AutomationSettings";
import WebhookSettings from "./components/settings/sections/WebhookSettings";
import SecuritySettings from "./components/settings/sections/SecuritySettings";
import BillingSettings from "./components/settings/sections/BillingSettings";
import CommunicationSettings from "./components/settings/sections/CommunicationSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProjectManagement = React.lazy(() => import('./pages/ProjectManagement'));

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <CRMProvider>
              <TooltipProvider>
                <TourProvider>
                  <Toaster />
                  <Sonner />
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
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
                        <Route path="conversations" element={
                          <ErrorBoundary>
                            <Conversations />
                          </ErrorBoundary>
                        } />
                        <Route path="email" element={
                          <ErrorBoundary>
                            <EmailIntegration />
                          </ErrorBoundary>
                        } />
                        <Route path="onboarding" element={
                          <ErrorBoundary>
                            <Onboarding />
                          </ErrorBoundary>
                        } />
                        <Route path="pipeline" element={
                          <ErrorBoundary>
                            <Pipeline />
                          </ErrorBoundary>
                        } />
                        <Route path="analytics" element={
                          <ErrorBoundary>
                            <Analytics />
                          </ErrorBoundary>
                        } />
                        <Route path="projects" element={
                          <ErrorBoundary>
                            <React.Suspense fallback={
                              <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
                                <span className="sr-only">Loading project management...</span>
                              </div>
                            }>
                              <ProjectManagement />
                            </React.Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="quotes" element={
                          <ErrorBoundary>
                            <QuoteInvoice />
                          </ErrorBoundary>
                        } />
                        <Route path="finance" element={
                          <ErrorBoundary>
                            <Finance />
                          </ErrorBoundary>
                        } />
                        <Route path="employees" element={
                          <ErrorBoundary>
                            <Employees />
                          </ErrorBoundary>
                        } />
                        <Route path="documentation" element={
                          <ErrorBoundary>
                            <Documentation />
                          </ErrorBoundary>
                        } />
                        <Route path="cancellation-policy" element={
                          <ErrorBoundary>
                            <CancellationPolicy />
                          </ErrorBoundary>
                        } />
                        <Route path="terms-of-service" element={
                          <ErrorBoundary>
                            <TermsOfService />
                          </ErrorBoundary>
                        } />
                        <Route path="audit-log" element={
                          <ErrorBoundary>
                            <AdminProtectedRoute element={<AuditLog />} />
                          </ErrorBoundary>
                        } />
                        <Route path="integrations" element={
                          <ErrorBoundary>
                            <Integrations />
                          </ErrorBoundary>
                        } />
                        <Route path="automations" element={
                          <ErrorBoundary>
                            <Automations />
                          </ErrorBoundary>
                        } />
                        <Route path="notifications" element={
                          <ErrorBoundary>
                            <NotificationHistory />
                          </ErrorBoundary>
                        } />
                        
                        {/* Settings Routes */}
                        <Route path="settings" element={
                          <ErrorBoundary>
                            <Settings />
                          </ErrorBoundary>
                        }>
                          <Route path="general" element={<GeneralSettings />} />
                          <Route path="notifications" element={<NotificationSettings />} />
                          <Route path="appearance" element={<AppearanceSettings />} />
                          <Route path="company" element={
                            <AdminProtectedRoute element={<CompanySettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="quotes" element={
                            <AdminProtectedRoute element={<QuoteSettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="employees" element={
                            <AdminProtectedRoute element={<EmployeeSettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="ai-agent" element={
                            <AdminProtectedRoute element={<AiAgentSettingsSection />} redirectTo="/settings/general" />
                          } />
                          <Route path="communications" element={
                            <AdminProtectedRoute element={<CommunicationSettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="automations" element={
                            <AdminProtectedRoute element={<AutomationSettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="webhooks" element={
                            <AdminProtectedRoute element={<WebhookSettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="security" element={
                            <AdminProtectedRoute element={<SecuritySettings />} redirectTo="/settings/general" />
                          } />
                          <Route path="billing" element={
                            <OwnerProtectedRoute element={<BillingSettings />} redirectTo="/settings/general" />
                          } />
                        </Route>
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </TourProvider>
              </TooltipProvider>
            </CRMProvider>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
