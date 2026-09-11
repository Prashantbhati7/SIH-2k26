import React, { useState } from 'react';
import { Activity, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  presetEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, presetEmail = '' }) => {
  const [email, setEmail] = useState<string>(presetEmail || 'minister@vikasdrishti.gov.in');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('vikasdrishti_token', token);
      localStorage.setItem('vikasdrishti_user', JSON.stringify(user));
      onLoginSuccess(user, token);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            VikasDrishti Sign In
          </h2>
          <p className="text-xs text-slate-400">
            SIH 2026 Integrated Project Monitoring & Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Quick Demo Persona Selectors */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Quick Demo Persona Login
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickRole('minister@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'minister@vikasdrishti.gov.in' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-slate-200">Minister</div>
              <div className="text-[10px] text-slate-400 truncate">minister@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('manager@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'manager@vikasdrishti.gov.in' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-slate-200">Project Manager</div>
              <div className="text-[10px] text-slate-400 truncate">manager@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('field@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'field@vikasdrishti.gov.in' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-slate-200">Field Officer</div>
              <div className="text-[10px] text-slate-400 truncate">field@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('contractor@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'contractor@vikasdrishti.gov.in' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-slate-200">Contractor</div>
              <div className="text-[10px] text-slate-400 truncate">contractor@vikasdrishti.gov.in</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">Demo Password: <code className="text-slate-300">password123</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
