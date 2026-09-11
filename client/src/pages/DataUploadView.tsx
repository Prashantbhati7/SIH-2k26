import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Database } from 'lucide-react';
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Data Upload & Validation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ingest monthly reporting cycle project records, perform automated data validation, and update predictions.
          </p>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div className="p-8 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all text-center space-y-4 max-w-2xl mx-auto shadow-xs">
        <UploadCloud className="w-12 h-12 text-slate-700 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900">Upload Monthly Project CSV File</h3>
          <p className="text-xs text-slate-500">Supports PAIMANA CUF CSV exports with standard 13 model feature vector fields</p>
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
          className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
        >
          {file ? file.name : 'Select CSV File'}
        </label>

        {file && (
          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              {uploading ? 'Validating & Processing...' : 'Process Monthly Upload'}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Upload Processing Results */}
      {result && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{result.message}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Rows Received</span>
              <span className="text-lg font-black text-slate-900">{result.summary.rowsReceived}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Valid Rows</span>
              <span className="text-lg font-black text-emerald-700">{result.summary.validCount}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Invalid / Errors</span>
              <span className="text-lg font-black text-rose-600">{result.summary.invalidCount}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Projects Updated</span>
              <span className="text-lg font-black text-slate-900">{result.summary.projectsUpdated}</span>
            </div>
          </div>
        </div>
      )}

      {/* CUF vs Enriched Data Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900">CUF vs Pilot Enriched Data Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">CURRENT</span>
            <h4 className="font-bold text-slate-900">CUF / PAIMANA Baseline Model</h4>
            <p className="text-slate-600">Trained on 13 monthly PAIMANA reporting feature columns using XGBoost + SHAP.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">PILOT ENRICHMENT</span>
            <h4 className="font-bold text-slate-900">Daily Ground & Contractor Feed</h4>
            <p className="text-slate-600">Collecting ground execution velocity, milestone updates & evidence for enriched storage.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">PLANNED FUTURE</span>
            <h4 className="font-bold text-slate-900">CUF + Enriched Retraining</h4>
            <p className="text-slate-600">Future feature engineering & model validation once sufficient pilot dataset is accumulated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
