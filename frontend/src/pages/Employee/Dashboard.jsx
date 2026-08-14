import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  Bell,
  Megaphone,
  UserCheck,
  TrendingUp,
  CalendarDays
} from 'lucide-react';

export const Dashboard = () => {
  const { user, attendance, leaves, announcements, checkInStatus } = useApp();

  const totalAttendanceDays = attendance ? attendance.length : 0;
  const onTimeDays = attendance ? attendance.filter(r => r.status === 'On Time').length : 0;
  const lateDays = attendance ? attendance.filter(r => r.status === 'Late').length : 0;
  const halfDays = attendance ? attendance.filter(r => r.status === 'Half Day').length : 0;

  const totalAllowedLeaves = 20;
  const approvedLeavesCount = leaves
    ? leaves
        .filter(l => l.status === 'Approved')
        .reduce((sum, current) => sum + current.totalDays, 0)
    : 0;
  const remainingLeaves = Math.max(0, totalAllowedLeaves - approvedLeavesCount);

  const attendanceRate = totalAttendanceDays > 0 
    ? Math.round(((onTimeDays + (halfDays * 0.5) + (lateDays * 0.9)) / totalAttendanceDays) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-xl"></div>
        <div className="absolute -bottom-10 right-20 h-28 w-28 rounded-full bg-violet-500/10 blur-xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Shift Session
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              You are signed in as <strong className="text-white font-semibold">{user.designation}</strong> in <strong className="text-white font-semibold">{user.department}</strong>.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
            <Clock className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Status</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {checkInStatus.checkedIn ? `Checked In (at ${checkInStatus.lastCheckInTime})` : 'Not Checked In'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Monthly Attendance Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{attendanceRate}%</span>
            <span className="text-xs font-medium text-emerald-600 font-mono">KPI Target Met</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
            <span>Based on past {totalAttendanceDays} logs</span>
          </div>
        </div>

        {/* Metric 2: Remaining Leaves */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leaves Balance</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{remainingLeaves} <span className="text-sm font-medium text-slate-400">Days</span></span>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 font-bold rounded">Active</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full" 
                style={{ width: `${(remainingLeaves / totalAllowedLeaves) * 100}%` }}
              ></div>
            </div>
            <span className="shrink-0 font-mono text-[10px] font-bold">{remainingLeaves}/{totalAllowedLeaves} left</span>
          </div>
        </div>

        {/* Metric 3: Active Leave Applications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Leaves</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {leaves ? leaves.filter(l => l.status === 'Pending').length : 0} <span className="text-sm font-medium text-slate-400">Pending</span>
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>Awaiting Operational Sign-Off</span>
          </div>
        </div>

        {/* Metric 4: Direct Team Size Simulation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industrial Shift</span>
            <div className="rounded-xl bg-slate-50 p-2 text-slate-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">Shift Alpha</span>
            <span className="text-xs font-medium text-indigo-600 font-mono">09:00 - 17:00</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <span>Automation Lab - Main Bay</span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Announcements Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Admin & HR Announcements</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
              {announcements ? announcements.length : 0} Updates
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann) => {
                const themeMap = {
                  Urgent: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', label: 'Urgent Alert' },
                  Holiday: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'Company Holiday' },
                  Policy: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', label: 'Policy Update' },
                  General: { bg: 'bg-slate-50', border: 'border-slate-150', text: 'text-slate-700', label: 'General Announcement' }
                }[ann.category] || { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', label: 'Notice' };

                return (
                  <div 
                    key={ann.id} 
                    className={`rounded-xl border p-4 transition hover:shadow-xs ${themeMap.bg} ${themeMap.border}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${themeMap.text}`}>
                        {themeMap.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-medium">{ann.date}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-800 tracking-tight">{ann.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    
                    <div className="mt-3.5 flex items-center justify-between border-t border-slate-200/55 pt-2.5 text-[10px] font-semibold text-slate-400 uppercase">
                      <span>Issued by: {ann.sender}</span>
                      <span className="text-indigo-600 hover:underline cursor-pointer">Acknowledge Read</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                <Megaphone className="h-8 w-8 mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-semibold">No active announcements</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Admin notifications will appear here once published.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Contacts & Policy Links */}
        <div className="space-y-6">
          {/* Shift Schedule Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-600" />
              Your Shift Roster
            </h3>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
                <span className="font-semibold text-slate-600">Monday - Friday</span>
                <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                  09:00 AM - 05:00 PM
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
                <span className="font-semibold text-slate-600">Saturday (Alternate)</span>
                <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                  09:00 AM - 01:00 PM
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100">
                <span className="font-semibold text-slate-600">Sunday</span>
                <span className="font-mono text-slate-400 font-bold bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                  OFF
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-[10px] text-slate-400 flex gap-1.5 items-start">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>Shift allocations can be adjusted via the Manager Dashboard. Contact Shift Lead if you require roster modifications.</span>
            </div>
          </div>

          {/* Quick Support / Escalation Desk */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-indigo-600" />
              Help & Escalation Desk
            </h3>
            
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HR Business Partner</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 font-sans">Corporate HR Team</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">hr@company.com</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IT Operations Helpdesk</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">SecureLine Desk</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">helpdesk@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
