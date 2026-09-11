import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Camera,
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, assignedProjects } = data || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Field Officer Ground Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
              Viewing: Field Officer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mobile-friendly ground inspection, progress verification, and site evidence upload feed.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Assigned Projects</span>
          <div className="text-3xl font-black text-slate-900">{kpis?.assignedProjects || 5}</div>
          <span className="text-xs text-slate-500 font-medium">Inspection Scope</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Pending Verifications</span>
          <div className="text-3xl font-black text-amber-600">{kpis?.pendingVerifications || 2}</div>
          <span className="text-xs text-amber-700 font-medium">Site Inspections Due</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Submitted Today</span>
          <div className="text-3xl font-black text-emerald-600">{kpis?.todaysUpdates || 1}</div>
          <span className="text-xs text-emerald-700 font-medium">Verified Records</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Open Site Issues</span>
          <div className="text-3xl font-black text-rose-600">{kpis?.openIssues || 3}</div>
          <span className="text-xs text-rose-700 font-medium">Ground Bottlenecks</span>
        </div>
      </div>

      {/* Main Grid: Submit Inspection Form + Assigned Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Inspection Report Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Camera className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Submit Daily Site Verification Report</h2>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Select Assigned Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
              >
                {assignedProjects && assignedProjects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} (Code: {p.projectCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Verified Physical Progress (%)</label>
              <input
                type="number"
                step="0.1"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="e.g. 45.5"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Ground Issues Identified (Optional)</label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Heavy rainfall / Right of Way clearance delayed..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Inspection Notes & Verification Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Field inspection details, earthwork measurements, and quality notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white h-24"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Field Verification'}</span>
            </button>
          </form>
        </div>

        {/* Assigned Projects List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Assigned Inspection Projects</h2>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {assignedProjects?.length || 0} Scope Items
            </span>
          </div>

          <div className="space-y-3">
            {assignedProjects && assignedProjects.map((p: any) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">Code: {p.projectCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {p.riskLevel} Risk
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{p.projectName}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Location: <strong>{p.state}</strong></span>
                  <button
                    onClick={() => onSelectProject(p.projectCode)}
                    className="text-slate-800 hover:text-slate-950 font-bold flex items-center space-x-1"
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
