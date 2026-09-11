import React, { useState, useEffect } from 'react';
import { CheckSquare, ChevronRight, Filter, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';

interface InterventionCenterProps {
  onSelectProject: (pCode: number) => void;
}

export const InterventionCenter: React.FC<InterventionCenterProps> = ({ onSelectProject }) => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter]);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/interventions', { params });
      setInterventions(res.data.interventions || []);
    } catch (err) {
      console.error('Fetch interventions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/interventions/${id}`, { status });
      fetchInterventions();
    } catch (err: any) {
      alert('Failed to update intervention: ' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-100">Intervention Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prescriptive action management, manager assignment, escalation, and verification tracking.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Project Code & Name</th>
                <th className="p-3">SHAP Driver</th>
                <th className="p-3">Prescriptive Recommendation</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interventions && interventions.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-100">
                    <button
                      onClick={() => onSelectProject(item.project.projectCode)}
                      className="hover:text-indigo-400 transition-colors flex items-center space-x-1"
                    >
                      <span>{item.project.projectName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <div className="text-[10px] text-slate-500 font-mono">Code: {item.project.projectCode}</div>
                  </td>
                  <td className="p-3 font-mono text-indigo-400 font-bold">{item.driver}</td>
                  <td className="p-3 max-w-xs text-slate-200">{item.recommendation}</td>
                  <td className="p-3">{item.assignedUser?.name || item.assignedRole || 'Field Officer'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{item.deadline || '2026-03-25'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      (item.status === 'ESCALATED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20')
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                        >
                          Resolve
                        </button>
                      )}
                      {item.status !== 'ESCALATED' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'ESCALATED')}
                          className="px-2.5 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs font-semibold"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
