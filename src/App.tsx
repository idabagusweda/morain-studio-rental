import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";

// Eager load landing page and dashboard (critical routes)
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PaymentReturn from "./pages/PaymentReturn";

// Lazy load admin routes (non-critical, reduce main bundle)
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Overview = lazy(() => import("./pages/admin/Overview"));
const Bookings = lazy(() => import("./pages/admin/Bookings"));
const Calendar = lazy(() => import("./pages/admin/Calendar"));
const Users = lazy(() => import("./pages/admin/Users"));
const Settings = lazy(() => import("./pages/admin/Settings"));

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

              {/* Admin Routes (lazy loaded) */}
              <Route path="/admin" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                  <AdminLayout />
                </Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Overview />
                  </Suspense>
                } />
                <Route path="bookings" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Bookings />
                  </Suspense>
                } />
                <Route path="calendar" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Calendar />
                  </Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Users />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Settings />
                  </Suspense>
                } />
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
