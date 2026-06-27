
import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CRMProvider } from "./context/CRMContext";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import ErrorBoundary from "./components/error/ErrorBoundary";
import { TourProvider } from "./components/tour/FeatureTour";

// Eager — required on every navigation
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import OwnerProtectedRoute from "./components/auth/OwnerProtectedRoute";

// Lazy — split per route
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Customers = lazy(() => import("./pages/Customers"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Analytics = lazy(() => import("./pages/Analytics"));
const QuoteInvoice = lazy(() => import("./pages/QuoteInvoice"));
const Finance = lazy(() => import("./pages/Finance"));
const Employees = lazy(() => import("./pages/Employees"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const EmployeeSetup = lazy(() => import("./pages/EmployeeSetup"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Conversations = lazy(() => import("./pages/Conversations"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const EmailIntegration = lazy(() => import("./pages/EmailIntegration"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Automations = lazy(() => import("./pages/Automations"));
const NotificationHistory = lazy(() => import("./pages/NotificationHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CyberLSICallback = lazy(() => import("./pages/CyberLSICallback"));
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const DemoLanding = lazy(() => import('./pages/DemoLanding'));

// Settings sections — lazy
const GeneralSettings = lazy(() => import("./components/settings/sections/GeneralSettings"));
const NotificationSettings = lazy(() => import("./components/settings/sections/NotificationSettings"));
const AppearanceSettings = lazy(() => import("./components/settings/sections/AppearanceSettings"));
const CompanySettings = lazy(() => import("./components/settings/sections/CompanySettings"));
const QuoteSettings = lazy(() => import("./components/settings/sections/QuoteSettings"));
const EmployeeSettings = lazy(() => import("./components/settings/sections/EmployeeSettings"));
const AiAgentSettingsSection = lazy(() => import("./components/settings/sections/AiAgentSettingsSection"));
const AutomationSettings = lazy(() => import("./components/settings/sections/AutomationSettings"));
const WebhookSettings = lazy(() => import("./components/settings/sections/WebhookSettings"));
const SecuritySettings = lazy(() => import("./components/settings/sections/SecuritySettings"));
const BillingSettings = lazy(() => import("./components/settings/sections/BillingSettings"));
const CommunicationSettings = lazy(() => import("./components/settings/sections/CommunicationSettings"));
const WorkspaceSettings = lazy(() => import("./components/settings/sections/WorkspaceSettings"));
const DataImportSettings = lazy(() => import("./components/settings/sections/DataImportSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </div>
);

const lazyRoute = (node: React.ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteFallback />}>{node}</Suspense>
  </ErrorBoundary>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <WorkspaceProvider>
              <CRMProvider>
                <TooltipProvider>
                  <TourProvider>
                    <Toaster />
                    <Sonner />
                    <ErrorBoundary>
                      <Suspense fallback={<RouteFallback />}>
                        <Routes>
                          <Route path="/auth" element={lazyRoute(<Auth />)} />
                          <Route path="/auth/cyberlsi/callback" element={lazyRoute(<CyberLSICallback />)} />
                          <Route path="/reset-password" element={lazyRoute(<ResetPassword />)} />
                          <Route path="/demo" element={lazyRoute(<DemoLanding />)} />
                          <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                            <Route index element={lazyRoute(<Index />)} />
                            <Route path="dashboard" element={lazyRoute(<Dashboard />)} />
                            <Route path="customers" element={lazyRoute(<Customers />)} />
                            <Route path="conversations" element={lazyRoute(<Conversations />)} />
                            <Route path="email" element={lazyRoute(<EmailIntegration />)} />
                            <Route path="onboarding" element={lazyRoute(<Onboarding />)} />
                            <Route path="pipeline" element={lazyRoute(<Pipeline />)} />
                            <Route path="analytics" element={lazyRoute(<Analytics />)} />
                            <Route path="projects" element={lazyRoute(<ProjectManagement />)} />
                            <Route path="quotes" element={lazyRoute(<QuoteInvoice />)} />
                            <Route path="finance" element={lazyRoute(<Finance />)} />
                            <Route path="employees" element={lazyRoute(<Employees />)} />
                            <Route path="documentation" element={lazyRoute(<Documentation />)} />
                            <Route path="cancellation-policy" element={lazyRoute(<CancellationPolicy />)} />
                            <Route path="terms-of-service" element={lazyRoute(<TermsOfService />)} />
                            <Route path="audit-log" element={lazyRoute(<AdminProtectedRoute element={<AuditLog />} />)} />
                            <Route path="integrations" element={lazyRoute(<Integrations />)} />
                            <Route path="automations" element={lazyRoute(<Automations />)} />
                            <Route path="notifications" element={lazyRoute(<NotificationHistory />)} />

                            {/* Settings Routes */}
                            <Route path="settings" element={lazyRoute(<Settings />)}>
                              <Route path="general" element={lazyRoute(<GeneralSettings />)} />
                              <Route path="workspace" element={lazyRoute(<WorkspaceSettings />)} />
                              <Route path="notifications" element={lazyRoute(<NotificationSettings />)} />
                              <Route path="appearance" element={lazyRoute(<AppearanceSettings />)} />
                              <Route path="company" element={lazyRoute(<AdminProtectedRoute element={<CompanySettings />} redirectTo="/settings/general" />)} />
                              <Route path="quotes" element={lazyRoute(<AdminProtectedRoute element={<QuoteSettings />} redirectTo="/settings/general" />)} />
                              <Route path="employees" element={lazyRoute(<AdminProtectedRoute element={<EmployeeSettings />} redirectTo="/settings/general" />)} />
                              <Route path="ai-agent" element={lazyRoute(<AdminProtectedRoute element={<AiAgentSettingsSection />} redirectTo="/settings/general" />)} />
                              <Route path="communications" element={lazyRoute(<AdminProtectedRoute element={<CommunicationSettings />} redirectTo="/settings/general" />)} />
                              <Route path="automations" element={lazyRoute(<AdminProtectedRoute element={<AutomationSettings />} redirectTo="/settings/general" />)} />
                              <Route path="webhooks" element={lazyRoute(<AdminProtectedRoute element={<WebhookSettings />} redirectTo="/settings/general" />)} />
                              <Route path="security" element={lazyRoute(<AdminProtectedRoute element={<SecuritySettings />} redirectTo="/settings/general" />)} />
                              <Route path="billing" element={lazyRoute(<OwnerProtectedRoute element={<BillingSettings />} redirectTo="/settings/general" />)} />
                              <Route path="import" element={lazyRoute(<AdminProtectedRoute element={<DataImportSettings />} redirectTo="/settings/general" />)} />
                            </Route>
                          </Route>
                          <Route path="*" element={lazyRoute(<NotFound />)} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </TourProvider>
                </TooltipProvider>
              </CRMProvider>
            </WorkspaceProvider>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
