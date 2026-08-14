import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PrivateRoute } from './components/Common/PrivateRoute';
import { Navbar } from './components/Common/Navbar';
import { Sidebar } from './components/Common/Sidebar';

// Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { Dashboard } from './pages/Employee/Dashboard';
import { Profile } from './pages/Employee/Profile';
import { Attendance } from './pages/Employee/Attendance';
import { LeaveRequestPage } from './pages/Employee/LeaveRequest';
import { SalarySlips } from './pages/Employee/SalarySlips';

// Admin Pages
import { AdminDashboard } from './pages/Admin/Dashboard';
import { ManageEmployees } from './pages/Admin/ManageEmployees';
import { ManageDepartments } from './pages/Admin/ManageDepartments';
import { AttendanceManagement } from './pages/Admin/AttendanceManagement';
import { LeaveApproval } from './pages/Admin/LeaveApproval';
import { Payroll } from './pages/Admin/Payroll';
import { Announcements } from './pages/Admin/Announcements';
import { Reports } from './pages/Admin/Reports';
import { useApp } from './context/AppContext';

// Layout Component for Authenticated Sessions
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useApp();
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Inner Router Views */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto">
          <Routes>
            {/* General Routes */}
            <Route path="/" element={isAdmin ? <AdminDashboard /> : <Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Employee Routes */}
            {!isAdmin && (
              <>
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leaves" element={<LeaveRequestPage />} />
                <Route path="/salary-slips" element={<SalarySlips />} />
              </>
            )}

            {/* Admin Routes */}
            {isAdmin && (
              <>
                <Route path="/admin/employees" element={<ManageEmployees />} />
                <Route path="/admin/departments" element={<ManageDepartments />} />
                <Route path="/admin/attendance" element={<AttendanceManagement />} />
                <Route path="/admin/leaves" element={<LeaveApproval />} />
                <Route path="/admin/payroll" element={<Payroll />} />
                <Route path="/admin/announcements" element={<Announcements />} />
                <Route path="/admin/reports" element={<Reports />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Secure Employee Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
