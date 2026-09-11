import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Edit2
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, tasks } = data || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contractor Execution Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
              Viewing: Contractor / Implementer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Site task execution, target vs achievement tracking, and milestone completion logging.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Assigned Contracts</span>
          <div className="text-3xl font-black text-slate-900">{kpis?.assignedProjects || 3}</div>
          <span className="text-xs text-slate-500 font-medium">Active Works</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Active Work Tasks</span>
          <div className="text-3xl font-black text-slate-800">{kpis?.activeTasks || 6}</div>
          <span className="text-xs text-slate-600 font-medium">In Progress</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Completed Tasks</span>
          <div className="text-3xl font-black text-emerald-600">{kpis?.completedTasks || 12}</div>
          <span className="text-xs text-emerald-700 font-medium">Delivered</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
          <div className="text-3xl font-black text-rose-600">{kpis?.overdueTasks || 1}</div>
          <span className="text-xs text-rose-700 font-medium">Past Deadline</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Monthly Target</span>
          <div className="text-3xl font-black text-amber-600">{kpis?.monthlyTargetPct || 82}%</div>
          <span className="text-xs text-slate-500 font-medium">Achievement Ratio</span>
        </div>
      </div>

      {/* Contractor Active Work Tasks */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Assigned Contract Tasks & Execution Progress</h2>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {tasks?.length || 0} Total Work Tasks
          </span>
        </div>

        <div className="space-y-4">
          {tasks && tasks.map((t: any) => {
            const pct = Math.min(Math.round((t.completed / t.target) * 100), 100);
            return (
              <div key={t.id} className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-500">Code: {t.projectCode}</span>
                      <span className="text-xs font-bold text-slate-900">{t.projectName}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{t.task}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-800'
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
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateTask(t.id)}
                          className="px-3 py-1 bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold rounded-lg shadow-xs"
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
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Progress</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Completion Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Progress: {t.completed} / {t.target}</span>
                    <span>{pct}% Completed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-lime-500 rounded-full" style={{ width: `${pct}%` }} />
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
