import React, { useState, useEffect } from 'react';
import { CheckSquare, ChevronRight, Filter } from 'lucide-react';
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intervention Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prescriptive action management, manager assignment, escalation, and verification tracking.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-xs"
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
          <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {interventions && interventions.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    <button
                      onClick={() => onSelectProject(item.project.projectCode)}
                      className="hover:text-lime-700 font-bold transition-colors flex items-center space-x-1"
                    >
                      <span>{item.project.projectName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <div className="text-[10px] text-slate-400 font-mono">Code: {item.project.projectCode}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-800 font-bold">{item.driver}</td>
                  <td className="p-3 max-w-xs text-slate-700">{item.recommendation}</td>
                  <td className="p-3 font-medium">{item.assignedUser?.name || item.assignedRole || 'Field Officer'}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{item.deadline || '2026-03-25'}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      (item.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-800 border border-slate-200')
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                          className="px-3 py-1 bg-lime-400 hover:bg-lime-500 text-slate-950 rounded-lg text-xs font-bold shadow-xs"
                        >
                          Resolve
                        </button>
                      )}
                      {item.status !== 'ESCALATED' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'ESCALATED')}
                          className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold border border-rose-200"
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
