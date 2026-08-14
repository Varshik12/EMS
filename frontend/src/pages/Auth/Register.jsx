import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, KeyRound, Mail, User, ArrowRight, ShieldAlert, CheckCircle2, Briefcase } from 'lucide-react';
import { register } from '../../api/api';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('IT & Engineering');
  const [designation, setDesignation] = useState('MERN Stack Developer');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        name,
        email,
        password,
        role: 'Employee', // Strictly register as Employee
        department,
        designation
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/login');
        }, 1500);
      } else {
        setError(response.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Registration failed. Check network or server connection.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      
      {/* Subgrid design lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative w-full max-w-xl space-y-8 bg-slate-900/60 p-8 sm:p-10 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl transition duration-300 hover:border-slate-700/50">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/20 text-white transform hover:scale-105 transition-transform duration-300">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">SOFTWALLET EMS</h2>
          <p className="mt-2 text-xs text-slate-400 font-semibold tracking-widest uppercase">
            Create Corporate Account (Employee Registration)
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-xs font-semibold text-red-400 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>Account registered successfully! Redirecting to login page...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Full Name *
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="Aman Shrivastava"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Corporate Email Address *
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="name@company.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security Password *
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Department
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                </div>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                >
                  <option value="IT & Engineering">IT & Engineering</option>
                  <option value="HR Operations">HR Operations</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Designation
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="e.g. MERN Developer"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Register Account
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800/80 pt-5 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition duration-150"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
