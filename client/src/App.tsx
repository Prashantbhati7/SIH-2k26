import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PolicymakerDashboard } from './pages/Dashboards/PolicymakerDashboard';
import { ManagerDashboard } from './pages/Dashboards/ManagerDashboard';
import { FieldDashboard } from './pages/Dashboards/FieldDashboard';
import { ContractorDashboard } from './pages/Dashboards/ContractorDashboard';
import { ProjectDigitalProfile } from './pages/ProjectDigitalProfile';
import { EarlyWarningCenter } from './pages/EarlyWarningCenter';
import { InterventionCenter } from './pages/InterventionCenter';
import { RiskMap } from './pages/RiskMap';
import { BenchmarkingView } from './pages/BenchmarkingView';
import { DataUploadView } from './pages/DataUploadView';
import { ModelLab } from './pages/ModelLab';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ReportsView } from './pages/ReportsView';
import { AuditLogView } from './pages/AuditLogView';
import { api } from './services/api';

export function App() {
  const [viewState, setViewState] = useState<'landing' | 'login' | 'platform'>('landing');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectCode, setSelectedProjectCode] = useState<number>(40001);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [loginPresetEmail, setLoginPresetEmail] = useState<string>('');

  useEffect(() => {
    // Check stored user & token
    const storedUser = localStorage.getItem('vikasdrishti_user');
    const token = localStorage.getItem('vikasdrishti_token');
    if (storedUser && token) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setViewState('platform');
      } catch (e) {
        localStorage.removeItem('vikasdrishti_user');
        localStorage.removeItem('vikasdrishti_token');
      }
    }
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    setViewState('platform');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vikasdrishti_user');
    localStorage.removeItem('vikasdrishti_token');
    setUser(null);
    setViewState('landing');
  };

  const handleQuickLoginFromLanding = (email: string) => {
    setLoginPresetEmail(email);
    setViewState('login');
  };

  const handleSelectProject = (pCode: number) => {
    setSelectedProjectCode(pCode);
    setActiveTab('project_profile');
  };

  // Render Page Content based on Active Role & Tab
  const renderActiveView = () => {
    const roleCode = user?.roleCode || 'MINISTER_POLICYMAKER';

    switch (activeTab) {
      case 'dashboard':
        if (roleCode === 'MINISTER_POLICYMAKER') {
          return <PolicymakerDashboard onSelectProject={handleSelectProject} onOpenAssistant={() => setIsAssistantOpen(true)} />;
        } else if (roleCode === 'PROJECT_MANAGER') {
          return <ManagerDashboard onSelectProject={handleSelectProject} onOpenAssistant={() => setIsAssistantOpen(true)} />;
        } else if (roleCode === 'FIELD_OFFICER') {
          return <FieldDashboard onSelectProject={handleSelectProject} />;
        } else if (roleCode === 'CONTRACTOR') {
          return <ContractorDashboard onSelectProject={handleSelectProject} />;
        }
        return <PolicymakerDashboard onSelectProject={handleSelectProject} onOpenAssistant={() => setIsAssistantOpen(true)} />;

      case 'project_profile':
        return (
          <ProjectDigitalProfile
            projectCode={selectedProjectCode}
            userRole={roleCode}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        );

      case 'warnings':
        return <EarlyWarningCenter onSelectProject={handleSelectProject} />;

      case 'interventions':
        return <InterventionCenter onSelectProject={handleSelectProject} />;

      case 'risk_map':
        return <RiskMap onSelectProject={handleSelectProject} />;

      case 'benchmarking':
        return <BenchmarkingView projectCode={selectedProjectCode} onSelectProject={handleSelectProject} />;

      case 'data_upload':
        return <DataUploadView />;

      case 'model_lab':
        return <ModelLab />;

      case 'reports':
        return <ReportsView />;

      case 'audit_trail':
        return <AuditLogView />;

      default:
        return <PolicymakerDashboard onSelectProject={handleSelectProject} onOpenAssistant={() => setIsAssistantOpen(true)} />;
    }
  };

  if (viewState === 'landing') {
    return <LandingPage onEnterPlatform={() => setViewState('login')} onQuickLogin={handleQuickLoginFromLanding} />;
  }

  if (viewState === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} presetEmail={loginPresetEmail} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        activeRole={user?.roleDisplayName || 'Role View'}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user?.roleCode || 'MINISTER_POLICYMAKER'}
          onSelectProject={handleSelectProject}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 pb-16">
          {renderActiveView()}
        </main>
      </div>

      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectProject={handleSelectProject}
      />
    </div>
  );
}

export default App;
