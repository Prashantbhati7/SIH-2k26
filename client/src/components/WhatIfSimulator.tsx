import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

interface WhatIfSimulatorProps {
  projectCode: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ projectCode }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Baseline & Simulation Data
  const [baselineData, setBaselineData] = useState<any>(null);
  const [simulationData, setSimulationData] = useState<any>(null);

  // Form State (Editable 13 CUF Features)
  const [physicalProgress, setPhysicalProgress] = useState<number>(0);
  const [originalCost, setOriginalCost] = useState<number>(0);
  const [revisedCost, setRevisedCost] = useState<number>(0);
  const [cumulativeExpenditure, setCumulativeExpenditure] = useState<number>(0);
  const [projectAgeMonths, setProjectAgeMonths] = useState<number>(0);
  const [remainingPlannedDuration, setRemainingPlannedDuration] = useState<number>(0);
  const [plannedDuration, setPlannedDuration] = useState<number>(0);
  const [notStartedFlag, setNotStartedFlag] = useState<boolean>(false);
  const [genuineOverdueFlag, setGenuineOverdueFlag] = useState<boolean>(false);

  // Derived feature
  const expenditurePercentOriginal = originalCost > 0 
    ? ((cumulativeExpenditure / originalCost) * 100).toFixed(1) 
    : '0.0';

  // Fetch Baseline Data
  const fetchBaseline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/projects/${projectCode}/what-if/baseline`);
      const data = res.data;
      setBaselineData(data);

      // Initialize hypothetical sliders with baseline values
      const bf = data.baselineFeatures || {};
      setPhysicalProgress(bf.physical_progress || 0);
      setOriginalCost(bf.original_cost || 0);
      setRevisedCost(bf.revised_cost || 0);
      setCumulativeExpenditure(bf.cumulative_expenditure || 0);
      setProjectAgeMonths(bf.project_age_months || 0);
      setRemainingPlannedDuration(bf.remaining_planned_duration || 0);
      setPlannedDuration(bf.planned_duration || 0);
      setNotStartedFlag(bf.not_started_flag > 0.5);
      setGenuineOverdueFlag(bf.genuine_overdue_flag > 0.5);

      // Run initial simulation
      runSimulation({
        physical_progress: bf.physical_progress,
        original_cost: bf.original_cost,
        revised_cost: bf.revised_cost,
        cumulative_expenditure: bf.cumulative_expenditure,
        project_age_months: bf.project_age_months,
        remaining_planned_duration: bf.remaining_planned_duration,
        planned_duration: bf.planned_duration,
        not_started_flag: bf.not_started_flag,
        genuine_overdue_flag: bf.genuine_overdue_flag
      });
    } catch (err: any) {
      console.error('Fetch what-if baseline error:', err);
      setError(err?.response?.data?.error || 'Failed to load project baseline for simulation');
    } finally {
      setLoading(false);
    }
  }, [projectCode]);

  useEffect(() => {
    fetchBaseline();
  }, [fetchBaseline]);

  // Execute Simulation API call
  const runSimulation = async (hypotheticalFeatures: any) => {
    try {
      setSimulating(true);
      const res = await api.post(`/projects/${projectCode}/what-if/simulate`, {
        hypotheticalFeatures
      });
      setSimulationData(res.data);
    } catch (err: any) {
      console.error('Simulation execution error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Handle Input Changes and re-trigger simulation
  const handleSimulateUpdate = (updatedState: any) => {
    const currentState = {
      physical_progress: physicalProgress,
      original_cost: originalCost,
      revised_cost: revisedCost,
      cumulative_expenditure: cumulativeExpenditure,
      project_age_months: projectAgeMonths,
      remaining_planned_duration: remainingPlannedDuration,
      planned_duration: plannedDuration,
      not_started_flag: notStartedFlag ? 1.0 : 0.0,
      genuine_overdue_flag: genuineOverdueFlag ? 1.0 : 0.0,
      ...updatedState
    };
    runSimulation(currentState);
  };

  // Reset to Project Baseline
  const handleReset = () => {
    if (!baselineData) return;
    const bf = baselineData.baselineFeatures || {};
    setPhysicalProgress(bf.physical_progress || 0);
    setOriginalCost(bf.original_cost || 0);
    setRevisedCost(bf.revised_cost || 0);
    setCumulativeExpenditure(bf.cumulative_expenditure || 0);
    setProjectAgeMonths(bf.project_age_months || 0);
    setRemainingPlannedDuration(bf.remaining_planned_duration || 0);
    setPlannedDuration(bf.planned_duration || 0);
    setNotStartedFlag(bf.not_started_flag > 0.5);
    setGenuineOverdueFlag(bf.genuine_overdue_flag > 0.5);

    runSimulation({
      physical_progress: bf.physical_progress,
      original_cost: bf.original_cost,
      revised_cost: bf.revised_cost,
      cumulative_expenditure: bf.cumulative_expenditure,
      project_age_months: bf.project_age_months,
      remaining_planned_duration: bf.remaining_planned_duration,
      planned_duration: bf.planned_duration,
      not_started_flag: bf.not_started_flag,
      genuine_overdue_flag: bf.genuine_overdue_flag
    });
  };

  // Preset Scenario Handlers
  const applyPresetProgress = () => {
    const val = Math.min(100, Math.round((physicalProgress + 10) * 10) / 10);
    setPhysicalProgress(val);
    handleSimulateUpdate({ physical_progress: val });
  };

  const applyPresetExpenditure = () => {
    const val = Math.round(cumulativeExpenditure * 1.15 * 10) / 10;
    setCumulativeExpenditure(val);
    handleSimulateUpdate({ cumulative_expenditure: val });
  };

  const applyPresetDuration = () => {
    const val = remainingPlannedDuration + 6;
    setRemainingPlannedDuration(val);
    handleSimulateUpdate({ remaining_planned_duration: val });
  };

  const applyPresetCostEscalation = () => {
    const val = Math.round(revisedCost * 1.20 * 10) / 10;
    setRevisedCost(val);
    handleSimulateUpdate({ revised_cost: val });
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading What-If Simulator Baseline...</p>
      </div>
    );
  }

  if (error || !baselineData) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Simulation Baseline Unavailable</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchBaseline}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { project, latestSnapshot } = baselineData;
  const bPred = simulationData?.baselinePrediction || baselineData?.baselinePrediction;
  const sPred = simulationData?.simulatedPrediction || bPred;
  const deltas = simulationData?.deltas || { riskProbabilityDelta: 0, scorePercentageDelta: 0 };

  const riskDelta = deltas.scorePercentageDelta || 0;
  const isRiskReduced = riskDelta < 0;
  const isRiskIncreased = riskDelta > 0;

  return (
    <div className="space-y-8">
      {/* 1. Simulator Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Stateless What-If Scenario Simulator</span>
            </div>
            <h2 className="text-xl font-black text-white">Hypothetical Executive Scenario Sandbox</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Test how modifications to progress, expenditure, budget escalation, and remaining duration impact ML risk forecasts for <strong className="text-white">{project?.projectName}</strong> without modifying database records.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mr-2">Quick Presets:</span>
          <button
            onClick={applyPresetProgress}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            +10% Progress
          </button>
          <button
            onClick={applyPresetExpenditure}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            +15% Expenditure
          </button>
          <button
            onClick={applyPresetDuration}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            +6 Mo Remaining
          </button>
          <button
            onClick={applyPresetCostEscalation}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            +20% Revised Cost
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Controls & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Scenario Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Scenario Vector Inputs</h3>
              </div>
              {simulating && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
                  Computing ML Vector...
                </span>
              )}
            </div>

            {/* Categorical Metadata Badges (Read-Only) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categorical Baseline Identifiers (Fixed)</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">{project?.ministry}</span>
                <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">{project?.sector}</span>
                <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">{project?.state}</span>
              </div>
            </div>

            {/* 1. Physical Progress Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Physical Progress (%)</span>
                <span className="font-mono text-indigo-600">{physicalProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={physicalProgress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPhysicalProgress(val);
                  handleSimulateUpdate({ physical_progress: val });
                }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Not Started)</span>
                <span>Baseline: {latestSnapshot?.physicalProgress}%</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            {/* 2. Cumulative Expenditure */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex justify-between">
                <span>Cumulative Expenditure (₹ Cr)</span>
                <span className="text-[10px] text-slate-400 font-mono">Baseline: ₹{latestSnapshot?.cumulativeExpenditure} Cr</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cumulativeExpenditure}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setCumulativeExpenditure(val);
                  handleSimulateUpdate({ cumulative_expenditure: val });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Calculated Expenditure % Badge */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-medium">Expenditure / Original Budget Ratio</span>
              <span className="font-mono font-bold text-indigo-700">{expenditurePercentOriginal}%</span>
            </div>

            {/* 3. Original & Revised Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Original Cost (₹ Cr)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={originalCost}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setOriginalCost(val);
                    handleSimulateUpdate({ original_cost: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Revised Cost (₹ Cr)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={revisedCost}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setRevisedCost(val);
                    handleSimulateUpdate({ revised_cost: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Durations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Planned Duration (Mo)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={plannedDuration}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setPlannedDuration(val);
                    handleSimulateUpdate({ planned_duration: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Remaining Duration (Mo)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={remainingPlannedDuration}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setRemainingPlannedDuration(val);
                    handleSimulateUpdate({ remaining_planned_duration: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* 5. Project Age & Flags */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Project Age (Months)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={projectAgeMonths}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setProjectAgeMonths(val);
                    handleSimulateUpdate({ project_age_months: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-1">
                <span>Not Started Flag</span>
                <input
                  type="checkbox"
                  checked={notStartedFlag}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNotStartedFlag(checked);
                    handleSimulateUpdate({ not_started_flag: checked ? 1.0 : 0.0 });
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Genuine Overdue Flag</span>
                <input
                  type="checkbox"
                  checked={genuineOverdueFlag}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setGenuineOverdueFlag(checked);
                    handleSimulateUpdate({ genuine_overdue_flag: checked ? 1.0 : 0.0 });
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Comparative Prediction Outputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* A. Overall Risk Score Comparison */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">1. Forward Risk Score Shift</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Stateless Inference</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline Risk Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Baseline Real State</span>
                <div className="text-3xl font-black text-slate-900">{bPred?.risk?.scorePercentage || 0}%</div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  bPred?.risk?.level === 'High' ? 'bg-rose-100 text-rose-800' :
                  (bPred?.risk?.level === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                }`}>
                  {bPred?.risk?.level || 'Low'} Risk
                </span>
              </div>

              {/* Simulated Risk Card */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-center relative overflow-hidden">
                <span className="text-xs text-indigo-800 font-bold uppercase tracking-wider block">Hypothetical Scenario</span>
                <div className="text-3xl font-black text-indigo-950">{sPred?.risk?.scorePercentage || 0}%</div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  sPred?.risk?.level === 'High' ? 'bg-rose-100 text-rose-800' :
                  (sPred?.risk?.level === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                }`}>
                  {sPred?.risk?.level || 'Low'} Risk
                </span>
              </div>
            </div>

            {/* Delta Indicator Box */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isRiskReduced ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
              (isRiskIncreased ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-900')
            }`}>
              <div className="flex items-center space-x-2">
                {isRiskReduced && <TrendingDown className="w-5 h-5 text-emerald-600" />}
                {isRiskIncreased && <TrendingUp className="w-5 h-5 text-rose-600" />}
                {!isRiskReduced && !isRiskIncreased && <Minus className="w-5 h-5 text-slate-500" />}
                <div>
                  <span className="font-bold text-xs block">Estimated Risk Delta</span>
                  <p className="text-[11px] opacity-80">
                    {isRiskReduced ? 'Scenario shifts parameters toward lower risk prediction.' :
                     (isRiskIncreased ? 'Scenario shifts parameters toward higher risk prediction.' : 'No change in risk probability.')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-lg font-black font-mono ${
                  isRiskReduced ? 'text-emerald-700' : (isRiskIncreased ? 'text-rose-700' : 'text-slate-700')
                }`}>
                  {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`}
                </span>
              </div>
            </div>
          </div>

          {/* B. Cost Overrun Forecast Comparison */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-base text-slate-900">2. Cost Overrun Forecast Breakdown</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Baseline Category:</span>
                <span className="text-slate-900 font-bold text-sm">{bPred?.cost?.prediction || 'No overrun'}</span>
              </div>
              <div>
                <span className="text-indigo-600 text-[10px] uppercase font-bold block">Simulated Category:</span>
                <span className="text-indigo-950 font-bold text-sm">{sPred?.cost?.prediction || 'No overrun'}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Probability Distribution (Baseline vs Simulated)</span>
              {bPred?.cost?.probabilities && Object.keys(bPred.cost.probabilities).map((cls: string) => {
                const bProb = bPred.cost.probabilities[cls] || 0;
                const sProb = sPred?.cost?.probabilities?.[cls] || 0;
                return (
                  <div key={cls} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>{cls}</span>
                      <span className="font-mono text-[11px]">
                        Base: {(bProb * 100).toFixed(1)}% → <strong className="text-indigo-700">Sim: {(sProb * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${bProb * 100}%` }} />
                      </div>
                      <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sProb * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Schedule Delay Forecast Comparison */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-base text-slate-900">3. Schedule Delay Forecast Breakdown</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Baseline Category:</span>
                <span className="text-slate-900 font-bold text-sm">{bPred?.delay?.prediction || 'Low (<=3 mo)'}</span>
              </div>
              <div>
                <span className="text-indigo-600 text-[10px] uppercase font-bold block">Simulated Category:</span>
                <span className="text-indigo-950 font-bold text-sm">{sPred?.delay?.prediction || 'Low (<=3 mo)'}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Probability Distribution (Baseline vs Simulated)</span>
              {bPred?.delay?.probabilities && Object.keys(bPred.delay.probabilities).map((cls: string) => {
                const bProb = bPred.delay.probabilities[cls] || 0;
                const sProb = sPred?.delay?.probabilities?.[cls] || 0;
                return (
                  <div key={cls} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>{cls}</span>
                      <span className="font-mono text-[11px]">
                        Base: {(bProb * 100).toFixed(1)}% → <strong className="text-indigo-700">Sim: {(sProb * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${bProb * 100}%` }} />
                      </div>
                      <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sProb * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. Methodological & Non-Causal Notice */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 font-bold text-slate-900">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Model Prediction & Non-Causal Framing Notice</span>
            </div>
            <p className="leading-relaxed">
              This What-If Simulator runs statistical inference against trained XGBoost ML models using the 13 baseline CUF features. Outputs represent predicted probabilities across historical reporting cycles and do not constitute physical or financial guarantees.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
