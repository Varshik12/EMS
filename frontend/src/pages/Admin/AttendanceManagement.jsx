import React, { useState, useEffect } from 'react';
import { Calendar, Search, Edit3, CheckCircle, RefreshCw, X, Clock, HelpCircle } from 'lucide-react';
import { getAttendance, getEmployees, updateAttendanceRecord } from '../../api/api';

export const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [employeeFilter, setEmployeeFilter] = useState('All');
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'On Time',
    checkIn: '',
    checkOut: '',
    hoursWorked: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all attendance for admin
      const attData = await getAttendance({ all: true });
      if (attData.success) {
        setAttendance(attData.data);
      }

      // Fetch employees
      const empData = await getEmployees();
      if (empData.success) {
        setEmployees(empData.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditOpen = (record) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status || 'On Time',
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      hoursWorked: record.hoursWorked || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateAttendanceRecord(selectedRecord.id, editForm);
      if (data.success) {
        // Refetch to refresh join fields
        await fetchData();
        setShowEditModal(false);
        setSelectedRecord(null);
      } else {
        alert(data.error || 'Failed to update attendance.');
      }
    } catch (err) {
      alert('Error updating attendance.');
    }
  };

  // Filter Logic
  const filteredAttendance = attendance.filter(rec => {
    const matchesDate = !dateFilter || rec.date === dateFilter;
    const matchesEmployee = employeeFilter === 'All' || rec.userId === employeeFilter;
    return matchesDate && matchesEmployee;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Attendance Register</h1>
          <p className="text-sm font-semibold text-slate-500">
            Audit daily check-ins, record punctuality, and resolve punch-card anomalies.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Register
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        {/* Date Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Date</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-4 w-4 text-slate-400" />
            </span>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Employee Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Employee</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Workforce</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Quick Action */}
        <div className="flex items-end">
          <button
            onClick={() => { setDateFilter(''); setEmployeeFilter('All'); }}
            className="w-full text-center rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            Clear All Register Filters
          </button>
        </div>
      </div>

      {/* Register Listing Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4.5 px-6">Employee</th>
                  <th className="py-4.5 px-6">Date</th>
                  <th className="py-4.5 px-6">Punch In</th>
                  <th className="py-4.5 px-6">Punch Out</th>
                  <th className="py-4.5 px-6">Duration</th>
                  <th className="py-4.5 px-6">Punctuality Status</th>
                  <th className="py-4.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No active check-in logs found for this date/employee selection.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{rec.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{rec.department} • <span className="font-mono">{rec.userId}</span></p>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{rec.date}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-slate-900">
                          <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {rec.checkIn || '--:--'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-slate-900">
                          <Clock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          {rec.checkOut || 'Active duty'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">{rec.hoursWorked || 'Running'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rec.status === 'On Time' ? 'bg-emerald-50 text-emerald-700' :
                          rec.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                          rec.status === 'Half Day' ? 'bg-indigo-50 text-indigo-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleEditOpen(rec)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Attendance Record Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Adjust Attendance Log
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-indigo-900 font-medium">
              Editing record for <span className="font-bold">{selectedRecord.employeeName}</span> on <span className="font-bold">{selectedRecord.date}</span>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Punctuality Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="On Time">On Time</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Punch In Time</label>
                  <input 
                    type="text"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    placeholder="e.g. 08:45 AM"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Punch Out Time</label>
                  <input 
                    type="text"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    placeholder="e.g. 05:12 PM"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Calculated Worked Duration</label>
                <input 
                  type="text"
                  value={editForm.hoursWorked}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hoursWorked: e.target.value }))}
                  placeholder="e.g. 8.5 hrs"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Apply Log Overwrite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
