import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { api } from '../services/api';

export const ReportsView: React.FC = () => {
  const [projectCode, setProjectCode] = useState<string>('40001');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCode) return;
    try {
      setLoading(true);
      const res = await api.post(`/reports/${projectCode}`);
      setReport(res.data.report);
    } catch (err: any) {
      alert('Failed to generate report: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Intelligence Reports Generator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable, comprehensive executive reports including model predictions, SHAP drivers, warnings, and interventions.
          </p>
        </div>

        <form onSubmit={handleGenerateReport} className="flex items-center space-x-2">
          <input
            type="number"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Project Code"
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none w-36 shadow-xs"
          />
          <button type="submit" className="px-4 py-1.5 bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      </div>

      {report ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 space-y-6 shadow-xs printable-area">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{report.title}</h2>
              <p className="text-xs text-slate-500">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
              <div className="text-[10px] text-amber-700 font-mono mt-1">{report.disclaimer}</div>
            </div>
            <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 flex items-center space-x-1.5">
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div><span className="text-slate-500 block">Project Code</span><strong className="text-slate-900">{report.project.code}</strong></div>
            <div><span className="text-slate-500 block">Project Name</span><strong className="text-slate-900">{report.project.name}</strong></div>
            <div><span className="text-slate-500 block">Sector</span><strong className="text-slate-900">{report.project.sector}</strong></div>
            <div><span className="text-slate-500 block">State</span><strong className="text-slate-900">{report.project.state}</strong></div>
          </div>

          {/* Model Intelligence Summary */}
          {report.predictions && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900">XGBoost Forecast & Risk Probability</h3>
              <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 block">Future Risk Level</span><strong className="text-rose-600 font-bold">{report.predictions.riskLevel} ({report.predictions.riskProbabilityPct}%)</strong></div>
                <div><span className="text-slate-500 block">Cost Forecast</span><strong className="text-amber-700">{report.predictions.costOverrunPrediction}</strong></div>
                <div><span className="text-slate-500 block">Delay Forecast</span><strong className="text-slate-900">{report.predictions.delayPrediction}</strong></div>
              </div>

              <h4 className="font-bold text-xs text-slate-800 pt-2">Top 5 SHAP Risk Drivers & Prescriptions</h4>
              <div className="space-y-2">
                {report.predictions.drivers.map((d: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                    <div>
                      <strong className="text-slate-900 font-mono">{d.feature}</strong> ({d.direction}): {d.explanation}
                      <div className="text-slate-600 text-[11px] mt-1">Prescription: {d.recommendation}</div>
                    </div>
                    <span className="font-mono text-slate-500 text-[10px]">Impact: {d.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-white border border-slate-200/80 rounded-2xl text-center space-y-3 shadow-xs">
          <p className="text-xs text-slate-500">Enter a project code above (e.g. 40001) and click "Generate Report" to build a project report.</p>
        </div>
      )}
    </div>
  );
};
