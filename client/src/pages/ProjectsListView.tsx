import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  Sliders,
  RotateCcw,
  Building2,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { api } from '../services/api';

interface ProjectsListViewProps {
  onSelectProject: (projectCode: number) => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  // Summary Metrics
  const [summaryStats, setSummaryStats] = useState({
    highRiskCount: 0,
    totalBudgetCr: 0,
    avgProgress: 0
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedSector) params.sector = selectedSector;
      if (selectedState) params.state = selectedState;
      if (selectedRisk) params.riskLevel = selectedRisk;

      const res = await api.get('/projects', { params });
      const data = res.data;

      setProjects(data.projects || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Compute quick statistics for current view
      if (data.projects && data.projects.length > 0) {
        const highRisk = data.projects.filter((p: any) => p.riskLevel === 'High').length;
        const totalCost = data.projects.reduce((acc: number, p: any) => acc + (p.revisedCost || p.originalCost || 0), 0);
        const avgProg = data.projects.reduce((acc: number, p: any) => acc + (p.physicalProgress || 0), 0) / data.projects.length;

        setSummaryStats({
          highRiskCount: highRisk,
          totalBudgetCr: Math.round(totalCost),
          avgProgress: Math.round(avgProg * 10) / 10
        });
      }
    } catch (err: any) {
      console.error('Fetch projects list error:', err);
      setError(err?.response?.data?.error || 'Failed to load projects list');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedSector, selectedState, selectedRisk]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSelectedState('');
    setSelectedRisk('');
    setPage(1);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
            <FolderKanban className="w-4 h-4" />
            <span>National Infrastructure Directory</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">All Monitored Projects</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Comprehensive list of active infrastructure projects evaluated by VikasDrishti XGBoost ML models. Click any project to inspect its complete Digital Profile, baseline predictions, and What-If Simulator.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 text-lime-400 font-mono text-xs font-bold border border-slate-700">
            {total} Projects Registered
          </span>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Projects Listed</span>
            <FolderKanban className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-500">Tracked across all Ministries</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>High Risk Projects (Current View)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{summaryStats.highRiskCount}</div>
          <p className="text-[11px] text-slate-500">Forward Risk Probability &gt; 66%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Approved Budget</span>
            <DollarSign className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{summaryStats.totalBudgetCr} Cr</div>
          <p className="text-[11px] text-slate-500">Current page cumulative budget</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Physical Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{summaryStats.avgProgress}%</div>
          <p className="text-[11px] text-slate-500">Current page physical completion</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name or project code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="">All Sectors</option>
              <option value="Road Transport & Highways">Road Transport & Highways</option>
              <option value="Railways">Railways</option>
              <option value="Power & Renewable Energy">Power & Renewable Energy</option>
              <option value="Urban Development">Urban Development</option>
              <option value="Water Resources & Sanitation">Water Resources & Sanitation</option>
              <option value="Coal & Mining">Coal & Mining</option>
              <option value="Petroleum & Natural Gas">Petroleum & Natural Gas</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="">All Risk Ratings</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            {(searchTerm || selectedSector || selectedState || selectedRisk) && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Projects Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading Infrastructure Projects...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-rose-600 font-semibold">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-slate-500">
            <p className="text-sm font-bold text-slate-800">No Projects Found</p>
            <p className="text-xs">No projects match your current search query or filter selection.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Project & Code</th>
                  <th className="p-4">Ministry & Sector</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Approved Budget</th>
                  <th className="p-4">Physical Progress</th>
                  <th className="p-4">Current Delay</th>
                  <th className="p-4">ML Forward Risk</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {projects.map((p: any) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectProject(p.projectCode)}
                  >
                    {/* Code & Name */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                          {p.projectCode}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 group-hover:text-lime-700 transition-colors mt-1">
                        {p.projectName}
                      </div>
                    </td>

                    {/* Ministry & Sector */}
                    <td className="p-4">
                      <div className="text-slate-900 font-semibold">{p.sector}</div>
                      <div className="text-[11px] text-slate-500">{p.ministry}</div>
                    </td>

                    {/* State */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.state}</span>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">₹{p.revisedCost || p.originalCost} Cr</div>
                      {p.revisedCost > p.originalCost && (
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          Rev from ₹{p.originalCost} Cr
                        </span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="p-4">
                      <div className="font-bold text-emerald-700">{p.physicalProgress}%</div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-lime-500 rounded-full" style={{ width: `${Math.min(p.physicalProgress, 100)}%` }} />
                      </div>
                    </td>

                    {/* Delay */}
                    <td className="p-4">
                      <div className="font-semibold text-rose-600">{p.delayMonths || 0} Months</div>
                    </td>

                    {/* ML Risk */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1 w-fit ${
                        p.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        (p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                      }`}>
                        <ShieldAlert className="w-3 h-3" />
                        <span>{p.riskLevel} ({p.scorePercentage || p.riskProbability}%)</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProject(p.projectCode)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {!loading && projects.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-slate-500 font-medium">
              Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({total} total projects)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-slate-600 font-bold px-2">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
