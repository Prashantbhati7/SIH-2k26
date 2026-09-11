import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  MapPin, 
  BarChart2, 
  ArrowRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

interface PolicymakerDashboardProps {
  onSelectProject: (pCode: number) => void;
  onOpenAssistant: () => void;
}

export const PolicymakerDashboard: React.FC<PolicymakerDashboardProps> = ({
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
      const res = await api.get('/dashboard/policymaker');
      setData(res.data);
    } catch (err) {
      console.error('Fetch policymaker dashboard error:', err);
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

  const { kpis, riskDistribution, sectorBreakdown, stateBreakdown, topInterventionPriorities } = data || {};

  const pieData = [
    { name: 'Low Risk', value: riskDistribution?.low || 0, color: '#10b981' },
    { name: 'Medium Risk', value: riskDistribution?.medium || 0, color: '#f59e0b' },
    { name: 'High Risk', value: riskDistribution?.high || 0, color: '#ef4444' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">National Infrastructure Portfolio Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Executive Command Center — Identifying high-risk concentration and prioritizing policy interventions.
          </p>
        </div>
        <button
          onClick={onOpenAssistant}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
        >
          Query Portfolio Assistant
        </button>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Monitored</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{kpis?.totalProjects}</div>
          <span className="text-[10px] text-slate-500">PAIMANA CUF Ingested</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Execution</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{kpis?.activeProjects}</div>
          <span className="text-[10px] text-emerald-400">Ongoing Operations</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{kpis?.highRiskProjects}</div>
          <span className="text-[10px] text-red-400/80">XGBoost &ge; 66% Prob</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Major Cost Risk</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpis?.majorCostRiskProjects}</div>
          <span className="text-[10px] text-amber-400/80">&gt;40% Cost Overrun</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Severe Delay</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{kpis?.severeDelayRiskProjects}</div>
          <span className="text-[10px] text-purple-400/80">&gt;40 Months Delay</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Open Actions</span>
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{kpis?.openInterventions}</div>
          <span className="text-[10px] text-slate-500">Active Interventions</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-slate-100">National Forward Risk Distribution</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 text-xs">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}: <strong className="text-slate-100">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Risk Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-100">High Risk Concentration by Sector</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorBreakdown}>
                <XAxis dataKey="sector" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="highRiskProjects" name="High Risk Projects" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProjects" name="Total Projects" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Intervention Priorities Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100">Top Policy Intervention Priorities</h2>
            <p className="text-xs text-slate-400">Projects requiring executive priority intervention</p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold">{topInterventionPriorities?.length || 0} Priority Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Project Code & Name</th>
                <th className="p-3">Sector / Location</th>
                <th className="p-3">Primary Risk Driver</th>
                <th className="p-3">Recommended Policy Action</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topInterventionPriorities && topInterventionPriorities.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-100">
                    <button
                      onClick={() => onSelectProject(item.projectCode)}
                      className="hover:text-indigo-400 transition-colors flex items-center space-x-1"
                    >
                      <span>{item.projectName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <div className="text-[10px] text-slate-500 font-mono">Code: {item.projectCode}</div>
                  </td>
                  <td className="p-3">
                    <div>{item.sector}</div>
                    <div className="text-[10px] text-slate-500">{item.state}</div>
                  </td>
                  <td className="p-3 font-mono text-amber-400 font-semibold">
                    {item.driver}
                  </td>
                  <td className="p-3 max-w-xs text-slate-200">
                    {item.recommendation}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectProject(item.projectCode)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Inspect Profile
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
