import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";

// Admin Pages
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CustomersPage } from "@/pages/admin/CustomersPage";
import { CustomerDetailPage } from "@/pages/admin/CustomerDetailPage";
import { LoansPage } from "@/pages/admin/LoansPage";
import { SavingsPage } from "@/pages/admin/SavingsPage";
import { DuePage } from "@/pages/admin/DuePage";
import { BranchesPage } from "@/pages/admin/BranchesPage";
import { StaffPage } from "@/pages/admin/StaffPage";
import { ReportsPage } from "@/pages/admin/ReportsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";

// Staff Pages
import { StaffDashboardPage } from "@/pages/staff/StaffDashboardPage";
import { StaffDuePage } from "@/pages/staff/StaffDuePage";
import { StaffCustomersPage } from "@/pages/staff/StaffCustomersPage";
import { StaffCollectionsPage } from "@/pages/staff/StaffCollectionsPage";

// Customer Pages
import { CustomerOverviewPage } from "@/pages/customer/CustomerOverviewPage";
import { CustomerLoanPage } from "@/pages/customer/CustomerLoanPage";
import { CustomerSavingsPage } from "@/pages/customer/CustomerSavingsPage";
import { CustomerReceiptsPage } from "@/pages/customer/CustomerReceiptsPage";

// Shared Pages
import { UserProfilePage } from "@/pages/shared/UserProfilePage";

// Protected Route Guard Wrapper
const ProtectedLayout: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/customer/overview" replace />;
  }

  return <AppLayout />;
};

// Root redirection helper
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/customer/overview" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* ─── ADMIN PORTAL ROUTES ─────────────────────────────────── */}
        <Route element={<ProtectedLayout allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/admin/loans" element={<LoansPage />} />
          <Route path="/admin/savings" element={<SavingsPage />} />
          <Route path="/admin/due" element={<DuePage />} />
          <Route path="/admin/branches" element={<BranchesPage />} />
          <Route path="/admin/staff" element={<StaffPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/profile" element={<UserProfilePage />} />
        </Route>

        {/* ─── STAFF FIELD PORTAL ROUTES ───────────────────────────── */}
        <Route element={<ProtectedLayout allowedRoles={["staff"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/due" element={<StaffDuePage />} />
          <Route path="/staff/customers" element={<StaffCustomersPage />} />
          <Route path="/staff/collections" element={<StaffCollectionsPage />} />
          <Route path="/staff/profile" element={<UserProfilePage />} />
        </Route>

        {/* ─── CUSTOMER SELF-SERVICE PORTAL ROUTES ─────────────────── */}
        <Route element={<ProtectedLayout allowedRoles={["customer"]} />}>
          <Route path="/customer/overview" element={<CustomerOverviewPage />} />
          <Route path="/customer/loan" element={<CustomerLoanPage />} />
          <Route path="/customer/savings" element={<CustomerSavingsPage />} />
          <Route path="/customer/receipts" element={<CustomerReceiptsPage />} />
          <Route path="/customer/profile" element={<UserProfilePage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
