import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  LayoutDashboard, 
  Sliders, 
  CheckSquare, 
  Sparkles, 
  ArrowRight,
  Shield,
  HardHat,
  UserCheck,
  FileText,
  History
} from 'lucide-react';

interface FeatureLauncherHomeProps {
  user: any;
  setActiveTab: (tab: string) => void;
  onSelectProject: (pCode: number) => void;
  onOpenAssistant: () => void;
}

export const FeatureLauncherHome: React.FC<FeatureLauncherHomeProps> = ({
  user,
  setActiveTab,
  onSelectProject,
  onOpenAssistant
}) => {
  // Determine time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const roleCode = user?.roleCode || 'MINISTER_POLICYMAKER';
  const isMinister = roleCode === 'MINISTER_POLICYMAKER';
  const isManager = roleCode === 'PROJECT_MANAGER';
  const isField = roleCode === 'FIELD_OFFICER';
  const isContractor = roleCode === 'CONTRACTOR';

  const userName = user?.name || user?.roleDisplayName || 'User';
  const roleTitle = user?.roleDisplayName || 'Policymaker';

  // Role-Specific Feature Card Configuration
  const getRoleCards = () => {
    if (isContractor) {
      return [
        {
          id: 'projects',
          title: 'Contracted Projects',
          description: 'View contracted infrastructure projects & specifications',
          icon: Building2,
          onClick: () => {
            onSelectProject(40001);
            setActiveTab('project_profile');
          },
          accentBg: 'bg-slate-900',
          accentText: 'text-lime-400'
        },
        {
          id: 'execution_tasks',
          title: 'Execution Tasks',
          description: 'Update milestone progress, work items & delay filings',
          icon: HardHat,
          onClick: () => setActiveTab('dashboard'),
          accentBg: 'bg-slate-900',
          accentText: 'text-amber-400'
        },
        {
          id: 'actions',
          title: 'Actions & Deliverables',
          description: 'Resolve assigned work items & submit contractor updates',
          icon: CheckSquare,
          onClick: () => setActiveTab('interventions'),
          accentBg: 'bg-slate-900',
          accentText: 'text-emerald-400'
        },
        {
          id: 'ask_vikas',
          title: 'Ask Vikas',
          description: 'Ask questions about project specifications & requirements',
          icon: Sparkles,
          onClick: () => onOpenAssistant(),
          accentBg: 'bg-slate-900',
          accentText: 'text-lime-400'
        },
        {
          id: 'reports',
          title: 'Contractor Reports',
          description: 'View milestone completion and progress reports',
          icon: FileText,
          onClick: () => setActiveTab('reports'),
          accentBg: 'bg-slate-900',
          accentText: 'text-sky-400'
        },
        {
          id: 'audit_trail',
          title: 'Audit Trail',
          description: 'Review milestone update logs & submission history',
          icon: History,
          onClick: () => setActiveTab('audit_trail'),
          accentBg: 'bg-slate-900',
          accentText: 'text-indigo-400'
        }
      ];
    }

    if (isField) {
      return [
        {
          id: 'projects',
          title: 'Field Projects',
          description: 'View assigned ground inspection projects & locations',
          icon: Building2,
          onClick: () => {
            onSelectProject(40001);
            setActiveTab('project_profile');
          },
          accentBg: 'bg-slate-900',
          accentText: 'text-lime-400'
        },
        {
          id: 'ground_verification',
          title: 'Ground Verification',
          description: 'Inspect physical evidence, site photos & verification feed',
          icon: UserCheck,
          onClick: () => setActiveTab('dashboard'),
          accentBg: 'bg-slate-900',
          accentText: 'text-sky-400'
        },
        {
          id: 'risks',
          title: 'Site Warnings',
          description: 'View local project risk alerts & field warnings',
          icon: AlertTriangle,
          onClick: () => setActiveTab('warnings'),
          accentBg: 'bg-slate-900',
          accentText: 'text-amber-400'
        },
        {
          id: 'actions',
          title: 'Field Actions',
          description: 'Submit inspection findings & verify contractor progress',
          icon: CheckSquare,
          onClick: () => setActiveTab('interventions'),
          accentBg: 'bg-slate-900',
          accentText: 'text-emerald-400'
        },
        {
          id: 'ask_vikas',
          title: 'Ask Vikas',
          description: 'Ask questions about ground verification & project specs',
          icon: Sparkles,
          onClick: () => onOpenAssistant(),
          accentBg: 'bg-slate-900',
          accentText: 'text-lime-400'
        },
        {
          id: 'reports',
          title: 'Inspection Reports',
          description: 'Access field inspection summary reports & logs',
          icon: FileText,
          onClick: () => setActiveTab('reports'),
          accentBg: 'bg-slate-900',
          accentText: 'text-indigo-400'
        }
      ];
    }

    // Default for Ministers & Project Managers (Policy & Oversight Roles)
    return [
      {
        id: 'all_projects',
        title: 'All Projects Directory',
        description: 'Browse, search & filter all 1,709+ national infrastructure projects',
        icon: Building2,
        onClick: () => setActiveTab('projects_list'),
        accentBg: 'bg-slate-900',
        accentText: 'text-lime-400'
      },
      {
        id: 'projects',
        title: 'Project Detail',
        description: 'View digital profile & snapshot metrics for selected project',
        icon: Building2,
        onClick: () => {
          onSelectProject(40001);
          setActiveTab('project_profile');
        },
        accentBg: 'bg-slate-900',
        accentText: 'text-indigo-400'
      },
      {
        id: 'risks',
        title: 'Risks',
        description: 'Find projects that need attention',
        icon: AlertTriangle,
        onClick: () => setActiveTab('warnings'),
        accentBg: 'bg-slate-900',
        accentText: 'text-amber-400'
      },
      {
        id: 'portfolio',
        title: 'Portfolio',
        description: 'Understand overall project health',
        icon: LayoutDashboard,
        onClick: () => setActiveTab('dashboard'),
        accentBg: 'bg-slate-900',
        accentText: 'text-sky-400'
      },
      {
        id: 'what_if',
        title: 'What-If',
        description: 'Explore the impact of decisions & budget scenarios',
        icon: Sliders,
        onClick: () => setActiveTab('what_if'),
        accentBg: 'bg-slate-900',
        accentText: 'text-indigo-400'
      },
      {
        id: 'actions',
        title: 'Actions',
        description: 'See what needs to be done & track interventions',
        icon: CheckSquare,
        onClick: () => setActiveTab('interventions'),
        accentBg: 'bg-slate-900',
        accentText: 'text-emerald-400'
      },
      {
        id: 'ask_vikas',
        title: 'Ask Vikas',
        description: 'Ask questions about infrastructure projects',
        icon: Sparkles,
        onClick: () => onOpenAssistant(),
        accentBg: 'bg-slate-900',
        accentText: 'text-lime-400'
      }
    ];
  };

  const cards = getRoleCards();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 p-6 sm:p-10 flex flex-col justify-between selection:bg-lime-300">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Top Greeting & User Profile Context Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>National Infrastructure Intelligence • MoSPI Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-600">
              What would you like to do today?
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-lime-400 font-bold text-lg flex items-center justify-center shadow-xs">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Authenticated Role</div>
              <div className="text-sm font-bold text-slate-900">{roleTitle}</div>
              <div className="text-xs text-slate-500">{user?.email || 'Active Session'}</div>
            </div>
          </div>
        </div>

        {/* 3x2 Clean Grid Launcher */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Select a module ({roleTitle} Role)
            </h2>
            <span className="text-xs text-slate-500 font-medium">6 Permitted Services</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={card.onClick}
                  className="bg-white border border-slate-200/90 hover:border-slate-900 rounded-3xl p-8 text-left transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between h-64 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${card.accentBg} flex items-center justify-center shadow-sm group-hover:bg-lime-400 transition-colors duration-200`}>
                      <Icon className={`w-7 h-7 ${card.accentText} group-hover:text-slate-950 transition-colors duration-200`} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-slate-950">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    <span>Open {card.title}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="max-w-6xl mx-auto w-full pt-10 text-center text-xs text-slate-400 font-medium">
        VikasDrishti Project Intelligence System • Unified Infrastructure Monitoring
      </div>
    </div>
  );
};
