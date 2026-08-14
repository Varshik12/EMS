import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRecover = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">RECOVER PASSWORD</h2>
          <p className="mt-1.5 text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Smart Employee Portal
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Recovery Instructions Dispatched</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We have dispatched security reset protocols to <strong className="text-white">{email}</strong>. Please check your corporate spam filters if not received within 5 minutes.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRecover} className="space-y-5">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Enter your official registered email address. We will automatically cross-reference our staff active directory and send you an authorization token.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Corporate Email Address
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
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="jane.doe@industrial-co.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 focus:outline-none transition disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Request Reset Token'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white hover:underline transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
