
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-quikle-crystal via-quikle-platinum to-quikle-crystal">
          <Toaster />
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/customers" element={<ProtectedRoute element={<Customers />} />} />
            <Route path="/onboarding" element={<ProtectedRoute element={<Onboarding />} />} />
            <Route path="/customers/:customerId" element={<ProtectedRoute element={<CustomerDetails />} />} />
            <Route path="/quotes" element={<ProtectedRoute element={<Quotes />} />} />
            <Route path="/quotes/:quoteId" element={<ProtectedRoute element={<QuoteDetails />} />} />
            <Route path="/invoices" element={<ProtectedRoute element={<Invoices />} />} />
            <Route path="/form-builder" element={<ProtectedRoute element={<FormBuilder />} />} />
            <Route path="/customer-insights" element={<ProtectedRoute element={<CustomerInsights />} />} />
            <Route path="/template-management" element={<ProtectedRoute element={<TemplateManagement />} />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
