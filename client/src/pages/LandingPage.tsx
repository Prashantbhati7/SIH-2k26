import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  UserCheck, 
  HardHat, 
  Compass,
  FileCheck2
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
  onQuickLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform, onQuickLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-400 bg-clip-text text-transparent">
              VikasDrishti
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase ml-2">
              SIH 2026 Prototype
            </span>
          </div>
        </div>

        <button
          onClick={onEnterPlatform}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center space-x-2"
        >
          <span>Enter Intelligence Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-12 my-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Smart Automation • Problem Statement SIH26103 • Team Nirvana</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-100">
            From Monitoring Projects to <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Predicting What Happens Next.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            VikasDrishti is an AI-powered infrastructure project intelligence layer that turns raw monitoring data into forward-looking risk, explainability, early warnings, and actionable interventions.
          </p>
        </div>

        {/* 4 Stage Intelligence Closed Loop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left pt-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/20">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-100">PREDICT</h3>
            <p className="text-xs text-slate-400">XGBoost models forecast future cost overrun, delay, and project risk.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-100">EXPLAIN</h3>
            <p className="text-xs text-slate-400">SHAP TreeExplainer uncovers the top feature drivers behind predictions.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-100">WARN & PRESCRIBE</h3>
            <p className="text-xs text-slate-400">Automated early warning center maps drivers to actionable recommendations.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-100">ACT & CLOSE LOOP</h3>
            <p className="text-xs text-slate-400">Interventions, field verification & contractor updates create enriched data.</p>
          </div>
        </div>

        {/* 4 Role Ecosystem Cards with One-Click Login */}
        <div className="space-y-4 pt-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Select a Role Persona for Interactive Demonstration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <button
              onClick={() => onQuickLogin('minister@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] text-left group"
            >
              <Building2 className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-100">Minister / Policymaker</h4>
              <p className="text-xs text-slate-400 mt-1">Portfolio Intelligence → Prioritize Intervention</p>
              <span className="inline-flex items-center text-xs font-bold text-indigo-400 mt-4">
                <span>Enter Minister View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('manager@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] text-left group"
            >
              <Compass className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-100">Project Manager / Ministry</h4>
              <p className="text-xs text-slate-400 mt-1">Project Intelligence → Assign & Escalate Actions</p>
              <span className="inline-flex items-center text-xs font-bold text-purple-400 mt-4">
                <span>Enter Manager View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('field@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] text-left group"
            >
              <UserCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-100">Field Inspection Officer</h4>
              <p className="text-xs text-slate-400 mt-1">Ground Intelligence → Verify & Track Evidence</p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-400 mt-4">
                <span>Enter Field View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('contractor@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all hover:scale-[1.02] text-left group"
            >
              <HardHat className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-100">Contractor / Implementer</h4>
              <p className="text-xs text-slate-400 mt-1">Execution Intelligence → Resolve & Update Work</p>
              <span className="inline-flex items-center text-xs font-bold text-amber-400 mt-4">
                <span>Enter Contractor View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>VikasDrishti Prototype — SIH 2026 Team Nirvana | Dataset: 18,363 rows, 1,709 projects</p>
      </footer>
    </div>
  );
};
