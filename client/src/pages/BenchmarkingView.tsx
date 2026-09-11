import React, { useState, useEffect } from 'react';
import { BarChart3, ChevronRight, Layers } from 'lucide-react';
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-slate-100">Sector & Ministry Peer Benchmarking</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Factual performance comparison against sector medians and peer project averages.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="number"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Project Code (e.g. 40001)"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none w-44"
          />
          <button type="submit" className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold">
            Benchmark
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : benchmark?.hasBenchmark ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">BENCHMARK INSIGHT</span>
              <span className="text-xs text-slate-400">Sector Peers Analyzed: <strong>{benchmark.peerCount} Projects</strong></span>
            </div>
            <p className="text-sm font-semibold text-slate-100">{benchmark.insight}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100">Project vs Sector Average Comparison</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmark.comparison}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="project" name="Target Project" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sectorAverage" name="Sector Average" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
          {benchmark?.message || 'No benchmark available for this project code.'}
        </div>
      )}
    </div>
  );
};
