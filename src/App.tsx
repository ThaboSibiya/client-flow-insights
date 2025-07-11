
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
import Pipeline from "./pages/Pipeline";
import Onboarding from "./pages/Onboarding";

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
                
                <Route path="/dashboard" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Dashboard />} />
                </Route>
                
                <Route path="/conversations" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Conversations />} />
                </Route>
                
                <Route path="/customers" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Customers />} />
                </Route>
                
                <Route path="/tickets" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Tickets />} />
                </Route>
                
                <Route path="/analytics" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Analytics />} />
                </Route>
                
                <Route path="/quotes" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Quotes />} />
                </Route>
                
                <Route path="/automations" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Automations />} />
                </Route>
                
                <Route path="/pipeline" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Pipeline />} />
                </Route>
                
                <Route path="/onboarding" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Onboarding />} />
                </Route>
                
                <Route path="/employees" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<EmployeeManagement />} />
                </Route>
                
                <Route path="/settings" element={<ProtectedRoute element={<MainLayout />} />}>
                  <Route index element={<Settings />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
