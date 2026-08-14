import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, CheckCircle, IndianRupee, ArrowUpRight, Printer, AlertCircle, Award } from 'lucide-react';

export const SalarySlips = () => {
  const { salarySlips, user } = useApp();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isDownloading, setIsDownloading] = useState(null);

  useEffect(() => {
    if (salarySlips && salarySlips.length > 0) {
      setSelectedSlip(salarySlips[0]);
    } else {
      setSelectedSlip(null);
    }
  }, [salarySlips]);

  const handleDownloadSlip = (slip) => {
    setIsDownloading(slip.id);
    setTimeout(() => {
      setIsDownloading(null);
      const dummyContent = `
        ====================================================
                     SOFTWALLET SMART EMS PAYSLIP           
        ====================================================
        REF ID: ${slip.id}
        EMPLOYEE ID: ${user.id}
        EMPLOYEE NAME: ${user.name}
        DESIGNATION: ${user.designation}
        DEPARTMENT: ${user.department}
        ----------------------------------------------------
        PERIOD: ${slip.month} ${slip.year}
        PAYMENT DATE: ${slip.paymentDate}
        ----------------------------------------------------
        EARNINGS:
          Basic Salary:     ₹${slip.basic.toLocaleString()}
          Allowances:       ₹${slip.allowances.toLocaleString()}
          Performance Bonus: ₹${slip.bonus.toLocaleString()}
        
        DEDUCTIONS:
          Tax & Provident:  ₹${slip.deductions.toLocaleString()}
        ----------------------------------------------------
        NET DISBURSED:      ₹${slip.netSalary.toLocaleString()}
        STATUS:             ${slip.status.toUpperCase()}
        ====================================================
      `;
      
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${slip.month}_${slip.year}_${user.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const calculateTotalEarnings = (slip) => {
    return (slip.basic || 0) + (slip.allowances || 0) + (slip.bonus || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:text-2xl">Payroll & Salary Slips</h1>
        <p className="text-xs text-slate-400 font-medium">Access your itemized monthly compensations, calculate tax write-offs, and download authenticated payslips.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: List of Payslips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-600" />
              Generated Salary Slips
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select list item to view receipt
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {salarySlips && salarySlips.length > 0 ? (
              salarySlips.map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className={`flex flex-wrap items-center justify-between gap-4 py-4 px-3 rounded-xl transition cursor-pointer ${
                    selectedSlip?.id === slip.id ? 'bg-indigo-50/50 border border-indigo-100/50' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${selectedSlip?.id === slip.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                        {slip.month} {slip.year}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">
                        Ref: {slip.id} | Disbursed: {slip.paymentDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-800">
                        ₹{slip.netSalary.toLocaleString()}
                      </span>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 mt-0.5">
                        {slip.status}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSlip(slip);
                      }}
                      disabled={isDownloading !== null}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition disabled:opacity-50"
                      title="Download Text Payslip"
                    >
                      {isDownloading === slip.id ? (
                        <span className="h-4.5 w-4.5 block border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Download className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700 mt-3">No Salary Slips Generated</p>
                <p className="text-[10px] text-slate-400 mt-1">Payroll details will appear here once processed by Finance.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Breakdowns Card */}
        {selectedSlip ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ArrowUpRight className="h-4.5 w-4.5 text-indigo-600" />
                Payslip Breakdown
              </h3>
              <button 
                onClick={() => window.print()}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
                title="Print Receipt"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-900 p-4 text-white text-center relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Disbursed Earnings ({selectedSlip.month})
              </span>
              <span className="text-2xl font-bold tracking-tight block mt-1.5 font-mono">
                ₹{selectedSlip.netSalary.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400 tracking-wider mt-2.5 border border-emerald-500/20">
                <CheckCircle className="h-3 w-3" />
                Disbursement Success
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Earnings (+) </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-600">Basic Wage Salary</span>
                    <span className="font-bold text-slate-800">₹{selectedSlip.basic.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-600">House Rent / Utilities Allowance</span>
                    <span className="font-bold text-slate-800">₹{selectedSlip.allowances.toLocaleString()}</span>
                  </div>
                  {selectedSlip.bonus > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100/55 text-emerald-800">
                      <span className="font-semibold flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        Performance / Special Bonus
                      </span>
                      <span className="font-bold">₹{selectedSlip.bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-2 text-xs font-bold text-slate-800 border-t border-slate-100 pt-3">
                    <span>Total Raw Earnings</span>
                    <span>₹{calculateTotalEarnings(selectedSlip).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Deductions (-)</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-800">
                    <span className="font-semibold">Professional Tax & Provident Fund</span>
                    <span className="font-bold">₹{selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900">Total Net Disbursed Salary:</span>
                  <span className="text-lg font-bold text-indigo-600 font-mono">
                    ₹{selectedSlip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownloadSlip(selectedSlip)}
              disabled={isDownloading !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Download className="h-4.5 w-4.5" />
              {isDownloading === selectedSlip.id ? 'Compiling PDF Slip...' : 'Download Payslip Receipt'}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-center text-slate-400 flex flex-col justify-center items-center h-64">
            <AlertCircle className="h-8 w-8 text-slate-300 animate-pulse" />
            <p className="mt-2 text-xs font-semibold">Breakdown unavailable</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Please select an active slip from the left panel to display details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
