import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Bell, Menu, ChevronDown, ShieldAlert, Building2, Eye } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, roleView, setRoleView, logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const roleRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    logout();
    localStorage.removeItem('ems_authenticated');
    localStorage.removeItem('ems_user');
    sessionStorage.removeItem('ems_authenticated');
    sessionStorage.removeItem('ems_user');
    window.location.hash = '#/login';
    window.location.reload();
  };

  const notifications = [
    { id: 1, text: "Your leave request for July 15 has been submitted.", time: "10 mins ago", unread: true },
    { id: 2, text: "June Salary Slip is now available for download.", time: "2 days ago", unread: false },
    { id: 3, text: "Admin posted a Holiday Notice for July 4th.", time: "1 day ago", unread: false }
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-indigo-600" />
          <div>
            <span className="hidden text-xl font-bold tracking-tight text-slate-800 sm:block">
              SOFTWALLET <span className="text-indigo-600 font-semibold text-lg">EMS</span>
            </span>
            <span className="text-xs font-medium text-slate-400 block -mt-1 tracking-wider uppercase">
              Innovative Technologies
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Conditional Roles View Switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 hover:border-indigo-200"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Role View:</span> {roleView}
            <ChevronDown className="h-3 w-3" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-fade-in">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulate Viewpoint
              </div>
              <button
                onClick={() => {
                  setRoleView('Employee');
                  setRoleMenuOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                  roleView === 'Employee' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Employee (Active)
              </button>
              <button
                onClick={() => {
                  setRoleView('Manager');
                  setRoleMenuOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                  roleView === 'Manager' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Manager viewpoint
              </button>
              <button
                onClick={() => {
                  setRoleView('Admin');
                  setRoleMenuOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                  roleView === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Admin viewpoint
              </button>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none"
          >
            <Bell className="h-5.5 w-5.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-xs font-bold text-slate-700">Recent Alerts</span>
                <span className="text-[10px] font-medium text-indigo-600 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="mt-1 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map(noti => (
                  <div key={noti.id} className="p-3 transition hover:bg-slate-50">
                    <p className={`text-xs ${noti.unread ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                      {noti.text}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">{noti.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative flex items-center border-l border-slate-200 pl-3 md:pl-4">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8.5 w-8.5 rounded-full border border-slate-200 object-cover ring-2 ring-transparent transition group-hover:ring-indigo-100"
              referrerPolicy="no-referrer"
            />
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize">{user.designation}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-600" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-fade-in">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                <div className="mt-1.5 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 tracking-wider">
                  ID: {user.id}
                </div>
              </div>
              <div className="mt-1">
                <div className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 cursor-default">
                  <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
                  <span className="font-medium">System Mode:</span>
                  <span className="ml-auto font-bold text-slate-800">{roleView}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};