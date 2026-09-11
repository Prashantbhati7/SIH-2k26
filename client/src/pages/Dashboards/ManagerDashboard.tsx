import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldAlert,
  Search,
  Filter
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
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, activeWarnings, projects } = data || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Project Manager & Ministry Monitoring</h1>
          <p className="text-xs text-slate-400 mt-1">
            Operational Intelligence — Assigning actions, acknowledging warnings, and closing the field loop.
          </p>
        </div>
        <button
          onClick={onOpenAssistant}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20"
        >
          Ask Assistant for My Portfolio
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Projects Managed</span>
          <div className="text-2xl font-black text-slate-100">{kpis?.projectsUnderManagement}</div>
          <span className="text-[10px] text-slate-500">Ministry Portfolio</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">High Risk</span>
          <div className="text-2xl font-black text-red-400">{kpis?.highRiskCount}</div>
          <span className="text-[10px] text-red-400/80">Require Action</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Cost Warnings</span>
          <div className="text-2xl font-black text-amber-400">{kpis?.costWarningsCount}</div>
          <span className="text-[10px] text-amber-400/80">Budget Escalation</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Delay Warnings</span>
          <div className="text-2xl font-black text-purple-400">{kpis?.delayWarningsCount}</div>
          <span className="text-[10px] text-purple-400/80">Schedule Overdue</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Actions</span>
          <div className="text-2xl font-black text-cyan-400">{kpis?.pendingInterventions}</div>
          <span className="text-[10px] text-slate-500">Active Interventions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Delayed Milestones</span>
          <div className="text-2xl font-black text-rose-400">{kpis?.delayedMilestones}</div>
          <span className="text-[10px] text-slate-500">Milestone Track</span>
        </div>
      </div>

      {/* Active Warnings Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Active Early Warnings & Action Triggers</h2>
          </div>
          <span className="text-xs text-slate-400">{activeWarnings?.length || 0} Unresolved Warnings</span>
        </div>

        <div className="space-y-3">
          {activeWarnings && activeWarnings.map((w: any) => (
            <div key={w.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    w.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {w.severity}
                  </span>
                  <span className="text-xs font-mono text-indigo-400">Code: {w.projectCode}</span>
                  <span className="text-xs font-bold text-slate-200">{w.projectName}</span>
                </div>
                <p className="text-xs text-slate-300">{w.title}</p>
                <p className="text-[11px] text-slate-400">{w.message}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => onSelectProject(w.projectCode)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                >
                  Inspect & Assign Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Requiring Attention Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100">Projects Managed Portfolio</h2>
          <span className="text-xs text-slate-400">Showing latest XGBoost forecast snapshots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Code & Name</th>
                <th className="p-3">Sector</th>
                <th className="p-3">State</th>
                <th className="p-3">Forward Risk Level</th>
                <th className="p-3">Cost Forecast</th>
                <th className="p-3">Delay Forecast</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects && projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-100">
                    <button onClick={() => onSelectProject(p.projectCode)} className="hover:text-indigo-400 transition-colors">
                      {p.projectName}
                    </button>
                    <div className="text-[10px] text-slate-500 font-mono">Code: {p.projectCode}</div>
                  </td>
                  <td className="p-3">{p.sector}</td>
                  <td className="p-3">{p.state}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      (p.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                    }`}>
                      {p.riskLevel} ({p.riskProbability}%)
                    </span>
                  </td>
                  <td className="p-3 font-medium text-amber-300">{p.costPrediction}</td>
                  <td className="p-3 font-medium text-purple-300">{p.delayPrediction}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectProject(p.projectCode)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
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
