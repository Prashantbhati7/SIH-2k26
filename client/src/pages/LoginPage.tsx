import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 selection:bg-lime-300">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xs">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-lime-400 flex items-center justify-center font-black text-xl shadow-xs mx-auto">
            <Activity className="w-6 h-6 text-lime-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            VikasDrishti Sign In
          </h2>
          <p className="text-xs text-slate-500">
            National Infrastructure Project Monitoring Platform
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Quick Demo Persona Selectors */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Quick Demo Persona Login
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickRole('minister@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'minister@vikasdrishti.gov.in' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Minister</div>
              <div className="text-[10px] opacity-80 truncate">minister@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('manager@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'manager@vikasdrishti.gov.in' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Project Manager</div>
              <div className="text-[10px] opacity-80 truncate">manager@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('field@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'field@vikasdrishti.gov.in' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Field Officer</div>
              <div className="text-[10px] opacity-80 truncate">field@vikasdrishti.gov.in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickRole('contractor@vikasdrishti.gov.in')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                email === 'contractor@vikasdrishti.gov.in' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Contractor</div>
              <div className="text-[10px] opacity-80 truncate">contractor@vikasdrishti.gov.in</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
              />
            </div>
            <p className="text-[10px] text-slate-500">Demo Password: <code className="text-slate-800 font-bold">password123</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Platform'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
