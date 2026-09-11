import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  CheckSquare, 
  MapPin, 
  BarChart3, 
  UploadCloud, 
  Cpu, 
  FileText, 
  History,
  Sparkles,
  UserCheck,
  HardHat,
  Compass,
  ArrowRightLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onSelectProject: (pCode: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onSelectProject
}) => {
  const isMinister = userRole === 'MINISTER_POLICYMAKER';
  const isManager = userRole === 'PROJECT_MANAGER';
  const isField = userRole === 'FIELD_OFFICER';
  const isContractor = userRole === 'CONTRACTOR';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Active Role Indicator Card */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Active Role View
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-100">
              {isMinister && 'Minister / Policymaker'}
              {isManager && 'Project Manager / Ministry'}
              {isField && 'Field Inspection Officer'}
              {isContractor && 'Contractor / Implementer'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isMinister && 'Portfolio Intelligence → Prioritize Intervention'}
            {isManager && 'Project Monitoring → Assign & Escalate'}
            {isField && 'Ground Verification → Track Progress'}
            {isContractor && 'Execution Intelligence → Update Tasks'}
          </p>
        </div>

        {/* Main Navigation Sections */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Intelligence Command
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Role Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('project_profile');
              onSelectProject(40001);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'project_profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-purple-400" />
            <span>Core Digital Profile</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              Slice
            </span>
          </button>

          {(isMinister || isManager) && (
            <>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'warnings'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Early Warning Center</span>
              </button>

              <button
                onClick={() => setActiveTab('interventions')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'interventions'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Intervention Center</span>
              </button>

              <button
                onClick={() => setActiveTab('risk_map')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'risk_map'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-red-400" />
                <span>India Risk Map</span>
              </button>

              <button
                onClick={() => setActiveTab('benchmarking')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'benchmarking'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Sector Benchmarking</span>
              </button>
            </>
          )}

          {isField && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-800/60 text-slate-300"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Ground Verification</span>
            </button>
          )}

          {isContractor && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-800/60 text-slate-300"
            >
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Execution Progress</span>
            </button>
          )}
        </div>

        {/* Analytics & Lab Section */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Data & AI Transparency
          </div>

          <button
            onClick={() => setActiveTab('model_lab')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'model_lab'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Model Intelligence Lab</span>
          </button>

          {(isMinister || isManager) && (
            <button
              onClick={() => setActiveTab('data_upload')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'data_upload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-teal-400" />
              <span>Monthly Data Upload</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Intelligence Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audit_trail'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span>XGBoost + SHAP</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Active
          </span>
        </div>
        <p className="text-[10px]">Dataset: 18,363 rows | 1,709 Projects</p>
      </div>
    </aside>
  );
};
