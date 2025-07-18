
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Conversations from './pages/Conversations';
import Onboarding from './pages/Onboarding';
import CustomerDetails from './pages/CustomerDetails';
import Quotes from './pages/Quotes';
import QuoteDetails from './pages/QuoteDetails';
import Invoices from './pages/Invoices';
import FormBuilder from './pages/FormBuilder';
import CustomerInsights from './pages/Customer Insights';
import TemplateManagement from './pages/TemplateManagement';
import Settings from './pages/Settings';

// Minimal providers to prevent context errors
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const CRMProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CRMProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="conversations" element={<Conversations />} />
              <Route path="employees" element={<div>Employees Page - Coming Soon</div>} />
              <Route path="pipeline" element={<div>Pipeline Page - Coming Soon</div>} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="analytics" element={<div>Analytics Page - Coming Soon</div>} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="settings" element={<Settings />} />
              <Route path="customers/:customerId" element={<CustomerDetails />} />
              <Route path="quotes/:quoteId" element={<QuoteDetails />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="form-builder" element={<FormBuilder />} />
              <Route path="customer-insights" element={<CustomerInsights />} />
              <Route path="template-management" element={<TemplateManagement />} />
            </Route>
          </Routes>
        </CRMProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
