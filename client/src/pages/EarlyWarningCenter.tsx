import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { api } from '../services/api';

interface EarlyWarningCenterProps {
  onSelectProject: (pCode: number) => void;
}

export const EarlyWarningCenter: React.FC<EarlyWarningCenterProps> = ({ onSelectProject }) => {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchWarnings();
  }, [severityFilter]);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      const res = await api.get('/warnings', { params });
      setWarnings(res.data.warnings || []);
    } catch (err) {
      console.error('Fetch warnings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/warnings/${id}/status`, { status });
      fetchWarnings();
    } catch (err: any) {
      alert('Failed to update status: ' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Early Warning Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive warnings generated from XGBoost cost/delay/risk probability outputs & operational indicators.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {warnings && warnings.map((w: any) => (
            <div key={w.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  w.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {w.severity} SEVERITY
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{w.status}</span>
              </div>

              <div>
                <button
                  onClick={() => onSelectProject(w.project.projectCode)}
                  className="font-bold text-sm text-slate-900 hover:text-lime-700 transition-colors flex items-center space-x-1"
                >
                  <span>{w.project.projectName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Project Code: {w.project.projectCode}</div>
              </div>

              <h4 className="font-semibold text-xs text-slate-800">{w.title}</h4>
              <p className="text-xs text-slate-600">{w.message}</p>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-mono">
                Model Basis: {w.basis}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectProject(w.project.projectCode)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  View Digital Profile
                </button>

                <div className="flex items-center space-x-2">
                  {w.status === 'DETECTED' && (
                    <button
                      onClick={() => handleStatusUpdate(w.id, 'ACKNOWLEDGED')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                    >
                      Acknowledge
                    </button>
                  )}
                  {w.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate(w.id, 'RESOLVED')}
                      className="px-3 py-1 bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold rounded-lg shadow-xs"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
