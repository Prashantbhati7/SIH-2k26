import React, { useState, useEffect } from 'react';
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">Security & operational audit log tracking state-changing actions across roles.</p>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs && logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-slate-900">{l.user?.name || l.userId}</td>
                  <td className="p-3 font-bold text-slate-800">{l.action}</td>
                  <td className="p-3 text-slate-600">{l.entity}</td>
                  <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">{l.metadataJson || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
