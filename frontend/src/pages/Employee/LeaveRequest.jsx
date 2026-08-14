import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClipboardList, PlusCircle, CalendarDays, ShieldAlert, CheckCircle, FileText, Trash2 } from 'lucide-react';

export const LeaveRequestPage = () => {
  const { leaves, submitLeaveRequest } = useApp();

  // Form States
  const [type, setType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Local Leave Cancel Simulation
  const [localLeaves, setLocalLeaves] = useState([]);

  // Sync state if leaves change
  useEffect(() => {
    setLocalLeaves(leaves || []);
  }, [leaves]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setErrorMessage('End date cannot be prior to start date.');
      return;
    }

    submitLeaveRequest(type, startDate, endDate, reason);
    
    // Clear form
    setStartDate('');
    setEndDate('');
    setReason('');
    
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const cancelRequest = (id) => {
    if (window.confirm("Are you sure you want to cancel this pending leave request?")) {
      setLocalLeaves(prev => prev.filter(req => req.id !== id));
      alert("Leave application cancelled successfully.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:text-2xl">Leave Management</h1>
        <p className="text-xs text-slate-400 font-medium">Apply for commercial or health leaves, manage corporate balances, and view administrative approvals.</p>
      </div>

      {submitSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>Leave request submitted. Operations and HR have been notified for review.</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="h-4.5 w-4.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Apply Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <PlusCircle className="h-4.5 w-4.5 text-indigo-600" />
            Apply For Leave
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Leave Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Maternity/Paternity">Maternity / Paternity</option>
                <option value="Unpaid Leave">Unpaid / Loss of Pay</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason / Justification</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                placeholder="Briefly detail the operational reason for this leave request..."
                className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition"
            >
              Submit Application
            </button>
          </form>
        </div>

        {/* Right Column: Audit Logs History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
              Application Audit Log
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total logs: {localLeaves.length}
            </span>
          </div>

          {localLeaves.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              <CalendarDays className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700 mt-3">No Leave Applications Found</p>
              <p className="text-[10px] text-slate-400 mt-1">Submit your first application on the left panel.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-1">Ref ID</th>
                    <th className="py-3 px-1">Type</th>
                    <th className="py-3 px-1">Duration</th>
                    <th className="py-3 px-1">Total</th>
                    <th className="py-3 px-1">Status</th>
                    <th className="py-3 px-1">Reason</th>
                    <th className="py-3 px-1 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {localLeaves.map((req) => {
                    const badgeColors = {
                      Pending: 'bg-amber-50 text-amber-700 border-amber-100',
                      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      Rejected: 'bg-rose-50 text-rose-700 border-rose-100'
                    }[req.status] || 'bg-slate-50 text-slate-700 border-slate-100';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-1 font-mono font-bold text-indigo-600">{req.id}</td>
                        <td className="py-4 px-1 font-semibold text-slate-800">{req.type}</td>
                        <td className="py-4 px-1 text-slate-500 font-medium">
                          <span className="block">{req.startDate}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">to {req.endDate}</span>
                        </td>
                        <td className="py-4 px-1 font-mono text-slate-700 font-bold">{req.totalDays} d</td>
                        <td className="py-4 px-1">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeColors}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 px-1 max-w-[150px] truncate font-medium text-slate-500" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-4 px-1 text-center">
                          {req.status === 'Pending' ? (
                            <button
                              onClick={() => cancelRequest(req.id)}
                              className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"
                              title="Cancel Request"
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 p-4 text-[11px] text-slate-600 flex items-start gap-2.5 mt-2">
            <FileText className="h-4.5 w-4.5 shrink-0 text-indigo-600" />
            <div>
              <p className="font-bold text-indigo-950">Corporate Leave Regulations</p>
              <ul className="mt-1 space-y-1 list-disc list-inside leading-relaxed text-slate-600">
                <li>Sick Leave requests must be backed by official healthcare documents if exceeding 2 continuous days.</li>
                <li>Annual plans require submit approval at least <strong>14 days prior</strong> to departure schedules.</li>
                <li>Leave cancellations are only permissible while the application status remains <strong className="text-amber-700 font-semibold uppercase">Pending</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
