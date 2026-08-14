import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must contain at least 6 alphanumeric characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">RESET PASSCODE</h2>
          <p className="mt-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Smart Employee Portal
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/40 border border-red-500/20 p-3 text-xs font-semibold text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Passcode reset successfully. Routing to login...</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              New Security Password
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
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Confirm Security Password
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full justify-center items-center gap-2 rounded-lg bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 focus:outline-none transition disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Commit Password Change'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
