import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Cpu, Database } from 'lucide-react';
import { api } from '../services/api';

export const DataUploadView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to upload monthly data file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl font-black text-slate-100">Monthly PAIMANA Data Upload & Validation</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest monthly reporting cycle project records, perform automated data validation, and update predictions.
          </p>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-800 hover:border-teal-500/50 transition-all text-center space-y-4 max-w-2xl mx-auto">
        <UploadCloud className="w-12 h-12 text-teal-400 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-200">Upload Monthly Project CSV File</h3>
          <p className="text-xs text-slate-400">Supports PAIMANA CUF CSV exports with standard 13 model feature vector fields</p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload-input"
        />
        <label
          htmlFor="csv-upload-input"
          className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
        >
          {file ? file.name : 'Select CSV File'}
        </label>

        {file && (
          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all"
            >
              {uploading ? 'Validating & Processing...' : 'Process Monthly Upload'}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Upload Processing Results */}
      {result && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{result.message}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Rows Received</span>
              <span className="text-lg font-bold text-slate-100">{result.summary.rowsReceived}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Valid Rows</span>
              <span className="text-lg font-bold text-emerald-400">{result.summary.validCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Invalid / Errors</span>
              <span className="text-lg font-bold text-red-400">{result.summary.invalidCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Projects Updated</span>
              <span className="text-lg font-bold text-indigo-400">{result.summary.projectsUpdated}</span>
            </div>
          </div>
        </div>
      )}

      {/* CUF vs Enriched Data Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">CUF vs Pilot Enriched Data Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">CURRENT</span>
            <h4 className="font-bold text-slate-200">CUF / PAIMANA Baseline Model</h4>
            <p className="text-slate-400">Trained on 13 monthly PAIMANA reporting feature columns using XGBoost + SHAP.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">PILOT ENRICHMENT</span>
            <h4 className="font-bold text-slate-200">Daily Ground & Contractor Feed</h4>
            <p className="text-slate-400">Collecting ground execution velocity, milestone updates & evidence for enriched storage.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">PLANNED FUTURE</span>
            <h4 className="font-bold text-slate-200">CUF + Enriched Retraining</h4>
            <p className="text-slate-400">Future feature engineering & model validation once sufficient pilot dataset is accumulated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
