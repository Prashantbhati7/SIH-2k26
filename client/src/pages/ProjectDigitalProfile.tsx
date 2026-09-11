import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  UserCheck, 
  HardHat, 
  Send, 
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers,
  BarChart2,
  Calendar,
  ExternalLink,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

interface ProjectDigitalProfileProps {
  projectCode: number;
  userRole: string;
  onOpenAssistant: () => void;
}

export const ProjectDigitalProfile: React.FC<ProjectDigitalProfileProps> = ({
  projectCode,
  userRole,
  onOpenAssistant
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Intervention Assignment Modal State
  const [showInterventionModal, setShowInterventionModal] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [assignedRole, setAssignedRole] = useState<string>('FIELD_OFFICER');
  const [assignedRemarks, setAssignedRemarks] = useState<string>('');
  const [submittingIntervention, setSubmittingIntervention] = useState<boolean>(false);

  // Field Update Form State
  const [showFieldModal, setShowFieldModal] = useState<boolean>(false);
  const [fieldProgress, setFieldProgress] = useState<string>('');
  const [fieldIssue, setFieldIssue] = useState<string>('');
  const [fieldRemarks, setFieldRemarks] = useState<string>('');

  useEffect(() => {
    fetchProjectProfile();
  }, [projectCode]);

  const fetchProjectProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/projects/${projectCode}`);
      setData(res.data);
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      setError(err?.response?.data?.error || 'Failed to load project digital profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntervention = async () => {
    if (!selectedDriver) return;
    try {
      setSubmittingIntervention(true);
      await api.post('/interventions', {
        projectId: data.project.id,
        driver: selectedDriver.feature,
        recommendation: selectedDriver.prescription,
        priority: 'HIGH',
        assignedRole,
        remarks: assignedRemarks || 'Assigned via VikasDrishti Core Slice'
      });
      setShowInterventionModal(false);
      setAssignedRemarks('');
      fetchProjectProfile();
    } catch (err: any) {
      alert('Failed to assign intervention: ' + (err?.response?.data?.error || err.message));
    } finally {
      setSubmittingIntervention(false);
    }
  };

  const handleSubmitFieldUpdate = async () => {
    try {
      await api.post('/field/updates', {
        projectId: data.project.id,
        updateDate: new Date().toISOString().split('T')[0],
        physicalProgress: parseFloat(fieldProgress || data.latestSnapshot.physicalProgress),
        issueDescription: fieldIssue || null,
        remarks: fieldRemarks || null
      });
      setShowFieldModal(false);
      fetchProjectProfile();
    } catch (err: any) {
      alert('Failed to submit field update: ' + (err?.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400 font-semibold animate-pulse">
          Loading VikasDrishti Project Digital Profile...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Project Not Found</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={fetchProjectProfile}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { project, latestSnapshot, prediction, warnings, interventions, fieldUpdates, contractorTasks, activityTimeline } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Project Metadata Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
              CODE: {project.projectCode}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
              {project.sector}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
              {project.state}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              Status: {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            {project.projectName}
          </h1>
          <p className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Ministry: <strong className="text-slate-200">{project.ministry}</strong></span>
            <span>•</span>
            <span>Agency: <strong className="text-slate-200">{project.agency}</strong></span>
            <span>•</span>
            <span>Latest Report Date: <strong className="text-slate-200">{latestSnapshot?.reportDate || 'N/A'}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Ask Assistant Why at Risk</span>
          </button>
          <button
            onClick={() => setShowFieldModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <UserCheck className="w-4 h-4" />
            <span>Submit Ground Update</span>
          </button>
        </div>
      </div>

      {/* 2. Latest Snapshot Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Original Cost</span>
          <div className="text-base font-bold text-slate-100">₹{latestSnapshot?.originalCost} Cr</div>
          <span className="text-[10px] text-slate-400">Approved Budget</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Revised Cost</span>
          <div className="text-base font-bold text-amber-300">₹{latestSnapshot?.revisedCost} Cr</div>
          <span className="text-[10px] text-amber-400/80">+₹{((latestSnapshot?.revisedCost || 0) - (latestSnapshot?.originalCost || 0)).toFixed(1)} Cr revision</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Expenditure</span>
          <div className="text-base font-bold text-slate-100">₹{latestSnapshot?.cumulativeExpenditure} Cr</div>
          <span className="text-[10px] text-indigo-400">{latestSnapshot?.expenditurePercentOriginal}% of Original</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Physical Progress</span>
          <div className="text-base font-bold text-emerald-400">{latestSnapshot?.physicalProgress}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(latestSnapshot?.physicalProgress || 0, 100)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Delay</span>
          <div className="text-base font-bold text-red-400">{latestSnapshot?.delayMonths || 0} Months</div>
          <span className="text-[10px] text-slate-400">Reported Overdue</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Planned Duration</span>
          <div className="text-base font-bold text-slate-100">{latestSnapshot?.plannedDuration} Mo</div>
          <span className="text-[10px] text-slate-400">Rem: {latestSnapshot?.remainingPlannedDuration} Mo</span>
        </div>
      </div>

      {/* 3. XGBoost Forecast Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Forecast Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100">XGBoost Cost Forecast</h3>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
              Next Snapshot
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Predicted Class</span>
            <span className="text-sm font-black text-amber-400">
              {prediction?.costPrediction || 'No overrun'}
            </span>
          </div>

          {/* Class Probability Distribution */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Probability Distribution
            </div>
            {prediction?.costProbabilities && Object.entries(prediction.costProbabilities).map(([cls, prob]: any) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cls}</span>
                  <span className="font-mono text-slate-400">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${cls.includes('Major') ? 'bg-red-500' : (cls.includes('Moderate') ? 'bg-amber-500' : 'bg-emerald-500')}`} 
                    style={{ width: `${prob * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay Forecast Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-slate-100">XGBoost Delay Forecast</h3>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
              Next Snapshot
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Predicted Class</span>
            <span className="text-sm font-black text-purple-300">
              {prediction?.delayPrediction || 'Low (<=3 mo)'}
            </span>
          </div>

          {/* Class Probability Distribution */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Probability Distribution
            </div>
            {prediction?.delayProbabilities && Object.entries(prediction.delayProbabilities).map(([cls, prob]: any) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cls}</span>
                  <span className="font-mono text-slate-400">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${cls.includes('Severe') ? 'bg-red-500' : (cls.includes('High') ? 'bg-amber-500' : 'bg-purple-500')}`} 
                    style={{ width: `${prob * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Risk Probability Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-sm text-slate-100">XGBoost Future Risk</h3>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 font-bold border border-red-500/20">
              Binary Model
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <div className="text-3xl font-black bg-gradient-to-r from-red-400 via-amber-300 to-red-500 bg-clip-text text-transparent">
              {prediction?.scorePercentage || 0}%
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                prediction?.riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                (prediction?.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
              }`}>
                {prediction?.riskLevel || 'Low'} Risk Level
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Model Risk Probability Output (Thresholds: &lt;33% Low, 33-66% Med, &ge;66% High)
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <strong>ML Honesty Note</strong>: Forecast corresponds to the next available PAIMANA reporting cycle snapshot.
          </div>
        </div>
      </div>

      {/* 4. Explainability Panel — Top 5 SHAP Drivers & Prescriptions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Why is this project at risk? (SHAP Explanation)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top 5 feature drivers sorted by absolute SHAP impact magnitude from TreeExplainer.
            </p>
          </div>
          <span className="text-xs text-indigo-300 font-mono font-semibold px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            13-Feature Vector
          </span>
        </div>

        {/* SHAP Drivers List */}
        <div className="space-y-4">
          {prediction?.drivers && prediction.drivers.map((driver: any) => {
            const isIncreasing = driver.direction === 'increasing risk';
            return (
              <div key={driver.rank} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                      #{driver.rank}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-200 font-mono">{driver.feature}</span>
                      <span className="text-xs text-slate-400 ml-3">Value: <strong className="text-slate-200">{driver.featureValue}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                      isIncreasing ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isIncreasing ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                      <span>{driver.direction}</span>
                    </span>

                    <span className="text-xs font-mono text-slate-400">
                      SHAP: {driver.shapValue > 0 ? `+${driver.shapValue}` : driver.shapValue}
                    </span>

                    {(userRole === 'MINISTER_POLICYMAKER' || userRole === 'PROJECT_MANAGER') && (
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowInterventionModal(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Action</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation & Prescriptive Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-900">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-400 block mb-1">Human Explanation:</span>
                    <p className="text-slate-300">{driver.explanation}</p>
                  </div>
                  <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20">
                    <span className="font-semibold text-indigo-300 block mb-1">Prescriptive Recommendation:</span>
                    <p className="text-slate-200">{driver.prescription}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Early Warnings & Active Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warnings Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-slate-100">Early Warning Center</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {warnings?.length || 0} Active
            </span>
          </div>

          <div className="space-y-3">
            {warnings && warnings.length > 0 ? (
              warnings.map((w: any) => (
                <div key={w.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {w.severity}
                    </span>
                    <span className="text-[10px] text-slate-400">{w.status}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">{w.title}</h4>
                  <p className="text-xs text-slate-400">{w.message}</p>
                  <div className="text-[10px] text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20 font-mono">
                    Basis: {w.basis}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No active early warnings detected for this project.
              </div>
            )}
          </div>
        </div>

        {/* Assigned Interventions Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-slate-100">Interventions & Actions</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {interventions?.length || 0} Total
            </span>
          </div>

          <div className="space-y-3">
            {interventions && interventions.length > 0 ? (
              interventions.map((i: any) => (
                <div key={i.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">{i.driver}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {i.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{i.recommendation}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>Assigned to: <strong className="text-slate-300">{i.assignedUser?.name || i.assignedRole || 'Field Officer'}</strong></span>
                    <span>Due: {i.deadline || '2026-03-25'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No interventions currently created.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Activity Timeline — Closed Loop Event Feed */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Project Activity Timeline & Enriched Data Feed</h2>
          </div>
          <span className="text-xs text-slate-400">Chronological Audit Feed</span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
          {activityTimeline && activityTimeline.map((item: any) => (
            <div key={item.id} className="relative flex items-start space-x-4 pl-8">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 w-full space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Assign Prescriptive Intervention</h3>
            
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Feature Driver: <strong className="text-indigo-300">{selectedDriver?.feature}</strong></div>
              <div className="text-slate-200 font-semibold">{selectedDriver?.prescription}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Assign Responsible Role</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="FIELD_OFFICER">Field Officer (Ground Verification)</option>
                <option value="CONTRACTOR">Contractor (Execution Task)</option>
                <option value="PROJECT_MANAGER">Project Manager (Schedule Revision)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Remarks / Execution Context</label>
              <textarea
                value={assignedRemarks}
                onChange={(e) => setAssignedRemarks(e.target.value)}
                placeholder="Add specific instructions for field inspection..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-24"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowInterventionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIntervention}
                disabled={submittingIntervention}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                {submittingIntervention ? 'Assigning...' : 'Assign Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Officer Update Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Submit Ground Officer Inspection</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Physical Progress (%)</label>
              <input
                type="number"
                value={fieldProgress}
                onChange={(e) => setFieldProgress(e.target.value)}
                placeholder={latestSnapshot?.physicalProgress.toString()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Ground Issues Identified (Optional)</label>
              <input
                type="text"
                value={fieldIssue}
                onChange={(e) => setFieldIssue(e.target.value)}
                placeholder="e.g., Land acquisition delay / Heavy rainfall..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Verification Remarks</label>
              <textarea
                value={fieldRemarks}
                onChange={(e) => setFieldRemarks(e.target.value)}
                placeholder="Physical site inspection report details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowFieldModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFieldUpdate}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Submit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
