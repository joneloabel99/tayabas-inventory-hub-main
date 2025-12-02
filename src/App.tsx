import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import Auth from "@/pages/Auth";
import Custodians from "@/pages/Custodians";
import Dashboard from "@/pages/Dashboard";
import DepartmentRequests from "@/pages/DepartmentRequests";
import Items from "@/pages/Items";
import NotFound from "@/pages/NotFound";
import PhysicalCountNew from "@/pages/PhysicalCountNew";
import Settings from "@/pages/Settings";
import StockCardNew from "@/pages/StockCardNew";
import StockIssuance from "@/pages/StockIssuance";
import StockReceiving from "@/pages/StockReceiving";
import UserRoles from "@/pages/UserRoles";
import CustodianDetail from "@/pages/CustodianDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<RoleGuard allowedRoles={["admin", "manager", "staff"]}><Items /></RoleGuard>} />
            <Route path="/receiving" element={<RoleGuard allowedRoles={["admin", "manager", "staff"]}><StockReceiving /></RoleGuard>} />
            <Route path="/issuance" element={<RoleGuard allowedRoles={["admin", "manager", "staff"]}><StockIssuance /></RoleGuard>} />
            <Route path="/custodians" element={<Custodians />} />
            <Route path="/custodians/:id" element={<CustodianDetail />} />
            <Route path="/stock-card" element={<StockCardNew />} />
            <Route path="/physical-count" element={<RoleGuard allowedRoles={["admin", "manager", "staff"]}><PhysicalCountNew /></RoleGuard>} />
            <Route path="/requests" element={<RoleGuard allowedRoles={["admin", "manager"]}><DepartmentRequests /></RoleGuard>} />
            <Route path="/users" element={<RoleGuard allowedRoles={["admin"]}><UserRoles /></RoleGuard>} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
