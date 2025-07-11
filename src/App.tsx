
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Conversations from "./pages/Conversations";
import Customers from "./pages/Customers";
import Tickets from "./pages/Tickets";
import Analytics from "./pages/Analytics";
import Quotes from "./pages/Quotes";
import Automations from "./pages/Automations";
import EmployeeManagement from "./pages/EmployeeManagement";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/conversations" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Conversations />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/customers" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Customers />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/tickets" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Tickets />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Analytics />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/quotes" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Quotes />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/automations" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Automations />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/employees" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <EmployeeManagement />
                    </MainLayout>
                  } />
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute element={
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  } />
                } />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
