import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle } from 'lucide-react';
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-black text-slate-100">Project Intelligence Reports Generator</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable, comprehensive executive reports including model predictions, SHAP drivers, warnings, and interventions.
          </p>
        </div>

        <form onSubmit={handleGenerateReport} className="flex items-center space-x-2">
          <input
            type="number"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Project Code"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none w-36"
          />
          <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      </div>

      {report ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl printable-area">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">{report.title}</h2>
              <p className="text-xs text-slate-400">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
              <div className="text-[10px] text-amber-400 font-mono mt-1">{report.disclaimer}</div>
            </div>
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1">
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div><span className="text-slate-500 block">Project Code</span><strong className="text-slate-200">{report.project.code}</strong></div>
            <div><span className="text-slate-500 block">Project Name</span><strong className="text-slate-200">{report.project.name}</strong></div>
            <div><span className="text-slate-500 block">Sector</span><strong className="text-slate-200">{report.project.sector}</strong></div>
            <div><span className="text-slate-500 block">State</span><strong className="text-slate-200">{report.project.state}</strong></div>
          </div>

          {/* Model Intelligence Summary */}
          {report.predictions && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-200">XGBoost Forecast & Risk Probability</h3>
              <div className="grid grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500 block">Future Risk Level</span><strong className="text-red-400 font-bold">{report.predictions.riskLevel} ({report.predictions.riskProbabilityPct}%)</strong></div>
                <div><span className="text-slate-500 block">Cost Forecast</span><strong className="text-amber-300">{report.predictions.costOverrunPrediction}</strong></div>
                <div><span className="text-slate-500 block">Delay Forecast</span><strong className="text-purple-300">{report.predictions.delayPrediction}</strong></div>
              </div>

              <h4 className="font-bold text-xs text-slate-300 pt-2">Top 5 SHAP Risk Drivers & Prescriptions</h4>
              <div className="space-y-2">
                {report.predictions.drivers.map((d: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between">
                    <div>
                      <strong className="text-indigo-300 font-mono">{d.feature}</strong> ({d.direction}): {d.explanation}
                      <div className="text-slate-400 text-[11px] mt-1">Prescription: {d.recommendation}</div>
                    </div>
                    <span className="font-mono text-slate-500 text-[10px]">Impact: {d.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">Enter a project code above (e.g. 40001) and click "Generate Report" to build a full project report.</p>
        </div>
      )}
    </div>
  );
};
