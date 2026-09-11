import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

interface ContractorDashboardProps {
  onSelectProject: (pCode: number) => void;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ onSelectProject }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [taskCompleted, setTaskCompleted] = useState<string>('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/contractor');
      setData(res.data);
    } catch (err) {
      console.error('Fetch contractor dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    try {
      await api.patch(`/contractor/tasks/${taskId}`, {
        completed: parseFloat(taskCompleted),
        status: parseFloat(taskCompleted) >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
      });
      setUpdatingTaskId(null);
      fetchDashboard();
    } catch (err: any) {
      alert('Failed to update task: ' + (err?.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, tasks, targets, milestones } = data || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <HardHat className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-slate-100">Contractor Execution Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Site task execution, target vs achievement tracking, and milestone completion logging.
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Contractor / Implementer Role Active
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Contracts</span>
          <div className="text-2xl font-black text-slate-100">{kpis?.assignedProjects}</div>
          <span className="text-[10px] text-slate-500">Active Works</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Work Tasks</span>
          <div className="text-2xl font-black text-indigo-400">{kpis?.activeTasks}</div>
          <span className="text-[10px] text-indigo-400/80">In Progress</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Tasks</span>
          <div className="text-2xl font-black text-emerald-400">{kpis?.completedTasks}</div>
          <span className="text-[10px] text-emerald-400/80">Delivered</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Overdue Tasks</span>
          <div className="text-2xl font-black text-red-400">{kpis?.overdueTasks}</div>
          <span className="text-[10px] text-red-400/80">Past Deadline</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Achievement</span>
          <div className="text-2xl font-black text-amber-400">{kpis?.monthlyTargetPct}%</div>
          <span className="text-[10px] text-slate-500">Target vs Progress</span>
        </div>
      </div>

      {/* Contractor Active Work Tasks */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100">Assigned Contract Tasks & Execution Progress</h2>
          <span className="text-xs text-slate-400">{tasks?.length || 0} Total Work Tasks</span>
        </div>

        <div className="space-y-4">
          {tasks && tasks.map((t: any) => {
            const pct = Math.min(Math.round((t.completed / t.target) * 100), 100);
            return (
              <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">Code: {t.projectCode}</span>
                      <span className="text-xs font-bold text-slate-200">{t.projectName}</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-300 mt-1">{t.task}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {t.status}
                    </span>

                    {updatingTaskId === t.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={taskCompleted}
                          onChange={(e) => setTaskCompleted(e.target.value)}
                          placeholder={t.completed.toString()}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateTask(t.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setUpdatingTaskId(t.id);
                          setTaskCompleted(t.completed.toString());
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Progress</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Completion Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Progress: {t.completed} / {t.target}</span>
                    <span>{pct}% Completed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
