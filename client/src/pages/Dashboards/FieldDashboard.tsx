import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Send, 
  Camera,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

interface FieldDashboardProps {
  onSelectProject: (pCode: number) => void;
}

export const FieldDashboard: React.FC<FieldDashboardProps> = ({ onSelectProject }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [progress, setProgress] = useState<string>('45.0');
  const [issue, setIssue] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/field');
      setData(res.data);
      if (res.data.assignedProjects && res.data.assignedProjects.length > 0) {
        setSelectedProjectId(res.data.assignedProjects[0].id);
      }
    } catch (err) {
      console.error('Fetch field dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      setSubmitting(true);
      await api.post('/field/updates', {
        projectId: selectedProjectId,
        updateDate: new Date().toISOString().split('T')[0],
        physicalProgress: parseFloat(progress),
        issueDescription: issue || null,
        remarks: remarks || null
      });
      setSuccessMessage('Ground Inspection Report submitted successfully! Enriched execution data recorded.');
      setIssue('');
      setRemarks('');
      fetchDashboard();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert('Failed to submit update: ' + (err?.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, assignedProjects } = data || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-100">Field Officer Ground Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mobile-friendly ground inspection, progress verification, and site evidence upload feed.
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Field Officer Role Active
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Projects</span>
          <div className="text-2xl font-black text-slate-100">{kpis?.assignedProjects}</div>
          <span className="text-[10px] text-slate-500">Inspection Scope</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Verifications</span>
          <div className="text-2xl font-black text-amber-400">{kpis?.pendingVerifications}</div>
          <span className="text-[10px] text-amber-400/80">Site Inspections Due</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Submitted Today</span>
          <div className="text-2xl font-black text-emerald-400">{kpis?.todaysUpdates}</div>
          <span className="text-[10px] text-emerald-400/80">Verified Records</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Open Site Issues</span>
          <div className="text-2xl font-black text-red-400">{kpis?.openIssues}</div>
          <span className="text-[10px] text-red-400/80">Ground Bottlenecks</span>
        </div>
      </div>

      {/* Main Grid: Submit Inspection Form + Assigned Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Inspection Report Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Submit Daily Site Verification Report</h2>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Select Assigned Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {assignedProjects && assignedProjects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} (Code: {p.projectCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Verified Physical Progress (%)</label>
              <input
                type="number"
                step="0.1"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="e.g. 45.5"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Ground Issues Identified (Optional)</label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Heavy rainfall / Right of Way clearance delayed..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Inspection Notes & Verification Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Field inspection details, earthwork measurements, and quality notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-24"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Field Verification'}</span>
            </button>
          </form>
        </div>

        {/* Assigned Projects List */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100">Assigned Inspection Projects</h2>
            <span className="text-xs text-slate-400">{assignedProjects?.length || 0} Scope Items</span>
          </div>

          <div className="space-y-3">
            {assignedProjects && assignedProjects.map((p: any) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">Code: {p.projectCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {p.riskLevel} Risk
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-200">{p.projectName}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Location: <strong className="text-slate-300">{p.state}</strong></span>
                  <button
                    onClick={() => onSelectProject(p.projectCode)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
