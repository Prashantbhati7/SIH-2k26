import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, AlertCircle, FileText, Layers } from 'lucide-react';
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
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { models, methodology, cufVsEnrichedStory } = modelData || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-100">Model Intelligence Lab & AI Transparency</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded model architecture, GroupShuffleSplit methodology, evaluation metrics, and limitation disclosures.
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models && models.map((m: any) => (
          <div key={m.version} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/20">
                  {m.version}
                </span>
                <span className="text-xs text-slate-400">{m.featureCount || 13} Features</span>
              </div>

              <h3 className="font-bold text-base text-slate-100">{m.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{m.type}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Training Rows</span>
                  <span className="font-bold text-slate-200">{m.rows}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Unique Projects</span>
                  <span className="font-bold text-slate-200">{m.projects}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Baseline Acc</span>
                  <span className="font-bold text-slate-400">{(m.baselineAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Model Accuracy</span>
                  <span className="font-bold text-emerald-400">{(m.modelAccuracy * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex justify-between items-center text-xs">
                <span className="text-slate-300">Macro F1 Score:</span>
                <span className="font-bold text-indigo-300 font-mono">{m.macroF1}</span>
              </div>
            </div>

            {m.limitationNote && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                <strong>Limitation Note</strong>: {m.limitationNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Methodology & Split Explanation Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Evaluation Methodology & GroupShuffleSplit Rationale</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">Train/Test Split Method:</span>
            <p className="text-indigo-300 font-mono">{methodology?.split || 'GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">Grouping Rationale:</span>
            <p className="text-slate-300">{methodology?.rationale || 'Project-level grouping prevents data leakage between monthly reporting snapshots of the same project.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
