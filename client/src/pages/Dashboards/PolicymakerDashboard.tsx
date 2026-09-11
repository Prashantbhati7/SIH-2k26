import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  ChevronRight,
  Filter,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  Sparkles
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, riskDistribution, sectorBreakdown, topInterventionPriorities } = data || {};

  const pieData = [
    { name: 'Low Risk', value: riskDistribution?.low || 0, color: '#10b981' },
    { name: 'Medium Risk', value: riskDistribution?.medium || 0, color: '#f59e0b' },
    { name: 'High Risk', value: riskDistribution?.high || 0, color: '#e11d48' }
  ];

  // Top 4 Priority Projects needing attention
  const priorityProjects = topInterventionPriorities ? topInterventionPriorities.slice(0, 4) : [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Project Portfolio Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
              Viewing: Minister / Policymaker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Monitor national infrastructure project health, identify cost and delay risks, and assign timely policy interventions.
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

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Monitored */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Monitored Projects</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{kpis?.totalProjects || 120}</div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpis?.activeProjects || 94} active ongoing operations</span>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Needs Immediate Attention</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600">{kpis?.highRiskProjects || 18}</div>
            <div className="text-xs text-rose-700 font-medium mt-1">
              High Risk (&ge;66% forecast probability)
            </div>
          </div>
        </div>

        {/* Budget Risk */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Budget Escalation Risk</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600">{kpis?.majorCostRiskProjects || 14}</div>
            <div className="text-xs text-amber-700 font-medium mt-1">
              Major forecast overrun (&gt;40% over budget)
            </div>
          </div>
        </div>

        {/* Schedule Risk */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Schedule Overdue Risk</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{kpis?.severeDelayRiskProjects || 24}</div>
            <div className="text-xs text-slate-600 font-medium mt-1">
              Severe delay forecast (&gt;40 months overdue)
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Priority Actions Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Projects Needing Priority Action</h2>
            <p className="text-xs text-slate-500">High urgency infrastructure projects requiring immediate executive review and resource assignment.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {priorityProjects.length} Urgent Items
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {priorityProjects.map((p: any) => (
            <div key={p.id} className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.priority === 'CRITICAL' || p.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {p.priority} RISK
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">ID: {p.projectCode}</span>
                  <h3 className="text-sm font-bold text-slate-900">{p.projectName}</h3>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  <strong>Issue:</strong> {p.recommendation || `${p.driver} is severely impacting overall timeline.`}
                </p>

                <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                  <span>Sector: <strong>{p.sector}</strong></span>
                  <span>State: <strong>{p.state}</strong></span>
                  <span>Driver: <strong className="text-amber-700">{p.driver}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => onSelectProject(p.projectCode)}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <span>Review project</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scannable Policy Priorities Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Executive Intervention Targets</h2>
            <p className="text-xs text-slate-500">Scannable list of projects with recommended policy actions</p>
          </div>
          <button className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Sector</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Project & Code</th>
                <th className="p-3">Sector & State</th>
                <th className="p-3">Risk Driver</th>
                <th className="p-3">Recommended Policy Action</th>
                <th className="p-3">Priority Level</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topInterventionPriorities && topInterventionPriorities.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    <button
                      onClick={() => onSelectProject(item.projectCode)}
                      className="hover:text-lime-700 font-bold transition-colors text-left"
                    >
                      {item.projectName}
                    </button>
                    <div className="text-[10px] text-slate-400 font-mono">Code: {item.projectCode}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{item.sector}</div>
                    <div className="text-[10px] text-slate-500">{item.state}</div>
                  </td>
                  <td className="p-3 font-mono text-amber-700 font-semibold">
                    {item.driver}
                  </td>
                  <td className="p-3 max-w-xs text-slate-700">
                    {item.recommendation}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectProject(item.projectCode)}
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

      {/* Lower Dashboard Area for Helpful Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Portfolio Risk Distribution</h3>
          <p className="text-xs text-slate-500">Proportion of projects categorized by XGBoost risk level</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-4 text-xs pt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Risk Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-900">High Risk Concentration by Sector</h3>
          <p className="text-xs text-slate-500">Comparison of high risk projects vs total monitored projects across sectors</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorBreakdown}>
                <XAxis dataKey="sector" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="highRiskProjects" name="High Risk Projects" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProjects" name="Total Projects" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
