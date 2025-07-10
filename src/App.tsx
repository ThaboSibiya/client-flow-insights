
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CRMProvider } from "@/context/CRMContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmployeeSetup from "./pages/EmployeeSetup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Onboarding from "./pages/Onboarding";
import Pipeline from "./pages/Pipeline";
import Analytics from "./pages/Analytics";
import QuoteInvoice from "./pages/QuoteInvoice";
import Employees from "./pages/Employees";
import CustomerInsights from "./pages/Customer Insights";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CRMProvider>
            <div className="min-h-screen bg-gradient-to-br from-quikle-crystal via-white to-quikle-crystal/30">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/employee-setup" element={<EmployeeSetup />} />
                <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="onboarding" element={<Onboarding />} />
                  <Route path="pipeline" element={<Pipeline />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="quotes" element={<QuoteInvoice />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="customer-insights" element={<CustomerInsights />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </CRMProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
