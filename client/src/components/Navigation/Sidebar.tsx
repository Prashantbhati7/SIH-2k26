import React from 'react';
import { 
  Home,
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
  ChevronRight,
  Sparkles,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onSelectProject: (pCode: number) => void;
  onOpenAssistant?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onSelectProject,
  onOpenAssistant,
  isCollapsed,
  setIsCollapsed
}) => {
  const isMinister = userRole === 'MINISTER_POLICYMAKER';
  const isManager = userRole === 'PROJECT_MANAGER';
  const isField = userRole === 'FIELD_OFFICER';
  const isContractor = userRole === 'CONTRACTOR';

  const getItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    if (isCollapsed) {
      if (isActive) {
        return 'w-full flex items-center justify-center p-2.5 rounded-xl font-bold bg-lime-400 text-slate-950 shadow-xs transition-all';
      }
      return 'w-full flex items-center justify-center p-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all';
    }

    if (isActive) {
      return 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-lime-400 text-slate-950 shadow-xs transition-all';
    }
    return 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all';
  };

  const getRoleDisplayName = () => {
    if (isMinister) return 'Minister';
    if (isManager) return 'Manager';
    if (isField) return 'Field Officer';
    if (isContractor) return 'Contractor';
    return 'User';
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative z-30`}
    >
      <div className="p-3 space-y-5 overflow-y-auto">
        {/* Toggle & Role Summary Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            {!isCollapsed && (
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Navigation Menu
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto md:mx-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-lime-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-400 hover:text-white" />
              )}
            </button>
          </div>

          {/* Role Context Summary */}
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Viewing Role
                </span>
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
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
          ) : (
            <div
              className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col items-center justify-center p-1 cursor-pointer"
              title={`Role: ${getRoleDisplayName()}`}
              onClick={() => setIsCollapsed(false)}
            >
              <Shield className="w-4 h-4 text-lime-400" />
              <span className="text-[9px] font-bold text-white tracking-tight truncate max-w-full">
                {getRoleDisplayName().slice(0, 4)}
              </span>
            </div>
          )}
        </div>

        {/* Section 1: MAIN */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Main
            </div>
          ) : (
            <div className="h-px bg-slate-800 my-2" />
          )}

          <button
            onClick={() => setActiveTab('home')}
            className={getItemClass('home')}
            title={isCollapsed ? "Home" : undefined}
          >
            <div className="flex items-center space-x-3">
              <Home className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Home</span>}
            </div>
            {!isCollapsed && activeTab === 'home' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setActiveTab('project_profile');
              onSelectProject(40001);
            }}
            className={getItemClass('project_profile')}
            title={isCollapsed ? "Projects" : undefined}
          >
            <div className="flex items-center space-x-3">
              <FolderKanban className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Projects</span>}
            </div>
            {!isCollapsed && activeTab === 'project_profile' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Risks tab (Ministers, Managers, Field Officers) */}
          {!isContractor && (
            <button
              onClick={() => setActiveTab('warnings')}
              className={getItemClass('warnings')}
              title={isCollapsed ? "Risks" : undefined}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span>Risks</span>}
              </div>
              {!isCollapsed && activeTab === 'warnings' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Portfolio tab (Ministers and Project Managers only) */}
          {(isMinister || isManager) && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={getItemClass('dashboard')}
              title={isCollapsed ? "Portfolio" : undefined}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Portfolio</span>}
              </div>
              {!isCollapsed && activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* What-If Simulator (Ministers and Project Managers only - NOT Contractors/Field Officers) */}
          {(isMinister || isManager) && (
            <button
              onClick={() => setActiveTab('what_if')}
              className={getItemClass('what_if')}
              title={isCollapsed ? "What-If Simulator" : undefined}
            >
              <div className="flex items-center space-x-3">
                <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
                {!isCollapsed && <span>What-If</span>}
              </div>
              {!isCollapsed && activeTab === 'what_if' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Actions / Interventions */}
          <button
            onClick={() => setActiveTab('interventions')}
            className={getItemClass('interventions')}
            title={isCollapsed ? "Actions" : undefined}
          >
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span>Actions</span>}
            </div>
            {!isCollapsed && activeTab === 'interventions' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Ask Vikas */}
          <button
            onClick={() => onOpenAssistant?.()}
            className={
              isCollapsed
                ? 'w-full flex items-center justify-center p-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all'
                : 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all'
            }
            title={isCollapsed ? "Ask Vikas" : undefined}
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
              {!isCollapsed && <span>Ask Vikas</span>}
            </div>
          </button>

          {/* Role specific view tabs */}
          {isField && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={getItemClass('dashboard')}
              title={isCollapsed ? "Ground Verification" : undefined}
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 shrink-0 text-sky-400" />
                {!isCollapsed && <span>Ground Verification</span>}
              </div>
            </button>
          )}

          {isContractor && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={getItemClass('dashboard')}
              title={isCollapsed ? "Execution Tasks" : undefined}
            >
              <div className="flex items-center space-x-3">
                <HardHat className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>Execution Tasks</span>}
              </div>
            </button>
          )}
        </div>

        {/* Section 2: Data & Governance */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Data & Governance
            </div>
          ) : (
            <div className="h-px bg-slate-800 my-2" />
          )}

          {(isMinister || isManager) && (
            <button
              onClick={() => setActiveTab('data_upload')}
              className={getItemClass('data_upload')}
              title={isCollapsed ? "Data Upload" : undefined}
            >
              <div className="flex items-center space-x-3">
                <UploadCloud className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Data</span>}
              </div>
              {!isCollapsed && activeTab === 'data_upload' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => setActiveTab('reports')}
            className={getItemClass('reports')}
            title={isCollapsed ? "Reports" : undefined}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Reports</span>}
            </div>
            {!isCollapsed && activeTab === 'reports' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={getItemClass('audit_trail')}
            title={isCollapsed ? "Audit Trail" : undefined}
          >
            <div className="flex items-center space-x-3">
              <History className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Audit Trail</span>}
            </div>
            {!isCollapsed && activeTab === 'audit_trail' && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Section 3: System / Admin (Policy / Oversight Roles Only) */}
        {(isMinister || isManager) && (
          <div className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                System / Admin
              </div>
            ) : (
              <div className="h-px bg-slate-800 my-2" />
            )}

            <button
              onClick={() => setActiveTab('risk_map')}
              className={getItemClass('risk_map')}
              title={isCollapsed ? "India Risk Map" : undefined}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>India Risk Map</span>}
              </div>
              {!isCollapsed && activeTab === 'risk_map' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setActiveTab('benchmarking')}
              className={getItemClass('benchmarking')}
              title={isCollapsed ? "Sector Benchmarking" : undefined}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Sector Benchmarking</span>}
              </div>
              {!isCollapsed && activeTab === 'benchmarking' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setActiveTab('model_lab')}
              className={getItemClass('model_lab')}
              title={isCollapsed ? "Model Intelligence Lab" : undefined}
            >
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Model Intelligence Lab</span>}
              </div>
              {!isCollapsed && activeTab === 'model_lab' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setActiveTab('enrichment')}
              className={getItemClass('enrichment')}
              title={isCollapsed ? "Enrichment Center" : undefined}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                {!isCollapsed && <span>Enrichment Center</span>}
              </div>
              {!isCollapsed && activeTab === 'enrichment' && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span>XGBoost + SHAP Engine</span>
              <span className="text-[10px] font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                Active
              </span>
            </div>
            <p className="text-[10px]">1,709 Monitored Infrastructure Projects</p>
          </>
        ) : (
          <div className="text-center font-bold text-lime-400 text-[10px]" title="XGBoost Engine Active">
            XGB
          </div>
        )}
      </div>
    </aside>
  );
};
