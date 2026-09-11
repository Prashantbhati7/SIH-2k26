import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  ChevronRight, 
  ShieldAlert,
  Search,
  Filter,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

interface ManagerDashboardProps {
  onSelectProject: (pCode: number) => void;
  onOpenAssistant: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onSelectProject,
  onOpenAssistant
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/manager');
      setData(res.data);
    } catch (err) {
      console.error('Fetch manager dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, activeWarnings, projects } = data || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Project Manager Portfolio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
              Viewing: Project Manager / Ministry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operational Intelligence — Assign action items, resolve early warnings, and update execution milestones.
          </p>
        </div>

        <button
          onClick={onOpenAssistant}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-600" />
          <span>Ask for insights</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Projects Managed</span>
          <div className="text-3xl font-black text-slate-900">{kpis?.projectsUnderManagement || 120}</div>
          <span className="text-xs text-slate-500 font-medium">Ministry Monitoring Scope</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">High Risk Projects</span>
          <div className="text-3xl font-black text-rose-600">{kpis?.highRiskCount || 18}</div>
          <span className="text-xs text-rose-700 font-medium">Require immediate action</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Cost Warnings</span>
          <div className="text-3xl font-black text-amber-600">{kpis?.costWarningsCount || 14}</div>
          <span className="text-xs text-amber-700 font-medium">Budget overrun risk</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Delay Warnings</span>
          <div className="text-3xl font-black text-slate-900">{kpis?.delayWarningsCount || 24}</div>
          <span className="text-xs text-slate-600 font-medium font-mono">&gt;40 months forecast delay</span>
        </div>
      </div>

      {/* Active Early Warnings List */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Active Early Warnings & Action Triggers</h2>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {activeWarnings?.length || 0} Unresolved Warnings
          </span>
        </div>

        <div className="space-y-3">
          {activeWarnings && activeWarnings.map((w: any) => (
            <div key={w.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-all">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    w.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {w.severity}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">ID: {w.projectCode}</span>
                  <span className="text-sm font-bold text-slate-900">{w.projectName}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{w.title}</p>
                <p className="text-xs text-slate-600">{w.message}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => onSelectProject(w.projectCode)}
                  className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs transition-all"
                >
                  Review & assign action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Managed Portfolio Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Projects Managed Portfolio</h2>
          <span className="text-xs text-slate-500">Showing latest XGBoost forecast snapshots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Project & Code</th>
                <th className="p-3">Sector</th>
                <th className="p-3">State</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Cost Forecast</th>
                <th className="p-3">Delay Forecast</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects && projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    <button onClick={() => onSelectProject(p.projectCode)} className="hover:text-lime-700 font-bold transition-colors text-left">
                      {p.projectName}
                    </button>
                    <div className="text-[10px] text-slate-400 font-mono">Code: {p.projectCode}</div>
                  </td>
                  <td className="p-3 font-medium">{p.sector}</td>
                  <td className="p-3 font-medium">{p.state}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      (p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                    }`}>
                      {p.riskLevel} ({p.riskProbability}%)
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-amber-700">{p.costPrediction}</td>
                  <td className="p-3 font-semibold text-slate-800">{p.delayPrediction}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectProject(p.projectCode)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      Digital Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
