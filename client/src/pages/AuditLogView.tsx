import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, User } from 'lucide-react';
import { api } from '../services/api';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
        <History className="w-6 h-6 text-slate-400" />
        <div>
          <h1 className="text-2xl font-black text-slate-100">System Audit Trail</h1>
          <p className="text-xs text-slate-400">Security & operational audit log tracking state-changing actions across roles.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-500/20 border-t-slate-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs && logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-slate-200">{l.user?.name || l.userId}</td>
                  <td className="p-3 text-indigo-400 font-bold">{l.action}</td>
                  <td className="p-3 text-slate-300">{l.entity}</td>
                  <td className="p-3 text-[11px] text-slate-400 max-w-xs truncate">{l.metadataJson || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
