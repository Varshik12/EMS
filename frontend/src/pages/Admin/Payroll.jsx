import React, { useState, useEffect } from 'react';
import { IndianRupee, FileText, Send, Calendar, Check, Search, HelpCircle, X, Plus } from 'lucide-react';
import { getSalarySlips, getEmployees, generateSalarySlip } from '../../api/api';

export const Payroll = () => {
  const [slips, setSlips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  
  const [formData, setFormData] = useState({
    month: 'July',
    year: '2026',
    basic: 45000,
    allowances: 10000,
    bonus: 5000,
    deductions: 3500
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSalarySlips({ all: true });
      if (data.success) {
        setSlips(data.data);
      }

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

  // Update form base salary when employee selection changes
  useEffect(() => {
    if (selectedEmp) {
      const emp = employees.find(e => e.id === selectedEmp);
      if (emp) {
        setFormData(prev => ({
          ...prev,
          basic: emp.salary || 45000
        }));
      }
    }
  }, [selectedEmp, employees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['basic', 'allowances', 'bonus', 'deductions'].includes(name) ? Number(value) : value
    }));
  };

  // Live Net Salary calculation
  const calculatedNet = formData.basic + (formData.allowances || 0) + (formData.bonus || 0) - (formData.deductions || 0);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) {
      alert('Please select an employee.');
      return;
    }

    try {
      const data = await generateSalarySlip(selectedEmp, formData);
      if (data.success) {
        setSlips(prev => [data.data, ...prev]);
        setShowGenModal(false);
        setSelectedEmp('');
        setFormData({
          month: 'July',
          year: '2026',
          basic: 45000,
          allowances: 10000,
          bonus: 5000,
          deductions: 3500
        });
        // Refetch to join details
        fetchData();
      } else {
        alert(data.error || 'Failed to generate salary slip.');
      }
    } catch (err) {
      alert('Error generating salary slip.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Payroll Management</h1>
          <p className="text-sm font-semibold text-slate-500">
            Audit salary expenditures, generate pay-slips, and disburse monthly payouts.
          </p>
        </div>
        <button 
          onClick={() => { setSelectedEmp(''); setShowGenModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Generate Salary Slip
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Disbursed (Year)</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {formatCurrency(slips.reduce((sum, item) => sum + (item.netSalary || 0), 0))}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slips Generated</p>
            <h3 className="text-xl font-extrabold text-slate-900">{slips.length} Payslips</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Cycle Status</p>
            <h3 className="text-xl font-extrabold text-emerald-600">100% Disbursed</h3>
          </div>
        </div>
      </div>

      {/* Payroll Audits Table */}
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
                  <th className="py-4.5 px-6">ID & Cycle</th>
                  <th className="py-4.5 px-6">Employee</th>
                  <th className="py-4.5 px-6">Base Salary</th>
                  <th className="py-4.5 px-6">Deductions</th>
                  <th className="py-4.5 px-6">Bonus & Allow.</th>
                  <th className="py-4.5 px-6">Net Payout</th>
                  <th className="py-4.5 px-6">Disbursement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {slips.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No payslip disbursements recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  slips.map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 font-mono text-[11px]">{slip.id}</p>
                        <p className="text-[10px] text-indigo-600 font-bold">{slip.month} {slip.year}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{slip.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{slip.department} • <span className="font-mono">{slip.userId}</span></p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{formatCurrency(slip.basic)}</td>
                      <td className="py-4 px-6 text-rose-600 font-medium">-{formatCurrency(slip.deductions)}</td>
                      <td className="py-4 px-6 text-emerald-600 font-medium">+{formatCurrency((slip.bonus || 0) + (slip.allowances || 0))}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">{formatCurrency(slip.netSalary)}</td>
                      <td className="py-4 px-6 text-slate-500">{slip.paymentDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Payslip Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Disburse New Payroll Cycle
              </h3>
              <button 
                onClick={() => setShowGenModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Select Employee */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Employee</label>
                <select 
                  required
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>

              {/* Month / Year */}
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Month</label>
                  <select 
                    name="month" value={formData.month} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Year</label>
                  <input 
                    type="text" required name="year" value={formData.year} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Basic Salary */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Basic Monthly Salary (INR)</label>
                <input 
                  type="number" required name="basic" value={formData.basic} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Allowances / Bonus / Deductions */}
              <div className="grid gap-4 grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Allowances</label>
                  <input 
                    type="number" name="allowances" value={formData.allowances} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bonus</label>
                  <input 
                    type="number" name="bonus" value={formData.bonus} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Deductions</label>
                  <input 
                    type="number" name="deductions" value={formData.deductions} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calculated Net Salary</p>
                  <p className="text-slate-900 text-lg font-extrabold">{formatCurrency(calculatedNet)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase tracking-wider">Precalculated</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowGenModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Disburse & Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
