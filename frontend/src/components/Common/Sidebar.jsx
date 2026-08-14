import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  User,
  Clock,
  ClipboardList,
  FileText,
  X,
  Building2,
  ShieldAlert,
  ChevronRight,
  Megaphone,
  FilePieChart,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, roleView, logout } = useApp();

  const handleSidebarLogout = () => {
    logout();
    localStorage.removeItem('ems_authenticated');
    localStorage.removeItem('ems_user');
    sessionStorage.removeItem('ems_authenticated');
    sessionStorage.removeItem('ems_user');
    window.location.hash = '#/login';
    window.location.reload();
  };

  const isAdmin = user?.role === 'Admin';

  const employeeNavigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Leave Requests', path: '/leaves', icon: ClipboardList },
    { name: 'Salary Slips', path: '/salary-slips', icon: FileText },
  ];

  const adminNavigationItems = [
    { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Manage Employees', path: '/admin/employees', icon: User },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Attendance Register', path: '/admin/attendance', icon: Clock },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: ClipboardList },
    { name: 'Payroll & Salary', path: '/admin/payroll', icon: FileText },
    { name: 'Bulletin Board', path: '/admin/announcements', icon: Megaphone },
    { name: 'Reports', path: '/admin/reports', icon: FilePieChart },
  ];

  const navigationItems = isAdmin ? adminNavigationItems : employeeNavigationItems;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              SOFTWALLET <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">EMS</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">Enterprise Workspace</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
          aria-label="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="flex items-center gap-3.5 border-b border-slate-800/80 px-6 py-5 bg-slate-900/60">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150'}
          alt={user?.name || 'User'}
          className="h-12 w-12 rounded-xl border-2 border-indigo-500/30 object-cover shadow-sm"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-white tracking-wide">{user?.name || 'Employee'}</h4>
          <p className="truncate text-xs text-slate-400 font-medium">{user?.designation || user?.role}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-300">
              {user?.id || 'EMP-001'}
            </span>
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${isAdmin ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
              {user?.role || 'Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>{isAdmin ? 'Administration Portal' : 'Employee Workspace'}</span>
          <span className="text-[10px] font-normal text-slate-400 lowercase font-mono">({navigationItems.length} links)</span>
        </div>
        {navigationItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span className="flex-1 text-[13px]">{item.name}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-150 ${isActive ? 'opacity-100 translate-x-0 text-indigo-200' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-slate-500'}`} />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role view active helper */}
      {roleView !== 'Employee' && (
        <div className="mx-4 mb-2 rounded-xl bg-indigo-950/60 border border-indigo-500/20 p-3.5 text-xs text-indigo-300">
          <div className="flex gap-2.5">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
            <div>
              <p className="font-bold text-indigo-200">Simulation View Active</p>
              <p className="text-[11px] text-indigo-300/80 mt-0.5 leading-relaxed">
                Viewing as <strong className="text-white">{roleView}</strong>. Switch role anytime in top bar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Action */}
      <div className="px-4 py-2 border-t border-slate-800/70">
        <button
          onClick={handleSidebarLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition group"
        >
          <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-800/80 p-4 text-center space-y-1 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 font-mono tracking-wider font-semibold">
          SOFTWALLET EMS v1.0
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          Assigned to: <span className="text-slate-300 font-semibold">Varshik Pal</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Back-drop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition lg:hidden"
        />
      )}

      {/* Desktop static sidebar - enlarged width */}
      <aside className="hidden w-72 xl:w-80 shrink-0 border-r border-slate-800 bg-slate-900 lg:block transition-all duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile drawer sidebar - enlarged width */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};