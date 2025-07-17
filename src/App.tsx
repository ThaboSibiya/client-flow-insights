
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Onboarding from './pages/Onboarding';
import CustomerDetails from './pages/CustomerDetails';
import Quotes from './pages/Quotes';
import QuoteDetails from './pages/QuoteDetails';
import Invoices from './pages/Invoices';
import FormBuilder from './pages/FormBuilder';
import CustomerInsights from './pages/Customer Insights';
import TemplateManagement from './pages/TemplateManagement';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CRMProvider>
            <div className="min-h-screen bg-gradient-to-br from-quikle-crystal via-quikle-platinum to-quikle-crystal">
              <Toaster />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/customers/:customerId" element={<CustomerDetails />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/quotes/:quoteId" element={<QuoteDetails />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/form-builder" element={<FormBuilder />} />
                <Route path="/customer-insights" element={<CustomerInsights />} />
                <Route path="/template-management" element={<TemplateManagement />} />
              </Routes>
            </div>
          </CRMProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
