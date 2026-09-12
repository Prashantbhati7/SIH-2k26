import React from 'react';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  UserCheck, 
  HardHat, 
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
  onQuickLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform, onQuickLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-lime-300 selection:text-slate-900">
      {/* Header Bar */}
      <header className="h-20 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between max-w-7xl mx-auto w-full shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 p-2 flex items-center justify-center shadow-sm">
            <img src="/logo-white.png" alt="VikasDrishti Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              VikasDrishti
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200 uppercase ml-2">
              SIH 2026 Prototype
            </span>
          </div>
        </div>

        <button
          onClick={onEnterPlatform}
          className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center space-x-2"
        >
          <span>Enter Intelligence Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-12 my-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <span>Smart Automation • Problem Statement SIH26103 • Team Nirvana</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
            From Monitoring Projects to <br />
            <span className="text-slate-700 underline decoration-lime-400 decoration-4 underline-offset-4">
              Predicting What Happens Next.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            VikasDrishti is an AI-powered infrastructure project intelligence layer that turns raw monitoring data into forward-looking risk, explainability, early warnings, and actionable interventions.
          </p>
        </div>

        {/* 4 Stage Intelligence Closed Loop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left pt-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900">PREDICT</h3>
            <p className="text-xs text-slate-500">XGBoost models forecast future cost overrun, delay, and project risk.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900">EXPLAIN</h3>
            <p className="text-xs text-slate-500">SHAP TreeExplainer uncovers the top feature drivers behind predictions.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900">WARN & PRESCRIBE</h3>
            <p className="text-xs text-slate-500">Automated early warning center maps drivers to actionable recommendations.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900">ACT & CLOSE LOOP</h3>
            <p className="text-xs text-slate-500">Interventions, field verification & contractor updates create enriched data.</p>
          </div>
        </div>

        {/* 4 Role Ecosystem Cards with One-Click Login */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Select a Role Persona for Interactive Demonstration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <button
              onClick={() => onQuickLogin('minister@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] text-left group"
            >
              <Building2 className="w-6 h-6 text-slate-800 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-900">Minister / Policymaker</h4>
              <p className="text-xs text-slate-500 mt-1">Portfolio Intelligence → Prioritize Intervention</p>
              <span className="inline-flex items-center text-xs font-bold text-slate-900 mt-4">
                <span>Enter Minister View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('manager@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] text-left group"
            >
              <Compass className="w-6 h-6 text-slate-800 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-900">Project Manager / Ministry</h4>
              <p className="text-xs text-slate-500 mt-1">Project Intelligence → Assign & Escalate Actions</p>
              <span className="inline-flex items-center text-xs font-bold text-slate-900 mt-4">
                <span>Enter Manager View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('field@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] text-left group"
            >
              <UserCheck className="w-6 h-6 text-slate-800 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-900">Field Inspection Officer</h4>
              <p className="text-xs text-slate-500 mt-1">Ground Intelligence → Verify & Track Evidence</p>
              <span className="inline-flex items-center text-xs font-bold text-slate-900 mt-4">
                <span>Enter Field View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onQuickLogin('contractor@vikasdrishti.gov.in')}
              className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] text-left group"
            >
              <HardHat className="w-6 h-6 text-slate-800 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-900">Contractor / Implementer</h4>
              <p className="text-xs text-slate-500 mt-1">Execution Intelligence → Resolve & Update Work</p>
              <span className="inline-flex items-center text-xs font-bold text-slate-900 mt-4">
                <span>Enter Contractor View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <p>VikasDrishti Prototype — SIH 2026 Team Nirvana | Dataset: 18,363 rows, 1,709 projects</p>
      </footer>
    </div>
  );
};
