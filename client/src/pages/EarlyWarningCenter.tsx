import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-slate-100">Early Warning Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive warnings generated from XGBoost cost/delay/risk probability outputs & operational indicators.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
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
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warnings && warnings.map((w: any) => (
            <div key={w.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                  w.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {w.severity} SEVERITY
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Status: {w.status}</span>
              </div>

              <div>
                <button
                  onClick={() => onSelectProject(w.project.projectCode)}
                  className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition-colors flex items-center space-x-1"
                >
                  <span>{w.project.projectName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Project Code: {w.project.projectCode}</div>
              </div>

              <h4 className="font-semibold text-xs text-amber-300">{w.title}</h4>
              <p className="text-xs text-slate-400">{w.message}</p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 font-mono">
                Model Basis: {w.basis}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectProject(w.project.projectCode)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View Digital Profile
                </button>

                <div className="flex items-center space-x-2">
                  {w.status === 'DETECTED' && (
                    <button
                      onClick={() => handleStatusUpdate(w.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                    >
                      Acknowledge
                    </button>
                  )}
                  {w.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate(w.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
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
