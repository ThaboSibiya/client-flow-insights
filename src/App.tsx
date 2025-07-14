
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Customers from "@/pages/Customers";
import QuoteInvoice from "@/pages/QuoteInvoice";
import Tickets from "@/pages/Tickets";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Employees from "@/pages/Employees";
import CustomerInsights from "@/pages/Customer Insights";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ProtectedRoute element={<Index />} />} />
              <Route path="customers" element={<ProtectedRoute element={<Customers />} />} />
              <Route path="quotes" element={<ProtectedRoute element={<QuoteInvoice />} />} />
              <Route path="tickets" element={<ProtectedRoute element={<Tickets />} />} />
              <Route path="analytics" element={<ProtectedRoute element={<Analytics />} />} />
              <Route path="settings" element={<ProtectedRoute element={<Settings />} />} />
              <Route path="employees" element={<ProtectedRoute element={<Employees />} />} />
              <Route path="customer-insights" element={<ProtectedRoute element={<CustomerInsights />} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
