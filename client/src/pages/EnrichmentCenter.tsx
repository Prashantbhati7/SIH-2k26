import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Building2, 
  UserCheck, 
  BarChart3,
  Search,
  FileCheck
} from 'lucide-react';
import { enrichmentService } from '../services/enrichmentService';

export const EnrichmentCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const res = await enrichmentService.getPortfolioCoverage();
      setPortfolioData(res.portfolio);
      setPendingQueue(res.pendingQueue || []);
    } catch (err) {
      console.error('Fetch portfolio enrichment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyObservation = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setVerifyingId(id);
      await enrichmentService.verifyObservation(id, status, 'Rajesh Kumar (Project Director)');
      fetchPortfolioData();
    } catch (err: any) {
      alert('Verification failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredQueue = pendingQueue.filter((item: any) => 
    (item.project?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.featureCatalog?.featureName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.remarks || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-lime-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Manager Intelligence Suite</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Enrichment & Verification Center</h1>
          <p className="text-xs text-slate-500">
            Manage project signal collection plans, verify field officer submissions, and track portfolio data readiness.
          </p>
        </div>

        <button
          onClick={fetchPortfolioData}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all shrink-0"
        >
          Refresh Queue
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Active Collection Plans</span>
          <div className="text-2xl font-black text-slate-900">{portfolioData?.activePlansCount || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium">{portfolioData?.projectsCollectingCount || 0} Projects Actively Collecting</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Observations</span>
          <div className="text-2xl font-black text-slate-900">{portfolioData?.totalObservationsCount || 0}</div>
          <span className="text-[11px] text-emerald-600 font-bold">{portfolioData?.verifiedObservationsCount || 0} Verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
          <div className="text-2xl font-black text-amber-600">{portfolioData?.pendingVerificationCount || 0}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Requires Manager Action</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Readiness Gate Status</span>
          <div className="text-sm font-black text-amber-400">{portfolioData?.readinessGateStatus || 'COLLECTION IN PROGRESS'}</div>
          <span className="text-[11px] text-slate-400 block pt-1">Pilot Model Evaluation Locked</span>
        </div>
      </div>

      {/* Observation Verification Queue */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Field & Execution Observation Verification Queue</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Review and verify observations submitted by Field Officers and Contractors.</p>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project or feature..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-semibold">Loading verification queue...</div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">No Pending Observations</h4>
            <p className="text-xs text-slate-500">All submitted enriched signals have been reviewed and verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQueue.map((item: any) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
                      {item.project?.projectName || 'Project 40001'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-slate-900 text-[10px] font-black border border-lime-300">
                      {item.featureCatalog?.featureName}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Date: {item.observedAt}</span>
                  </div>

                  <div className="text-sm font-black text-slate-900 flex items-center space-x-2">
                    <span>Value: {item.valueNumeric !== null ? item.valueNumeric : item.valueText} {item.unit || item.featureCatalog?.unit}</span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    Remarks: <strong className="text-slate-800">{item.remarks || 'Field ground inspection report.'}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleVerifyObservation(item.id, 'REJECTED')}
                    disabled={verifyingId === item.id}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyObservation(item.id, 'VERIFIED')}
                    disabled={verifyingId === item.id}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Signal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
