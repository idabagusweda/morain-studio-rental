import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import Overview from "./pages/admin/Overview";
import Bookings from "./pages/admin/Bookings";
import Calendar from "./pages/admin/Calendar";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import PaymentReturn from "./pages/PaymentReturn";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={null} />
                <Route path="riwayat" element={null} />
                <Route path="profil" element={null} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Payment Return Route */}
              <Route path="/payment-return" element={<PaymentReturn />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
