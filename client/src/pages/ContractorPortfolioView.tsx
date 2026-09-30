import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  ChevronRight, 
  Award, 
  FileText, 
  BarChart3, 
  Sliders, 
  Briefcase, 
  Zap, 
  AlertOctagon, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Scale,
  Activity,
  Check,
  RefreshCw,
  HardHat
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { api } from '../services/api';

interface ContractorPortfolioViewProps {
  onSelectProject?: (projectCode: number) => void;
  userRole?: string;
}

export const ContractorPortfolioView: React.FC<ContractorPortfolioViewProps> = ({
  onSelectProject,
  userRole = 'PROJECT_MANAGER'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'DIRECTORY' | 'DOSSIER' | 'SAFETY_ASSESSOR' | 'ALLOCATION_MATRIX'>('DIRECTORY');
  const [contractors, setContractors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedSafetyRating, setSelectedSafetyRating] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected Contractor for Dossier
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  // Projects list for Safety Assessor and Assignment
  const [allProjects, setAllProjects] = useState<any[]>([]);

  // Safety Assessor Simulator State
  const [assessorContractorId, setAssessorContractorId] = useState<string>('');
  const [assessorMode, setAssessorMode] = useState<'EXISTING_PROJECT' | 'CUSTOM_PROJECT'>('EXISTING_PROJECT');
  const [assessorProjectCode, setAssessorProjectCode] = useState<number | string>(40001);
  const [assessorCustomSector, setAssessorCustomSector] = useState<string>('Civil Aviation');
  const [assessorCustomCost, setAssessorCustomCost] = useState<string>('240');
  const [assessorCustomDuration, setAssessorCustomDuration] = useState<string>('24');
  const [assessorComplexity, setAssessorComplexity] = useState<string>('STANDARD');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showAddHistoryModal, setShowAddHistoryModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New Contractor Form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newRegNo, setNewRegNo] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('Roads & Highways, Bridges');
  const [newFinancialCap, setNewFinancialCap] = useState('600');
  const [newMaxConcurrent, setNewMaxConcurrent] = useState('5');
  const [newNotes, setNewNotes] = useState('');

  // New History Record Form
  const [histProjectName, setHistProjectName] = useState('');
  const [histSector, setHistSector] = useState('Roads & Highways');
  const [histState, setHistState] = useState('Uttar Pradesh');
  const [histAgency, setHistAgency] = useState('NHAI');
  const [histContractVal, setHistContractVal] = useState('180');
  const [histFinalCost, setHistFinalCost] = useState('185');
  const [histPlannedDur, setHistPlannedDur] = useState('24');
  const [histActualDur, setHistActualDur] = useState('25');
  const [histYear, setHistYear] = useState('2024');
  const [histQuality, setHistQuality] = useState('EXCELLENT');
  const [histSummary, setHistSummary] = useState('');

  // New Assignment Form
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignPackageTitle, setAssignPackageTitle] = useState('');
  const [assignBudget, setAssignBudget] = useState('150');
  const [assignNotes, setAssignNotes] = useState('');

  useEffect(() => {
    fetchContractors();
    fetchStats();
    fetchProjects();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contractor-portfolio');
      setContractors(res.data.contractors || []);
      if (res.data.contractors && res.data.contractors.length > 0 && !selectedContractorId) {
        setSelectedContractorId(res.data.contractors[0].id);
        setAssessorContractorId(res.data.contractors[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching contractors:', err);
      setError('Failed to load contractor portfolio');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/contractor-portfolio/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?limit=50');
      setAllProjects(res.data.projects || []);
      if (res.data.projects && res.data.projects.length > 0) {
        setAssignProjectId(res.data.projects[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects list:', err);
    }
  };

  const fetchDossier = async (id: string) => {
    try {
      setLoadingDossier(true);
      const res = await api.get(`/contractor-portfolio/${id}`);
      setSelectedContractor(res.data.contractor);
    } catch (err: any) {
      console.error('Error fetching dossier:', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  useEffect(() => {
    if (selectedContractorId) {
      fetchDossier(selectedContractorId);
    }
  }, [selectedContractorId]);

  const handleOpenDossier = (id: string) => {
    setSelectedContractorId(id);
    setActiveSubTab('DOSSIER');
  };

  const handleOpenAssessor = (id: string, pCode?: number) => {
    setAssessorContractorId(id);
    if (pCode) {
      setAssessorProjectCode(pCode);
      setAssessorMode('EXISTING_PROJECT');
    }
    setActiveSubTab('SAFETY_ASSESSOR');
    handleRunSafetyEvaluation(id, pCode);
  };

  const handleRunSafetyEvaluation = async (cId?: string, pCode?: number | string) => {
    const contractorIdToUse = cId || assessorContractorId;
    if (!contractorIdToUse) return;

    try {
      setEvaluating(true);
      setEvaluationResult(null);

      const payload: any = {
        contractorProfileId: contractorIdToUse,
        complexityLevel: assessorComplexity
      };

      if (assessorMode === 'EXISTING_PROJECT') {
        const codeToUse = pCode !== undefined ? pCode : assessorProjectCode;
        payload.projectCode = codeToUse;
      } else {
        payload.customTargetSector = assessorCustomSector;
        payload.customTargetCostCrores = parseFloat(assessorCustomCost) || 200;
        payload.customTargetDurationMonths = parseFloat(assessorCustomDuration) || 24;
      }

      const res = await api.post('/contractor-portfolio/evaluate-safety', payload);
      setEvaluationResult(res.data);
    } catch (err: any) {
      console.error('Error evaluating safety:', err);
      alert(err.response?.data?.error || 'Failed to complete safety evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRegisterContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        companyName: newCompanyName,
        registrationNumber: newRegNo,
        contactPerson: newContactPerson,
        contactEmail: newContactEmail,
        contactPhone: newContactPhone,
        specialization: newSpecialization,
        financialCapacityCrores: parseFloat(newFinancialCap) || 500,
        maxConcurrentProjects: parseInt(newMaxConcurrent, 10) || 5,
        notes: newNotes
      };
      await api.post('/contractor-portfolio', payload);
      setShowRegisterModal(false);
      setActionSuccessMessage(`Successfully registered ${newCompanyName}!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchContractors();
      fetchStats();
      // Reset form
      setNewCompanyName('');
      setNewRegNo('');
      setNewContactPerson('');
      setNewContactEmail('');
      setNewContactPhone('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to register contractor');
    }
  };

  const handleAddHistoricalProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId) return;

    try {
      const payload = {
        projectName: histProjectName,
        sector: histSector,
        state: histState,
        clientAgency: histAgency,
        contractValueCrores: parseFloat(histContractVal) || 100,
        finalCostCrores: parseFloat(histFinalCost) || 100,
        plannedDurationMonths: parseFloat(histPlannedDur) || 12,
        actualDurationMonths: parseFloat(histActualDur) || 12,
        completionYear: parseInt(histYear, 10) || 2024,
        qualityGrade: histQuality,
        performanceSummary: histSummary
      };

      await api.post(`/contractor-portfolio/${selectedContractorId}/historical-projects`, payload);
      setShowAddHistoryModal(false);
      setActionSuccessMessage('Historical project record added & contractor safety metrics recalibrated!');
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchDossier(selectedContractorId);
      fetchContractors();
      fetchStats();
      // Reset form
      setHistProjectName('');
      setHistSummary('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add historical record');
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId || !assignProjectId) return;

    try {
      const payload = {
        contractorProfileId: selectedContractorId,
        projectId: assignProjectId,
        packageTitle: assignPackageTitle || 'General EPC Construction Package',
        allocatedBudgetCrores: parseFloat(assignBudget) || 100,
        notes: assignNotes
      };

      await api.post('/contractor-portfolio/assign-project', payload);
      setShowAssignModal(false);
      setActionSuccessMessage('Project package assigned successfully!');
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchDossier(selectedContractorId);
      fetchContractors();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign project');
    }
  };

  // Helper for Safety Badges
  const renderSafetyBadge = (rating: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : (size === 'lg' ? 'px-3 py-1.5 text-xs font-bold' : 'px-2.5 py-1 text-xs');
    switch (rating) {
      case 'GRADE_A_PLUS':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
            <Award className="w-3.5 h-3.5" /> Grade A+ (Elite Safe)
          </span>
        );
      case 'GRADE_A':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 ${sizeClasses}`}>
            <ShieldCheck className="w-3.5 h-3.5" /> Grade A (Safe)
          </span>
        );
      case 'GRADE_B':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Grade B (Standard)
          </span>
        );
      case 'GRADE_C':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5" /> Grade C (Conditional)
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${sizeClasses}`}>
            <AlertOctagon className="w-3.5 h-3.5" /> High Risk (Caution)
          </span>
        );
      case 'BLACKLISTED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/30 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5" /> Blacklisted / Debarred
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20 ${sizeClasses}`}>
            {rating}
          </span>
        );
    }
  };

  // Filtered Contractors List
  const filteredContractors = contractors.filter(c => {
    if (selectedSafetyRating !== 'ALL' && c.safetyRating !== selectedSafetyRating) return false;
    if (selectedStatus === 'BLACKLISTED' && !c.blacklisted) return false;
    if (selectedStatus === 'ACTIVE' && c.blacklisted) return false;
    if (selectedSector !== 'ALL' && !c.specialization.toLowerCase().includes(selectedSector.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = c.companyName.toLowerCase().includes(q) ||
        c.registrationNumber.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.specialization.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Infrastructure Vendor Intelligence & Safety Matrix</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Contractor Portfolio & Risk Management
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Track vendor history, evaluate past delivery velocity, analyze cost overrun & delay tendencies, and run intelligent safety checks before project award.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => {
              setActiveSubTab('SAFETY_ASSESSOR');
              handleRunSafetyEvaluation();
            }}
            className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-lime-400/20"
          >
            <Sparkles className="w-4 h-4" />
            Run Safety Assessor
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 text-lime-400" />
            Register Contractor
          </button>
        </div>
      </div>

      {/* KPI Statistics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Total Vendors</span>
              <Users2 className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalContractors}
            </div>
            <div className="text-[11px] text-slate-500">Across 6 Sectors</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span>Safe / Grade A</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.safeCount}
            </div>
            <div className="text-[11px] text-emerald-600/80">Approved for Direct Award</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <span>Conditional</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.conditionalCount}
            </div>
            <div className="text-[11px] text-amber-600/80">Requires Extra Audit</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-semibold">
              <span>High Risk / Flagged</span>
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">
              {stats.highRiskCount}
            </div>
            <div className="text-[11px] text-red-600/80">High Delay / Overrun Tendency</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Active Contracts</span>
              <DollarSign className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              ₹{stats.totalActiveAllocatedValueCrores} <span className="text-xs font-medium">Cr</span>
            </div>
            <div className="text-[11px] text-slate-500">{stats.totalActiveAssignments} live packages</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>On-Time Velocity</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgOnTimeRate}%
            </div>
            <div className="text-[11px] text-slate-500">Avg historical delivery</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('DIRECTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DIRECTORY'
              ? 'bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Contractor Directory ({filteredContractors.length})
        </button>

        <button
          onClick={() => {
            if (selectedContractorId) fetchDossier(selectedContractorId);
            setActiveSubTab('DOSSIER');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DOSSIER'
              ? 'bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Vendor Deep-Dive Dossier
        </button>

        <button
          onClick={() => {
            setActiveSubTab('SAFETY_ASSESSOR');
            if (!evaluationResult) handleRunSafetyEvaluation();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'SAFETY_ASSESSOR'
              ? 'bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-lime-400" />
          Project Safety Assessor & Simulator
        </button>

        <button
          onClick={() => setActiveSubTab('ALLOCATION_MATRIX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ALLOCATION_MATRIX'
              ? 'bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Concurrency & Bandwidth Matrix
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTRACTOR DIRECTORY                                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'DIRECTORY' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contractor by company name, registration number, specialization..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedSafetyRating}
                onChange={(e) => setSelectedSafetyRating(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Safety Grades</option>
                <option value="GRADE_A_PLUS">Grade A+ (Elite Safe)</option>
                <option value="GRADE_A">Grade A (Safe)</option>
                <option value="GRADE_B">Grade B (Standard)</option>
                <option value="GRADE_C">Grade C (Conditional)</option>
                <option value="HIGH_RISK">High Risk / Flagged</option>
              </select>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Sectors</option>
                <option value="Civil Aviation">Civil Aviation</option>
                <option value="Road">Roads & Highways</option>
                <option value="Rail">Railways</option>
                <option value="Tunnel">Tunnels & Metro</option>
                <option value="Power">Power & Energy</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContractors.map((contractor) => {
              const activeCount = contractor.assignments?.filter((a: any) => a.status === 'ACTIVE').length || contractor.activeAssignmentsCount || 0;
              const capUtil = contractor.capacityUtilizationPercent || 0;
              const isOver = activeCount >= contractor.maxConcurrentProjects;

              return (
                <div
                  key={contractor.id}
                  className={`bg-white dark:bg-slate-900 border ${
                    contractor.blacklisted
                      ? 'border-red-500/50 bg-red-950/5'
                      : (contractor.safetyRating === 'HIGH_RISK'
                        ? 'border-red-300 dark:border-red-900/50'
                        : 'border-slate-200 dark:border-slate-800')
                  } p-5 rounded-3xl space-y-4 hover:shadow-lg transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                          {contractor.registrationNumber}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          {contractor.companyName}
                        </h3>
                      </div>
                      {renderSafetyBadge(contractor.safetyRating, 'sm')}
                    </div>

                    {/* Specialization */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Domain: </span>
                      {contractor.specialization}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-medium">On-Time Velocity</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {contractor.onTimeCompletionRate}%
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-medium">Historical Delay Avg</div>
                        <div className={`text-sm font-black ${contractor.historicalDelayAvgMonths > 6 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {contractor.historicalDelayAvgMonths} mo
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-medium">Avg Cost Overrun</div>
                        <div className={`text-sm font-black ${contractor.historicalCostOverrunAvg > 15 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          +{contractor.historicalCostOverrunAvg}%
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-medium">Financial Capacity</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{contractor.financialCapacityCrores} Cr
                        </div>
                      </div>
                    </div>

                    {/* Concurrency Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Active Concurrency</span>
                        <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {activeCount} / {contractor.maxConcurrentProjects} projects ({capUtil}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-red-500' : (capUtil >= 75 ? 'bg-amber-500' : 'bg-lime-400')
                          }`}
                          style={{ width: `${Math.min(100, capUtil)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDossier(contractor.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Dossier
                    </button>

                    <button
                      onClick={() => handleOpenAssessor(contractor.id)}
                      className="flex items-center justify-center gap-1.5 bg-lime-400 hover:bg-lime-300 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                      title="Run Safety Evaluation for a target project"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Assess Safety
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VENDOR DEEP-DIVE DOSSIER                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'DOSSIER' && (
        <div className="space-y-6">
          {/* Contractor Selector Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {contractors.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContractorId(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedContractorId === c.id
                    ? 'bg-lime-400 text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <span>{c.companyName}</span>
                {c.safetyRating === 'GRADE_A_PLUS' && <Award className="w-3 h-3 text-emerald-700" />}
                {c.safetyRating === 'HIGH_RISK' && <AlertOctagon className="w-3 h-3 text-red-500" />}
              </button>
            ))}
          </div>

          {loadingDossier ? (
            <div className="p-12 text-center text-slate-400">Loading contractor dossier...</div>
          ) : selectedContractor ? (
            <div className="space-y-6">
              {/* Dossier Header Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{selectedContractor.registrationNumber}</span>
                      {renderSafetyBadge(selectedContractor.safetyRating, 'lg')}
                      {selectedContractor.establishedYear && (
                        <span className="text-xs text-slate-400">Est. {selectedContractor.establishedYear} ({selectedContractor.experienceYears} yrs exp)</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedContractor.companyName}
                    </h2>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      {selectedContractor.specialization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenAssessor(selectedContractor.id)}
                      className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      Run Safety Assessor
                    </button>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700"
                    >
                      <Plus className="w-4 h-4 text-lime-400" />
                      Assign Project Package
                    </button>
                  </div>
                </div>

                {/* Contact & Capacity Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedContractor.contactPerson}</span>
                    <span className="text-[11px] text-slate-500 block">{selectedContractor.contactEmail}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Financial Handling Cap</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{selectedContractor.financialCapacityCrores} Crores</span>
                    <span className="text-[11px] text-slate-500 block">Audited Net Worth Cap</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Active Concurrency</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedContractor.activeAssignmentsCount} / {selectedContractor.maxConcurrentProjects} projects
                    </span>
                    <span className={`text-[11px] block font-semibold ${selectedContractor.isOverloaded ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedContractor.isOverloaded ? 'Overloaded Capacity' : 'Available Bandwidth'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Quality Audit Score</span>
                    <span className="font-bold text-emerald-500 text-sm">
                      {selectedContractor.qualityAuditScore} / 100
                    </span>
                    <span className="text-[11px] text-slate-500 block">Field Inspection Rating</span>
                  </div>
                </div>
              </div>

              {/* SECTION A: Historical Track Record (Past Completed Projects) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      <Award className="w-4 h-4 text-lime-500" />
                      <span>Historical Performance Track Record</span>
                      <span className="text-xs text-slate-400">({selectedContractor.historyRecords?.length || 0} completed works)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Past execution track record, cost overrun history, and delay tendencies across completed contracts.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddHistoryModal(true)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-lime-400" />
                    Add Past Project
                  </button>
                </div>

                {selectedContractor.historyRecords && selectedContractor.historyRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                          <th className="py-3 px-3">Project & Client Agency</th>
                          <th className="py-3 px-3">Sector & State</th>
                          <th className="py-3 px-3">Contract Value</th>
                          <th className="py-3 px-3">Final Cost & Overrun</th>
                          <th className="py-3 px-3">Planned vs Actual</th>
                          <th className="py-3 px-3">Delay (Mo)</th>
                          <th className="py-3 px-3">Quality & Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {selectedContractor.historyRecords.map((h: any) => (
                          <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">{h.projectName}</div>
                              <div className="text-[11px] text-slate-500">Agency: {h.clientAgency} • Completed {h.completionYear}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{h.sector}</span>
                              <div className="text-[11px] text-slate-500">{h.state}</div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                              ₹{h.contractValueCrores} Cr
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-slate-900 dark:text-white">₹{h.finalCostCrores} Cr</div>
                              <span className={`text-[10px] font-bold ${h.costOverrunPercent > 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {h.costOverrunPercent > 0 ? `+${h.costOverrunPercent}% overrun` : 'On Budget'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                              {h.plannedDurationMonths}m planned / {h.actualDurationMonths}m actual
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`font-bold ${h.delayMonths > 3 ? 'text-red-500' : (h.delayMonths > 0 ? 'text-amber-500' : 'text-emerald-500')}`}>
                                {h.delayMonths > 0 ? `+${h.delayMonths} mo` : '0 mo (On time)'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  h.completionStatus === 'COMPLETED_ON_TIME'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : (h.completionStatus === 'TERMINATED'
                                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20')
                                }`}>
                                  {h.completionStatus.replace(/_/g, ' ')}
                                </span>
                              </div>
                              {h.performanceSummary && (
                                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{h.performanceSummary}</p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No historical projects recorded yet. Click &quot;Add Past Project&quot; to log previous track record.
                  </div>
                )}
              </div>

              {/* SECTION B: Live Assigned Projects & Forward Risks */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      <Briefcase className="w-4 h-4 text-lime-500" />
                      <span>Live Assigned Projects & Forward Risk Status</span>
                      <span className="text-xs text-slate-400">({selectedContractor.assignments?.length || 0} active packages)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Real-time monitoring of current infrastructure works with integrated ML risk predictions.
                    </p>
                  </div>
                </div>

                {selectedContractor.assignments && selectedContractor.assignments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContractor.assignments.map((a: any) => {
                      const p = a.project;
                      const pred = p?.predictions?.[0];
                      const snap = p?.snapshots?.[0];

                      return (
                        <div
                          key={a.id}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-lime-600 dark:text-lime-400 font-bold">
                                Project #{p?.projectCode}
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {p?.projectName}
                              </h4>
                              <p className="text-xs text-slate-500">{a.packageTitle}</p>
                            </div>

                            {pred && (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                pred.riskLevel === 'High'
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : (pred.riskLevel === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20')
                              }`}>
                                {pred.riskLevel} Risk ({pred.scorePercentage}%)
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Package Budget</span>
                              <span className="font-bold text-slate-900 dark:text-white">₹{a.allocatedBudgetCrores} Cr</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                              <span className="font-bold text-slate-900 dark:text-white">{snap?.physicalProgress || 0}%</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">Target Deadline</span>
                              <span className="font-bold text-slate-900 dark:text-white">{a.targetCompletionDate}</span>
                            </div>
                          </div>

                          {/* ML Forecasts */}
                          {pred && (
                            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">ML Delay Forecast:</span>
                                <span className="font-bold text-lime-400">{pred.delayPrediction}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">ML Cost Forecast:</span>
                                <span className="font-bold text-lime-400">{pred.costPrediction}</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Assigned on {a.assignedDate}</span>
                            {onSelectProject && p && (
                              <button
                                onClick={() => onSelectProject(p.projectCode)}
                                className="flex items-center gap-1 text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline"
                              >
                                View Digital Profile <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No active packages currently assigned. Click &quot;Assign Project Package&quot; to allocate work.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROJECT SAFETY ASSESSOR & SIMULATOR ("Will it be safe?")           */}
      {/* ========================================================================= */}
      {activeSubTab === 'SAFETY_ASSESSOR' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-lime-500 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Pre-Award Decision Support Engine</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Intelligent Contractor-Project Safety Assessor
              </h2>
              <p className="text-slate-500 text-xs max-w-3xl mt-1">
                Answers the critical question: <strong className="text-slate-700 dark:text-slate-300">&quot;Will it be safe to award this particular project&apos;s package to this contractor?&quot;</strong> Analyzes domain experience, scale fit, capacity headroom, historical delay risk, and cost overrun tendencies.
              </p>
            </div>

            {/* Input Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {/* Step 1: Select Contractor */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Step 1: Select Contractor / Agency
                </label>
                <select
                  value={assessorContractorId}
                  onChange={(e) => setAssessorContractorId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-lime-400"
                >
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.safetyRating.replace(/_/g, ' ')}) - {c.specialization}
                    </option>
                  ))}
                </select>

                {/* Contractor Quick Preview */}
                {assessorContractorId && (
                  (() => {
                    const c = contractors.find(x => x.id === assessorContractorId);
                    if (!c) return null;
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Certified Capacity:</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{c.financialCapacityCrores} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Concurrency:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{c.activeAssignmentsCount || 0} / {c.maxConcurrentProjects} active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Historical Delay Avg:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{c.historicalDelayAvgMonths} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Historical Overrun Avg:</span>
                          <span className="font-bold text-slate-900 dark:text-white">+{c.historicalCostOverrunAvg}%</span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Step 2: Select Target Project / Tender Package */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Step 2: Target Project / Tender Specifications
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAssessorMode('EXISTING_PROJECT')}
                      className={`px-2 py-0.5 rounded font-bold ${assessorMode === 'EXISTING_PROJECT' ? 'bg-lime-400 text-slate-950' : 'text-slate-400'}`}
                    >
                      Existing Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssessorMode('CUSTOM_PROJECT')}
                      className={`px-2 py-0.5 rounded font-bold ${assessorMode === 'CUSTOM_PROJECT' ? 'bg-lime-400 text-slate-950' : 'text-slate-400'}`}
                    >
                      Custom Tender
                    </button>
                  </div>
                </div>

                {assessorMode === 'EXISTING_PROJECT' ? (
                  <select
                    value={assessorProjectCode}
                    onChange={(e) => setAssessorProjectCode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-lime-400"
                  >
                    {allProjects.map(p => (
                      <option key={p.id} value={p.projectCode}>
                        Project #{p.projectCode} - {p.projectName} ({p.sector} - ₹{p.revisedCost || p.originalCost} Cr)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sector</span>
                      <select
                        value={assessorCustomSector}
                        onChange={(e) => setAssessorCustomSector(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="Civil Aviation">Civil Aviation</option>
                        <option value="Road Transport">Roads & Highways</option>
                        <option value="Railways">Railways</option>
                        <option value="Urban Transit">Urban Transit</option>
                        <option value="Power">Power</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Cost (₹ Cr)</span>
                      <input
                        type="number"
                        value={assessorCustomCost}
                        onChange={(e) => setAssessorCustomCost(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration (Mo)</span>
                      <input
                        type="number"
                        value={assessorCustomDuration}
                        onChange={(e) => setAssessorCustomDuration(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => handleRunSafetyEvaluation()}
                    disabled={evaluating}
                    className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-lime-400/20 disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Evaluating Safety Suitability Matrix...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Run Safety & Suitability Evaluation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Evaluation Result Display */}
            {evaluationResult && (
              <div className="space-y-6 pt-2 animate-fade-in">
                {/* Hero Verdict Banner */}
                <div
                  className={`p-6 rounded-3xl border ${
                    evaluationResult.verdict === 'SAFE'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : (evaluationResult.verdict === 'CONDITIONALLY_SAFE'
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200')
                  } space-y-4`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider opacity-80">Safety Clearance Verdict</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-white/10">
                          Score: {evaluationResult.suitabilityScore} / 100
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">
                        {evaluationResult.verdictLabel || evaluationResult.verdict}
                      </h3>
                      <p className="text-xs opacity-90 max-w-2xl">
                        Contractor: <strong className="underline">{evaluationResult.contractor?.companyName}</strong> • Target Project: <strong className="underline">{evaluationResult.targetProject?.projectName}</strong>
                      </p>
                    </div>

                    {/* Circular Score Badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-4 border-current flex flex-col items-center justify-center font-black">
                        <span className="text-2xl">{evaluationResult.suitabilityScore}</span>
                        <span className="text-[9px] uppercase font-bold">Suitability</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Dimensional Breakdown Matrix */}
                {evaluationResult.dimensions && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      5-Dimensional Risk & Competence Factor Scores
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold">1. Sector Experience</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {evaluationResult.dimensions.sectorScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Domain track record</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold">2. Financial Scale Fit</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {evaluationResult.dimensions.financialFitScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Budget vs capacity</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold">3. Workload Headroom</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {evaluationResult.dimensions.capacityScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Concurrency bandwidth</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold">4. Schedule Reliability</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {evaluationResult.dimensions.scheduleScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Past delay tendencies</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-semibold">5. Cost Discipline</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {evaluationResult.dimensions.costDisciplineScore} <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Historical overrun control</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Findings & Actionable Prescriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths & Risk Flags */}
                  <div className="space-y-4">
                    {/* Strengths */}
                    {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs text-emerald-300">
                        <div className="flex items-center gap-2 font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified Strengths & Positive Indicators</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-[11px]">
                          {evaluationResult.strengths.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Flags */}
                    {evaluationResult.riskFactors && evaluationResult.riskFactors.length > 0 && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2 text-xs text-red-300">
                        <div className="flex items-center gap-2 font-bold text-red-400">
                          <AlertOctagon className="w-4 h-4" />
                          <span>Detected Cautions & Risk Drivers</span>
                        </div>
                        <ul className="space-y-1 pl-5 list-disc text-[11px]">
                          {evaluationResult.riskFactors.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Safeguards & Prescriptions */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Actionable Safeguards & Contract Conditions</span>
                    </div>

                    {evaluationResult.recommendations && evaluationResult.recommendations.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {evaluationResult.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                            <span className="w-5 h-5 rounded-full bg-lime-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-slate-200 text-xs leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No special conditions required. Standard EPC terms apply.</p>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedContractorId(assessorContractorId);
                          setShowAssignModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Proceed with Work Order Allocation Under These Safeguards
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONCURRENCY & BANDWIDTH ALLOCATION MATRIX                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'ALLOCATION_MATRIX' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-lime-500 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>National Concurrency & Load Distribution</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Vendor Workload Utilization & Risk Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Overview of all certified vendors, showing active concurrent packages vs capacity ceiling to prevent project overloading.
            </p>
          </div>

          {/* Allocation Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Contractor / Vendor</th>
                  <th className="py-3 px-3">Domain Specialization</th>
                  <th className="py-3 px-3">Safety Grade</th>
                  <th className="py-3 px-3">Financial Cap</th>
                  <th className="py-3 px-3">Active vs Max Capacity</th>
                  <th className="py-3 px-3">Capacity Load %</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {contractors.map((c) => {
                  const active = c.assignments?.filter((a: any) => a.status === 'ACTIVE').length || c.activeAssignmentsCount || 0;
                  const util = c.capacityUtilizationPercent || 0;
                  const isOver = active >= c.maxConcurrentProjects;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{c.companyName}</div>
                        <div className="text-[11px] text-slate-400">{c.registrationNumber}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {c.specialization}
                      </td>
                      <td className="py-3.5 px-3">
                        {renderSafetyBadge(c.safetyRating, 'sm')}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                        ₹{c.financialCapacityCrores} Cr
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {active} / {c.maxConcurrentProjects} projects
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOver ? 'bg-red-500' : (util >= 75 ? 'bg-amber-500' : 'bg-lime-400')
                              }`}
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold ${isOver ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {util}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleOpenAssessor(c.id)}
                          className="flex items-center gap-1 text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline"
                        >
                          Assess Safety <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW CONTRACTOR                                          */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <Building2 className="w-5 h-5 text-lime-500" />
                <span>Register New Infrastructure Contractor</span>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterContractor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Navayuga Engineering Corp"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Registration / GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value)}
                    placeholder="e.g. IND-NAV-2015-A"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="e.g. tenders@navayuga.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Specialization & Domain Areas *</label>
                <input
                  type="text"
                  required
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g. Roads & Highways, Bridges, Tunnels, Rail Infrastructure"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Financial Capacity (₹ Crores)</label>
                  <input
                    type="number"
                    value={newFinancialCap}
                    onChange={(e) => setNewFinancialCap(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Max Concurrent Project Slots</label>
                  <input
                    type="number"
                    value={newMaxConcurrent}
                    onChange={(e) => setNewMaxConcurrent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Audit & Background Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. ISO 9001 certified, audited balance sheet verified"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-lime-400/20"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD HISTORICAL PROJECT RECORD                                    */}
      {/* ========================================================================= */}
      {showAddHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <Award className="w-5 h-5 text-lime-500" />
                <span>Add Historical Completed Project</span>
              </div>
              <button onClick={() => setShowAddHistoryModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHistoricalProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Project Name *</label>
                <input
                  type="text"
                  required
                  value={histProjectName}
                  onChange={(e) => setHistProjectName(e.target.value)}
                  placeholder="e.g. Kanpur Ring Road Package 3"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sector *</label>
                  <select
                    value={histSector}
                    onChange={(e) => setHistSector(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Roads & Highways">Roads & Highways</option>
                    <option value="Civil Aviation">Civil Aviation</option>
                    <option value="Railways">Railways</option>
                    <option value="Urban Transit">Urban Transit</option>
                    <option value="Power">Power</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Client Agency *</label>
                  <input
                    type="text"
                    required
                    value={histAgency}
                    onChange={(e) => setHistAgency(e.target.value)}
                    placeholder="NHAI / AAI / MoRTH"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Completion Year</label>
                  <input
                    type="number"
                    value={histYear}
                    onChange={(e) => setHistYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Contract Value (₹ Cr) *</label>
                  <input
                    type="number"
                    required
                    value={histContractVal}
                    onChange={(e) => setHistContractVal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Final Completed Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    required
                    value={histFinalCost}
                    onChange={(e) => setHistFinalCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Planned Duration (Months)</label>
                  <input
                    type="number"
                    value={histPlannedDur}
                    onChange={(e) => setHistPlannedDur(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Actual Duration (Months)</label>
                  <input
                    type="number"
                    value={histActualDur}
                    onChange={(e) => setHistActualDur(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Performance Summary & Audit Remarks</label>
                <textarea
                  rows={2}
                  value={histSummary}
                  onChange={(e) => setHistSummary(e.target.value)}
                  placeholder="e.g. Delivered high quality bituminous pavement ahead of target deadline"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  Save Historical Record & Recalibrate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN PROJECT PACKAGE                                           */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <Plus className="w-5 h-5 text-lime-500" />
                <span>Assign Project Package to Contractor</span>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Project *</label>
                <select
                  required
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      Project #{p.projectCode} - {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Package Title *</label>
                <input
                  type="text"
                  required
                  value={assignPackageTitle}
                  onChange={(e) => setAssignPackageTitle(e.target.value)}
                  placeholder="e.g. Civil Superstructure & Terminal MEP Package A"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Allocated Budget (₹ Crores) *</label>
                <input
                  type="number"
                  required
                  value={assignBudget}
                  onChange={(e) => setAssignBudget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assignment Safeguards / Terms</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Bi-weekly field milestone verification required before stage payment release"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorPortfolioView;
