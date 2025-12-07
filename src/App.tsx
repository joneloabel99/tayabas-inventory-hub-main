import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Login from "./pages/Login";
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
import StockCardNew from "./pages/StockCardNew";
import PhysicalCountDetail from "./pages/PhysicalCountDetail";
import { RoleGuard } from "./components/RoleGuard";
import { PERMISSIONS } from "./config/rolePermissions";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<RoleGuard permission={PERMISSIONS.DASHBOARD}><Dashboard /></RoleGuard>} />
                <Route path="items" element={<RoleGuard permission={PERMISSIONS.ITEMS_MANAGEMENT}><Items /></RoleGuard>} />
                <Route path="stock-receiving" element={<RoleGuard permission={PERMISSIONS.STOCK_RECEIVING}><StockReceiving /></RoleGuard>} />
                <Route path="stock-issuance" element={<RoleGuard permission={PERMISSIONS.STOCK_ISSUANCE}><StockIssuance /></RoleGuard>} />
                <Route path="custodians" element={<RoleGuard permission={PERMISSIONS.CUSTODIANS}><Custodians /></RoleGuard>} />
                <Route path="custodians/:id" element={<RoleGuard permission={PERMISSIONS.CUSTODIANS}><CustodianDetail /></RoleGuard>} />
                <Route path="department-requests" element={<RoleGuard permission={PERMISSIONS.DEPT_REQUESTS}><DepartmentRequests /></RoleGuard>} />
                <Route path="physical-count" element={<RoleGuard permission={PERMISSIONS.PHYSICAL_COUNT}><PhysicalCounts /></RoleGuard>} />
                <Route path="physical-count/:id" element={<RoleGuard permission={PERMISSIONS.PHYSICAL_COUNT}><PhysicalCountDetail /></RoleGuard>} />
                <Route path="stock-card" element={<RoleGuard permission={PERMISSIONS.STOCK_CARD}><StockCardNew /></RoleGuard>} />
                <Route path="settings" element={<RoleGuard permission={PERMISSIONS.SETTINGS}><Settings /></RoleGuard>} />
                <Route path="user-roles" element={<RoleGuard permission={PERMISSIONS.USER_ROLES}><UserRoles /></RoleGuard>} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;