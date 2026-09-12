import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ModelLab: React.FC = () => {
  const [modelData, setModelData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get('/models');
      setModelData(res.data);
    } catch (err) {
      console.error('Fetch model lab error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { models, methodology } = modelData || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Model Intelligence Lab & AI Transparency</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded model architecture, GroupShuffleSplit methodology, evaluation metrics, and limitation disclosures.
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models && models.map((m: any) => {
          const baselineVal = m.baselineAccuracy ?? m.baseline_accuracy ?? 0;
          const modelVal = m.modelAccuracy ?? m.model_accuracy ?? 0;
          const macroF1Val = m.macroF1 ?? m.macro_f1 ?? 0;
          
          const baselineText = (typeof baselineVal === 'number' && !isNaN(baselineVal)) 
            ? (baselineVal * 100).toFixed(1) + '%' 
            : 'N/A';
          const modelText = (typeof modelVal === 'number' && !isNaN(modelVal)) 
            ? (modelVal * 100).toFixed(1) + '%' 
            : 'N/A';
          const macroF1Text = (typeof macroF1Val === 'number' && !isNaN(macroF1Val)) 
            ? macroF1Val.toFixed(4) 
            : String(macroF1Val || 'N/A');

          const name = m.name || (m.version.includes('COST') ? 'Cost Overrun Model' : m.version.includes('DELAY') ? 'Future Delay Model' : 'Future Risk Model');
          const type = m.type || (m.version.includes('COST') ? 'XGBClassifier Multiclass (multi:softprob)' : m.version.includes('DELAY') ? 'XGBClassifier Multiclass (multi:softprob)' : 'XGBClassifier Binary (binary:logistic)');

          return (
            <div key={m.version} className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                    {m.version}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{m.featureCount || 13} Features</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{name}</h3>
                <p className="text-xs text-slate-500 font-mono">{type}</p>

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Training Rows</span>
                    <span className="font-bold text-slate-900">{m.rows}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Unique Projects</span>
                    <span className="font-bold text-slate-900">{m.projects}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Baseline Acc</span>
                    <span className="font-bold text-slate-600">{baselineText}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Model Accuracy</span>
                    <span className="font-bold text-emerald-700">{modelText}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Macro F1 Score:</span>
                  <span className="font-bold text-slate-900 font-mono">{macroF1Text}</span>
                </div>
              </div>

              {m.limitationNote && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <strong>Limitation Note</strong>: {m.limitationNote}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Methodology & Split Explanation Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Evaluation Methodology & GroupShuffleSplit Rationale</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Train/Test Split Method:</span>
            <p className="text-slate-800 font-mono">{methodology?.split || 'GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Grouping Rationale:</span>
            <p className="text-slate-600">{methodology?.rationale || 'Project-level grouping prevents data leakage between monthly reporting snapshots of the same project.'}</p>
          </div>
        </div>
      </div>

      {/* Enrichment Progress & Evaluation Gate Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-slate-800" />
              <span>Progressive Enrichment Model Evaluation Gate</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Controlled offline comparison between Baseline CUF-only vs CUF+Enriched pilot model.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-400 font-mono text-xs font-bold shrink-0">
            GATE STATUS: COLLECTION IN PROGRESS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 block">Baseline Model (Active)</span>
            <span className="text-sm font-black text-slate-900 block">CUF-XGB-v1 (13 Features)</span>
            <p className="text-slate-600">Currently serving production risk predictions across all 120+ projects.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 block">Candidate Pilot Model</span>
            <span className="text-sm font-black text-slate-900 block">CUF-ENRICHED-XGB-v1-PILOT</span>
            <p className="text-slate-600">Integrates 3 enriched signals (Milestone Slippage, Site Stoppage, Progress Velocity).</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
            <span className="font-bold block">Evaluation Readiness Gate</span>
            <span className="font-black text-sm block">Locked (0 / 24 Verified Observations)</span>
            <p className="text-amber-800">Requires 3-4 months of validated longitudinal observations before running offline pilot comparison.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
