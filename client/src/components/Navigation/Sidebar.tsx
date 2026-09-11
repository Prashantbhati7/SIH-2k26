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
  UserCheck,
  HardHat,
  ChevronRight
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

  const getItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    if (isActive) {
      return 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-lime-400 text-slate-950 shadow-sm transition-all';
    }
    return 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Role Context Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Viewing Role
            </span>
            <span className="w-2 h-2 rounded-full bg-lime-400" />
          </div>
          <div className="text-xs font-bold text-white">
            {isMinister && 'Minister / Policymaker'}
            {isManager && 'Project Manager / Ministry'}
            {isField && 'Field Inspection Officer'}
            {isContractor && 'Contractor / Implementer'}
          </div>
          <div className="text-[11px] text-slate-400">
            {isMinister && 'National Portfolio Risk Overview'}
            {isManager && 'Project Monitoring & Interventions'}
            {isField && 'Ground Verification Feed'}
            {isContractor && 'Milestone & Task Execution'}
          </div>
        </div>

        {/* Section 1: Portfolio Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Project Navigation
          </div>

          <button onClick={() => setActiveTab('dashboard')} className={getItemClass('dashboard')}>
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Portfolio Overview</span>
            </div>
            {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setActiveTab('project_profile');
              onSelectProject(40001);
            }}
            className={getItemClass('project_profile')}
          >
            <div className="flex items-center space-x-3">
              <FolderKanban className="w-4 h-4" />
              <span>Project Profile</span>
            </div>
            {activeTab === 'project_profile' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {(isMinister || isManager) && (
            <>
              <button onClick={() => setActiveTab('warnings')} className={getItemClass('warnings')}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Early Warning Center</span>
                </div>
                {activeTab === 'warnings' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <button onClick={() => setActiveTab('interventions')} className={getItemClass('interventions')}>
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-4 h-4" />
                  <span>Interventions</span>
                </div>
                {activeTab === 'interventions' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <button onClick={() => setActiveTab('risk_map')} className={getItemClass('risk_map')}>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <span>India Risk Map</span>
                </div>
                {activeTab === 'risk_map' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <button onClick={() => setActiveTab('benchmarking')} className={getItemClass('benchmarking')}>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Sector Benchmarking</span>
                </div>
                {activeTab === 'benchmarking' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {isField && (
            <button onClick={() => setActiveTab('dashboard')} className={getItemClass('dashboard')}>
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4" />
                <span>Ground Verification</span>
              </div>
            </button>
          )}

          {isContractor && (
            <button onClick={() => setActiveTab('dashboard')} className={getItemClass('dashboard')}>
              <div className="flex items-center space-x-3">
                <HardHat className="w-4 h-4" />
                <span>Execution Tasks</span>
              </div>
            </button>
          )}
        </div>

        {/* Section 2: Data & Governance */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Data & Governance
          </div>

          <button onClick={() => setActiveTab('model_lab')} className={getItemClass('model_lab')}>
            <div className="flex items-center space-x-3">
              <Cpu className="w-4 h-4" />
              <span>Model Intelligence Lab</span>
            </div>
            {activeTab === 'model_lab' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {(isMinister || isManager) && (
            <button onClick={() => setActiveTab('data_upload')} className={getItemClass('data_upload')}>
              <div className="flex items-center space-x-3">
                <UploadCloud className="w-4 h-4" />
                <span>Monthly Data Upload</span>
              </div>
              {activeTab === 'data_upload' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          <button onClick={() => setActiveTab('reports')} className={getItemClass('reports')}>
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4" />
              <span>Portfolio Reports</span>
            </div>
            {activeTab === 'reports' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button onClick={() => setActiveTab('audit_trail')} className={getItemClass('audit_trail')}>
            <div className="flex items-center space-x-3">
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </div>
            {activeTab === 'audit_trail' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span>XGBoost + SHAP Engine</span>
          <span className="text-[10px] font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
            Active
          </span>
        </div>
        <p className="text-[10px]">1,709 Monitored Infrastructure Projects</p>
      </div>
    </aside>
  );
};
