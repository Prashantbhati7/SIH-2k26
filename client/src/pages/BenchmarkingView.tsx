import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { api } from '../services/api';

interface BenchmarkingViewProps {
  projectCode?: number;
  onSelectProject: (pCode: number) => void;
}

export const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({ projectCode = 40001, onSelectProject }) => {
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputCode, setInputCode] = useState<string>(projectCode.toString());

  useEffect(() => {
    fetchBenchmark(projectCode);
  }, [projectCode]);

  const fetchBenchmark = async (code: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/benchmark/${code}`);
      setBenchmark(res.data);
    } catch (err) {
      console.error('Fetch benchmark error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = parseInt(inputCode, 10);
    if (!isNaN(code)) fetchBenchmark(code);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sector Peer Benchmarking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Performance comparison against sector medians and peer project averages.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="number"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Project Code (e.g. 40001)"
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none w-44 shadow-xs"
          />
          <button type="submit" className="px-4 py-1.5 bg-lime-400 hover:bg-lime-500 text-slate-950 rounded-xl text-xs font-bold shadow-xs">
            Benchmark
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
        </div>
      ) : benchmark?.hasBenchmark ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">BENCHMARK INSIGHT</span>
              <span className="text-xs text-slate-500">Sector Peers Analyzed: <strong>{benchmark.peerCount} Projects</strong></span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{benchmark.insight}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900">Project vs Sector Average Comparison</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmark.comparison}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="project" name="Target Project" fill="#84cc16" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sectorAverage" name="Sector Average" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 shadow-xs">
          {benchmark?.message || 'No benchmark available for this project code.'}
        </div>
      )}
    </div>
  );
};
