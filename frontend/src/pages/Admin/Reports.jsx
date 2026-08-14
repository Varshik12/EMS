import React, { useState, useEffect } from 'react';
import { FileDown, Printer, Filter, Database, TrendingUp, Users, Calendar, HelpCircle } from 'lucide-react';

export const Reports = () => {
  const [reportType, setReportType] = useState('employee'); // employee, attendance, leave, salary
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departments, setDepartments] = useState([]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'employee') {
        const res = await fetch('/api/employees');
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        }
      } else if (reportType === 'attendance') {
        const res = await fetch('/api/attendance?all=true');
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        }
      } else if (reportType === 'leave') {
        const res = await fetch('/api/leaves?all=true');
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        }
      } else if (reportType === 'salary') {
        const res = await fetch('/api/salaryslips?all=true');
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        }
      }

      const deptRes = await fetch('/api/departments');
      const deptData = await deptRes.json();
      if (deptData.success) {
        setDepartments(deptData.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  // Export to CSV Function
  const exportToCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === 'employee') {
      headers = ['ID', 'Name', 'Email', 'Department', 'Designation', 'Joining Date', 'Status', 'Salary'];
      rows = filteredData.map(emp => [
        emp.id, emp.name, emp.email, emp.department, emp.designation, emp.joiningDate, emp.status, emp.salary || 50000
      ]);
    } else if (reportType === 'attendance') {
      headers = ['Employee', 'Employee ID', 'Date', 'Check In', 'Check Out', 'Hours Worked', 'Status'];
      rows = filteredData.map(rec => [
        rec.employeeName, rec.userId, rec.date, rec.checkIn, rec.checkOut, rec.hoursWorked, rec.status
      ]);
    } else if (reportType === 'leave') {
      headers = ['Employee', 'Employee ID', 'Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Reason'];
      rows = filteredData.map(l => [
        l.employeeName, l.userId, l.type, l.startDate, l.endDate, l.totalDays, l.status, l.reason
      ]);
    } else if (reportType === 'salary') {
      headers = ['ID', 'Employee', 'Employee ID', 'Cycle', 'Basic Salary', 'Deductions', 'Bonus & Allow.', 'Net Payout'];
      rows = filteredData.map(s => [
        s.id, s.employeeName, s.userId, `${s.month} ${s.year}`, s.basic, s.deductions, (s.bonus || 0) + (s.allowances || 0), s.netSalary
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Data
  const filteredData = data.filter(item => {
    if (reportType === 'employee') {
      const matchDept = deptFilter === 'All' || item.department === deptFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchDept && matchStatus;
    }
    if (reportType === 'attendance') {
      return deptFilter === 'All' || item.department === deptFilter;
    }
    if (reportType === 'leave') {
      return deptFilter === 'All' || item.department === deptFilter;
    }
    if (reportType === 'salary') {
      return deptFilter === 'All' || item.department === deptFilter;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Administrative Reports</h1>
          <p className="text-sm font-semibold text-slate-500">
            Generate and export custom rosters, attendance logs, leave authorizations, and salary reports.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition"
          >
            <FileDown className="h-4.5 w-4.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Select Report Category */}
      <div className="grid gap-4 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {['employee', 'attendance', 'leave', 'salary'].map(type => (
          <button
            key={type}
            onClick={() => { setReportType(type); setDeptFilter('All'); setStatusFilter('All'); }}
            className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition duration-200 ${
              reportType === type 
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 ring-2 ring-indigo-600/10' 
                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span className="text-xs font-bold capitalize">{type} Audit Report</span>
            <span className="text-[10px] text-slate-400 font-semibold font-sans">
              {type === 'employee' ? 'Headcount, designations & profiles' :
               type === 'attendance' ? 'Daily check-ins & punctuality rate' :
               type === 'leave' ? 'Sick/Casual requests & histories' :
               'Payroll cycles & expenditures'}
            </span>
          </button>
        ))}
      </div>

      {/* Segment filters */}
      <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Department Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Segment</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter (Only for Employee Report) */}
        {reportType === 'employee' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        )}

        {/* Quick details */}
        <div className="flex items-end text-xs font-bold text-slate-500 pb-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400">Matching Records</p>
            <p className="text-sm font-extrabold text-slate-800">{filteredData.length} records found</p>
          </div>
        </div>
      </div>

      {/* Reports Data View */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {reportType === 'employee' && (
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6">Employee ID</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Designation</th>
                      <th className="py-4 px-6">Salary (Monthly)</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredData.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-mono text-slate-500">{emp.id}</td>
                        <td className="py-3 px-6 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-3 px-6 text-slate-500">{emp.email}</td>
                        <td className="py-3 px-6 text-slate-900">{emp.department}</td>
                        <td className="py-3 px-6 text-slate-600">{emp.designation}</td>
                        <td className="py-3 px-6 font-bold text-slate-800">INR {(emp.salary || 45000).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-6">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'attendance' && (
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Check In</th>
                      <th className="py-4 px-6">Check Out</th>
                      <th className="py-4 px-6">Hours Worked</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredData.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-bold text-slate-900">{rec.employeeName}</td>
                        <td className="py-3 px-6 font-mono text-slate-500">{rec.userId}</td>
                        <td className="py-3 px-6 text-slate-500">{rec.date}</td>
                        <td className="py-3 px-6 text-slate-900">{rec.checkIn || '--'}</td>
                        <td className="py-3 px-6 text-slate-900">{rec.checkOut || 'Active'}</td>
                        <td className="py-3 px-6 font-mono text-slate-500">{rec.hoursWorked || '--'}</td>
                        <td className="py-3 px-6">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${rec.status === 'On Time' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'leave' && (
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Start Date</th>
                      <th className="py-4 px-6">End Date</th>
                      <th className="py-4 px-6">Total Days</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredData.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-bold text-slate-900">{l.employeeName}</td>
                        <td className="py-3 px-6 font-mono text-slate-500">{l.userId}</td>
                        <td className="py-3 px-6 text-slate-900 font-bold">{l.type}</td>
                        <td className="py-3 px-6 text-slate-500">{l.startDate}</td>
                        <td className="py-3 px-6 text-slate-500">{l.endDate}</td>
                        <td className="py-3 px-6 font-bold text-indigo-600">{l.totalDays} Days</td>
                        <td className="py-3 px-6">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                            l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            l.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'salary' && (
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Month Cycle</th>
                      <th className="py-4 px-6">Basic Salary</th>
                      <th className="py-4 px-6">Deductions</th>
                      <th className="py-4 px-6">Allowances & Bonus</th>
                      <th className="py-4 px-6">Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredData.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-mono text-slate-500 text-[11px]">{s.id}</td>
                        <td className="py-3 px-6 font-bold text-slate-900">{s.employeeName}</td>
                        <td className="py-3 px-6 text-indigo-600 font-bold">{s.month} {s.year}</td>
                        <td className="py-3 px-6 text-slate-600">INR {s.basic.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-6 text-rose-600">-{s.deductions.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-6 text-emerald-600">+{((s.bonus || 0) + (s.allowances || 0)).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-6 font-extrabold text-slate-900">INR {s.netSalary.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
