import React, { useState, useEffect } from 'react';
import { FileClock, Check, X, Calendar, User, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { getLeaves, updateLeaveStatus } from '../../api/api';

export const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // Pending, Approved, Rejected

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getLeaves({ all: true });
      if (data.success) {
        setLeaves(data.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const data = await updateLeaveStatus(id, status);
      if (data.success) {
        setLeaves(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      } else {
        alert(data.error || 'Failed to update leave request.');
      }
    } catch (err) {
      alert('Error updating leave status.');
    }
  };

  const filteredLeaves = leaves.filter(item => item.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Leave Authorizations</h1>
          <p className="text-sm font-semibold text-slate-500">
            Review, approve, or decline corporate leave requests.
          </p>
        </div>
        <button 
          onClick={fetchLeaves}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh List
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200">
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold border-b-2 transition-all relative ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab} Requests
            {tab === 'Pending' && leaves.filter(l => l.status === 'Pending').length > 0 && (
              <span className="absolute top-2.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white">
                {leaves.filter(l => l.status === 'Pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main content list */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLeaves.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-3">
              <FileClock className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-xs">No {activeTab.toLowerCase()} leave requests on register.</p>
            </div>
          ) : (
            filteredLeaves.map(req => (
              <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition">
                {/* Top User block */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                      <User className="h-4 w-4 text-indigo-500" />
                      {req.employeeName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {req.department} • <span className="font-mono">{req.userId}</span>
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    req.type.includes('Sick') ? 'bg-rose-50 text-rose-700' :
                    req.type.includes('Casual') ? 'bg-indigo-50 text-indigo-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {req.type}
                  </span>
                </div>

                {/* Date specifications */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-600">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                    <p className="text-slate-800 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {req.startDate} to {req.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Days</p>
                    <p className="text-indigo-600 font-extrabold text-sm">{req.totalDays} Days</p>
                  </div>
                </div>

                {/* Statement/Reason */}
                <div className="space-y-1 text-xs">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Statement of Reason
                  </p>
                  <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/60 font-medium">
                    {req.reason}
                  </p>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                  <span>Applied on: {req.appliedDate}</span>
                  {activeTab === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req.id, 'Rejected')}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'Approved')}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm transition"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      activeTab === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {activeTab} Request
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
