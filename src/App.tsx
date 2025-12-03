import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import StockReceiving from "./pages/StockReceiving";
import StockIssuance from "./pages/StockIssuance";
import Custodians from "./pages/Custodians";
import CustodianDetail from "./pages/CustodianDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DepartmentRequests from "./pages/DepartmentRequests";
import PhysicalCounts from "./pages/PhysicalCounts";
import UserRoles from "./pages/UserRoles";
import StockCard from "./pages/StockCard";
import StockCardNew from "./pages/StockCardNew";
import PhysicalCountDetail from "./pages/PhysicalCountDetail";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="items" element={<Items />} />
              <Route path="stock-receiving" element={<StockReceiving />} />
              <Route path="stock-issuance" element={<StockIssuance />} />
              <Route path="custodians" element={<Custodians />} />
              <Route path="custodians/:id" element={<CustodianDetail />} />
              <Route path="department-requests" element={<DepartmentRequests />} />
              <Route path="physical-count" element={<PhysicalCounts />} />
              <Route path="physical-count/:id" element={<PhysicalCountDetail />} />
              <Route path="stock-card" element={<StockCardNew />} />
              <Route path="settings" element={<Settings />} />
              <Route path="user-roles" element={<UserRoles />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
