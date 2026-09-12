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
  UserCheck, 
  ShieldAlert,
  Activity,
  Plus,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { WhatIfSimulator } from '../components/WhatIfSimulator';

interface ProjectDigitalProfileProps {
  projectCode: number;
  userRole: string;
  onOpenAssistant: () => void;
  initialTab?: 'OVERVIEW' | 'ENRICHMENT' | 'WHAT_IF';
}

export const ProjectDigitalProfile: React.FC<ProjectDigitalProfileProps> = ({
  projectCode,
  userRole,
  onOpenAssistant,
  initialTab = 'OVERVIEW'
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ENRICHMENT' | 'WHAT_IF'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [coverageData, setCoverageData] = useState<any>(null);
  const [selectedRecDrawer, setSelectedRecDrawer] = useState<any>(null);
  const [loadingEnrichment, setLoadingEnrichment] = useState<boolean>(false);

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
    fetchEnrichmentData();
  }, [projectCode]);

  const fetchEnrichmentData = async () => {
    try {
      setLoadingEnrichment(true);
      const [recRes, covRes] = await Promise.all([
        api.get(`/projects/${projectCode}/enrichment/recommendations`),
        api.get(`/projects/${projectCode}/enrichment/coverage`)
      ]);
      setRecommendations(recRes.data.recommendations || []);
      setCoverageData(covRes.data);
    } catch (err) {
      console.error('Fetch enrichment error:', err);
    } finally {
      setLoadingEnrichment(false);
    }
  };

  const handleUpdateRecommendation = async (recId: string, status: string, selected: boolean) => {
    try {
      await api.patch(`/enrichment/recommendations/${recId}`, { status, selected });
      fetchEnrichmentData();
    } catch (err: any) {
      alert('Failed to update recommendation: ' + (err?.response?.data?.error || err.message));
    }
  };

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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          Loading Project Digital Profile...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Project Profile Unavailable</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchProjectProfile}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const { project, latestSnapshot, prediction, warnings, interventions, activityTimeline } = data;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Project Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
              CODE: {project.projectCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              {project.sector}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              {project.state}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              Status: {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {project.projectName}
          </h1>
          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>Ministry: <strong className="text-slate-800">{project.ministry}</strong></span>
            <span>•</span>
            <span>Agency: <strong className="text-slate-800">{project.agency}</strong></span>
            <span>•</span>
            <span>Latest Report Date: <strong className="text-slate-800">{latestSnapshot?.reportDate || 'N/A'}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            <span>Ask for insights</span>
          </button>
          <button
            onClick={() => setShowFieldModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs shadow-xs transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Submit Ground Update</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors relative flex items-center space-x-2 ${
            activeTab === 'OVERVIEW' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview & Baseline Risk</span>
        </button>
        <button
          onClick={() => setActiveTab('ENRICHMENT')}
          className={`pb-3 transition-colors relative flex items-center space-x-2 ${
            activeTab === 'ENRICHMENT' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-lime-600" />
          <span>Enrichment Intelligence</span>
          {recommendations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-lime-100 text-slate-900 font-black border border-lime-300">
              {recommendations.length} Candidate Signals
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('WHAT_IF')}
          className={`pb-3 transition-colors relative flex items-center space-x-2 ${
            activeTab === 'WHAT_IF' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>What-If Simulator</span>
        </button>
      </div>

      {activeTab === 'ENRICHMENT' ? (
        <div className="space-y-8">
          {/* Top Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white space-y-3 shadow-md">
            <div className="flex items-center space-x-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Project-Specific Data Enrichment</span>
            </div>
            <h2 className="text-xl font-black text-white">Identify the Next Execution Signals Worth Collecting</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Based on this project's predictions and SHAP drivers, VikasDrishti has identified specific operational signals not currently captured in monthly CUF snapshots. Collecting these variables will accumulate a pilot dataset for future model evaluation.
            </p>
          </div>

          {/* Section A: Why Are We Here? */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-xs font-semibold text-slate-500">Current Forecast Risk</span>
              <div className="text-lg font-black text-rose-600">{prediction?.riskLevel || 'High'} ({prediction?.scorePercentage || 0}%)</div>
              <p className="text-[11px] text-slate-500">Evaluated on baseline 13 CUF features</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-xs font-semibold text-slate-500">Primary Risk Target</span>
              <div className="text-lg font-black text-slate-900">{prediction?.delayPrediction || 'Severe Delay (>40 mo)'}</div>
              <p className="text-[11px] text-slate-500">Schedule & progress execution focus</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-xs font-semibold text-slate-500">Candidate Feature Status</span>
              <div className="text-lg font-black text-amber-700">{recommendations.length} Recommended</div>
              <p className="text-[11px] text-amber-700 font-semibold">Candidates for future evaluation</p>
            </div>
          </div>

          {/* Section B: Anchored SHAP Drivers */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">1. Current Model Explainability (SHAP Drivers Anchor)</h3>
            <p className="text-xs text-slate-500">Recommendation engine uses these active drivers to select candidate enriched variables:</p>
            <div className="flex flex-wrap gap-2">
              {prediction?.drivers && prediction.drivers.map((d: any) => (
                <span key={d.rank} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center space-x-2">
                  <span>#{d.rank} {d.feature}</span>
                  <span className="text-slate-500">({d.absShapValue.toFixed(2)})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Section C: Recommended Features */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Recommended Enriched Variables to Collect</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select variables to activate field & contractor data collection plans.</p>
              </div>
              <button
                onClick={() => fetchEnrichmentData()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Refresh Engine
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec: any) => {
                const catalog = rec.featureCatalog || {};
                const isAccepted = rec.status === 'ACCEPTED' || rec.selected;
                return (
                  <div key={rec.id} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4 hover:bg-slate-50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-slate-900">{catalog.featureName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {rec.priority} Priority
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{catalog.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setSelectedRecDrawer(rec)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                        >
                          View Details
                        </button>
                        {isAccepted ? (
                          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Collection Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateRecommendation(rec.id, 'ACCEPTED', true)}
                            className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold transition-all shadow-xs"
                          >
                            Accept & Collect
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-200/60 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">Why Recommended for this Project:</span>
                        <p className="text-slate-800 font-medium">{rec.reason}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">Current Data Gap:</span>
                        <p className="text-slate-700">{rec.currentDataGap}</p>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-slate-500 block text-[11px]">Collection Role & Cadence:</span>
                          <span className="font-bold text-slate-900">{catalog.collectionRole} • {catalog.cadence} ({catalog.unit})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section E: Collection Progress & Coverage */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">3. Project Data Collection Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Active Plans</span>
                <span className="text-xl font-black text-slate-900">{coverageData?.summary?.activePlans || 0} Features</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Total Observations</span>
                <span className="text-xl font-black text-slate-900">{coverageData?.summary?.totalObservations || 0} Recorded</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Coverage %</span>
                <span className="text-xl font-black text-emerald-600">{coverageData?.summary?.averageCoveragePercent || 0}% Complete</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Months Collected</span>
                <span className="text-xl font-black text-slate-900">{coverageData?.summary?.monthsCollected || 0} / 3 Months</span>
              </div>
            </div>
          </div>

          {/* Section F: Future Evaluation Gate Status */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>Future Model Evaluation Gate</span>
              </div>
              <h4 className="font-bold text-sm text-white">CUF Baseline Active • CUF+Enriched Pilot Evaluation Locked</h4>
              <p className="text-xs text-slate-400 max-w-2xl">
                Evaluation will become available in the Model Lab after 3-4 months of validated longitudinal observations are collected. Candidate features do NOT alter current predictions until evaluated.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700 shrink-0">
              GATE STATUS: COLLECTION IN PROGRESS
            </span>
          </div>

          {/* Feature Detail Drawer Modal */}
          {selectedRecDrawer && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Enriched Signal Specification</h3>
                  <button onClick={() => setSelectedRecDrawer(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block text-sm">{selectedRecDrawer.featureCatalog?.featureName}</span>
                    <p className="text-slate-600 mt-1">{selectedRecDrawer.featureCatalog?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block">Target Relevance</span>
                      <span className="font-bold text-slate-900">{selectedRecDrawer.targetRelevance}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block">Collection Role</span>
                      <span className="font-bold text-slate-900">{selectedRecDrawer.featureCatalog?.collectionRole}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block">Collection Cadence</span>
                      <span className="font-bold text-slate-900">{selectedRecDrawer.featureCatalog?.cadence} ({selectedRecDrawer.featureCatalog?.unit})</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block">Input Type</span>
                      <span className="font-bold text-slate-900">{selectedRecDrawer.featureCatalog?.inputType}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Why Recommended for this Project:</span>
                    <p className="text-slate-800 mt-0.5 font-medium">{selectedRecDrawer.reason}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Current Information Gap:</span>
                    <p className="text-slate-700 mt-0.5">{selectedRecDrawer.currentDataGap}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedRecDrawer(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200"
                  >
                    Close Specification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'WHAT_IF' ? (
        <WhatIfSimulator projectCode={projectCode} />
      ) : (
        <>
          {/* 2. Latest Snapshot Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Original Cost</span>
          <div className="text-lg font-black text-slate-900">₹{latestSnapshot?.originalCost} Cr</div>
          <span className="text-[11px] text-slate-500">Approved Budget</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Revised Cost</span>
          <div className="text-lg font-black text-amber-700">₹{latestSnapshot?.revisedCost} Cr</div>
          <span className="text-[11px] text-amber-700 font-medium">+₹{((latestSnapshot?.revisedCost || 0) - (latestSnapshot?.originalCost || 0)).toFixed(1)} Cr revision</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Expenditure</span>
          <div className="text-lg font-black text-slate-900">₹{latestSnapshot?.cumulativeExpenditure} Cr</div>
          <span className="text-[11px] text-slate-600 font-medium">{latestSnapshot?.expenditurePercentOriginal}% of Original</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Physical Progress</span>
          <div className="text-lg font-black text-emerald-700">{latestSnapshot?.physicalProgress}%</div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-1">
            <div className="h-full bg-lime-500 rounded-full" style={{ width: `${Math.min(latestSnapshot?.physicalProgress || 0, 100)}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Current Delay</span>
          <div className="text-lg font-black text-rose-600">{latestSnapshot?.delayMonths || 0} Months</div>
          <span className="text-[11px] text-rose-700 font-medium">Reported Overdue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Planned Duration</span>
          <div className="text-lg font-black text-slate-900">{latestSnapshot?.plannedDuration} Mo</div>
          <span className="text-[11px] text-slate-500">Rem: {latestSnapshot?.remainingPlannedDuration} Mo</span>
        </div>
      </div>

      {/* 3. Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Forecast */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-base text-slate-900">Cost Overrun Forecast</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Next Snapshot</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Predicted Category</span>
            <span className="text-sm font-black text-amber-700">
              {prediction?.costPrediction || 'No overrun'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Probability Breakdown</div>
            {prediction?.costProbabilities && Object.entries(prediction.costProbabilities).map(([cls, prob]: any) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>{cls}</span>
                  <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${cls.includes('Major') ? 'bg-rose-500' : (cls.includes('Moderate') ? 'bg-amber-500' : 'bg-emerald-500')}`} style={{ width: `${prob * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay Forecast */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-base text-slate-900">Schedule Delay Forecast</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Next Snapshot</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Predicted Category</span>
            <span className="text-sm font-black text-slate-900">
              {prediction?.delayPrediction || 'Low (<=3 mo)'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Probability Breakdown</div>
            {prediction?.delayProbabilities && Object.entries(prediction.delayProbabilities).map(([cls, prob]: any) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>{cls}</span>
                  <span className="font-mono text-slate-500">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${cls.includes('Severe') ? 'bg-rose-500' : (cls.includes('High') ? 'bg-amber-500' : 'bg-slate-700')}`} style={{ width: `${prob * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Probability Score */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-base text-slate-900">Overall Risk Score</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Binary Model</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="text-4xl font-black text-rose-600">
              {prediction?.scorePercentage || 0}%
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                prediction?.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                (prediction?.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
              }`}>
                {prediction?.riskLevel || 'Low'} Risk Rating
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Risk probability evaluated across 13 execution indicators
            </p>
          </div>
        </div>
      </div>

      {/* 4. SHAP Drivers Explanation */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Key Risk Drivers (SHAP Explanation)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Top 5 feature drivers sorted by absolute SHAP impact magnitude</p>
          </div>
        </div>

        <div className="space-y-4">
          {prediction?.drivers && prediction.drivers.map((driver: any) => {
            const isIncreasing = driver.direction === 'increasing risk';
            return (
              <div key={driver.rank} className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                      #{driver.rank}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 font-mono">{driver.feature}</span>
                      <span className="text-xs text-slate-500 ml-3">Value: <strong className="text-slate-800">{driver.featureValue}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                      isIncreasing ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isIncreasing ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                      <span>{driver.direction}</span>
                    </span>

                    {(userRole === 'MINISTER_POLICYMAKER' || userRole === 'PROJECT_MANAGER') && (
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowInterventionModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Action</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/60">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-0.5">Plain-Language Explanation:</span>
                    <p className="text-slate-600">{driver.explanation}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-0.5">Recommended Action:</span>
                    <p className="text-slate-800">{driver.prescription}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Warnings & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warnings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">Early Warnings Triggered</h3>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">{warnings?.length || 0} Active</span>
          </div>

          <div className="space-y-3">
            {warnings && warnings.length > 0 ? (
              warnings.map((w: any) => (
                <div key={w.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      w.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {w.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{w.status}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{w.title}</h4>
                  <p className="text-xs text-slate-600">{w.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">No active early warnings for this project.</div>
            )}
          </div>
        </div>

        {/* Interventions */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Assigned Interventions</h3>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">{interventions?.length || 0} Total</span>
          </div>

          <div className="space-y-3">
            {interventions && interventions.length > 0 ? (
              interventions.map((i: any) => (
                <div key={i.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">{i.driver}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {i.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{i.recommendation}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Assigned to: <strong>{i.assignedUser?.name || i.assignedRole}</strong></span>
                    <span>Deadline: {i.deadline || '2026-03-25'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">No active interventions created yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Activity Timeline */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Project Activity Timeline & Audit Feed</h2>
          </div>
        </div>

        <div className="space-y-3">
          {activityTimeline && activityTimeline.map((item: any) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{item.title}</span>
                <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Assign Action for Risk Driver</h3>
            
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="text-slate-500">Feature Driver: <strong className="text-slate-900">{selectedDriver?.feature}</strong></div>
              <div className="text-slate-800 font-semibold mt-1">{selectedDriver?.prescription}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Assign Responsible Role</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="FIELD_OFFICER">Field Officer (Ground Inspection)</option>
                <option value="CONTRACTOR">Contractor (Execution Task)</option>
                <option value="PROJECT_MANAGER">Project Manager (Ministry Review)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Action Remarks</label>
              <textarea
                value={assignedRemarks}
                onChange={(e) => setAssignedRemarks(e.target.value)}
                placeholder="Add contextual instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none h-20"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowInterventionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIntervention}
                disabled={submittingIntervention}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-500 shadow-xs"
              >
                {submittingIntervention ? 'Assigning...' : 'Assign Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Update Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Submit Ground Inspection Report</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Physical Progress (%)</label>
              <input
                type="number"
                value={fieldProgress}
                onChange={(e) => setFieldProgress(e.target.value)}
                placeholder={latestSnapshot?.physicalProgress.toString()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Ground Issue Identified</label>
              <input
                type="text"
                value={fieldIssue}
                onChange={(e) => setFieldIssue(e.target.value)}
                placeholder="e.g. Clearance pending..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Verification Remarks</label>
              <textarea
                value={fieldRemarks}
                onChange={(e) => setFieldRemarks(e.target.value)}
                placeholder="Inspection notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none h-20"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowFieldModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFieldUpdate}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-500 shadow-xs"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
