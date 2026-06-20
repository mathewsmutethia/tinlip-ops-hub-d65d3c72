import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RoleProvider, useRole, type UserRole } from "@/contexts/RoleContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import PendingApprovals from "@/pages/am/PendingApprovals";
import ClientsPage from "@/pages/am/ClientsPage";
import VehiclesPage from "@/pages/am/VehiclesPage";
import IncidentsPage from "@/pages/am/IncidentsPage";
import IncidentDetailPage from "@/pages/am/IncidentDetailPage";
import ServiceProvidersPage from "@/pages/am/ServiceProvidersPage";
import SettingsPage from "@/pages/am/SettingsPage";
import InvoicesPage from "@/pages/finance/InvoicesPage";
import PaymentsPage from "@/pages/finance/PaymentsPage";
import ClaimsPayoutsPage from "@/pages/finance/ClaimsPayoutsPage";
import ReconciliationPage from "@/pages/finance/ReconciliationPage";
import ReportsPage from "@/pages/finance/ReportsPage";
import ClientsOverview from "@/pages/ceo/ClientsOverview";
import IncidentsOverview from "@/pages/ceo/IncidentsOverview";
import FinancialSummary from "@/pages/ceo/FinancialSummary";
import AuditLogsPage from "@/pages/ceo/AuditLogsPage";
import ExportReportsPage from "@/pages/ceo/ExportReportsPage";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { role } = useRole();
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { isLoggedIn, loading } = useRole();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Account Manager + CEO */}
        <Route element={<ProtectedRoute allowedRoles={['account_manager', 'ceo']} />}>
          <Route path="/approvals" element={<PendingApprovals />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/providers" element={<ServiceProvidersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Finance + CEO */}
        <Route element={<ProtectedRoute allowedRoles={['finance', 'ceo']} />}>
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/claims" element={<ClaimsPayoutsPage />} />
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* CEO only */}
        <Route element={<ProtectedRoute allowedRoles={['ceo']} />}>
          <Route path="/clients-overview" element={<ClientsOverview />} />
          <Route path="/incidents-overview" element={<IncidentsOverview />} />
          <Route path="/financial-summary" element={<FinancialSummary />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/export-reports" element={<ExportReportsPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
