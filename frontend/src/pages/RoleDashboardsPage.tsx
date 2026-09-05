import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Landmark,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sliders,
  TrendingUp,
  MapPin,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  Receipt,
  FileText,
  Plus,
  Lock,
  Eye,
  Send,
  Camera,
  Search,
  Scale,
  X,
  History,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  HelpCircle,
  Shield,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import {
  NationalDashboard,
  StateDashboard,
  DistrictDashboard,
  MpDashboard,
  RiskWeightsConfig,
  AlertItem,
  Work,
  Recommendation,
  CorrectionRequest,
  AuditInvestigationCase,
  CitizenReport,
  StatutoryAuditLog
} from '../api/types';
import { useRole, UserRole } from '../context/RoleContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

// Defensive Error Boundary to ensure the dashboard NEVER crashes to a blank screen
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Role Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-12 p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm space-y-4 font-sans">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h2 className="text-xl font-bold font-serif">Governance Console Recovery Interface</h2>
              <p className="text-xs text-rose-700">An unexpected rendering state was intercepted. Critical system data remains secure.</p>
            </div>
          </div>
          <p className="text-xs font-mono bg-white/70 p-3 rounded-xl border border-rose-200 text-rose-800 break-words">
            {this.state.error?.message || 'Unknown dashboard computation error'}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
              }}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Interface</span>
            </button>
            <Link
              to="/works"
              className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 transition"
            >
              Return to Public Works
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const POPULAR_STATES = [
  'MAHARASHTRA',
  'UTTAR PRADESH',
  'KARNATAKA',
  'GUJARAT',
  'TAMIL NADU',
  'BIHAR',
  'WEST BENGAL',
  'RAJASTHAN',
  'MADHYA PRADESH',
  'KERALA',
  'DELHI'
];

const POPULAR_DISTRICTS: Record<string, string[]> = {
  MAHARASHTRA: ['PUNE', 'MUMBAI', 'THANE', 'NAGPUR', 'NASHIK', 'AURANGABAD', 'SOLAPUR'],
  'UTTAR PRADESH': ['VARANASI', 'LUCKNOW', 'KANPUR', 'AGRA', 'PRAYAGRAJ', 'GORAKHPUR'],
  KARNATAKA: ['BANGALORE', 'MYSURU', 'BELAGAVI', 'HUBBALLI', 'MANGALORE'],
  GUJARAT: ['AHMEDABAD', 'SURAT', 'VADODARA', 'RAJKOT', 'GANDHINAGAR'],
  'TAMIL NADU': ['CHENNAI', 'COIMBATORE', 'MADURAI', 'TIRUCHIRAPPALLI', 'SALEM']
};

export const RoleDashboardsPageContent: React.FC = () => {
  const {
    currentRole,
    setRole,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    selectedMpId,
    setSelectedMpId,
    viewingState,
    setViewingState,
    viewingDistrict,
    setViewingDistrict,
    user,
    isAuthenticated
  } = useRole();

  // Active dashboard tab (Supports all 6 statutory stakeholder tiers)
  type DashboardTab = 'MINISTRY' | 'STATE' | 'DISTRICT' | 'MP' | 'AUDITOR' | 'CITIZEN';

  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (user?.role === 'STATE_NODAL_AUTHORITY') return 'STATE';
    if (user?.role === 'DISTRICT_AUTHORITY') return 'DISTRICT';
    if (user?.role === 'MP') return 'MP';
    if (user?.role === 'AUDITOR') return 'AUDITOR';
    if (user?.role === 'MINISTRY_ADMIN' || user?.role === 'MINISTRY_OFFICIAL') return 'MINISTRY';
    return 'CITIZEN';
  });

  // Data states
  const [nationalData, setNationalData] = useState<NationalDashboard | null>(null);
  const [stateData, setStateData] = useState<StateDashboard | null>(null);
  const [districtData, setDistrictData] = useState<DistrictDashboard | null>(null);
  const [mpData, setMpData] = useState<MpDashboard | null>(null);

  // Operational Governance Data
  const [auditLogs, setAuditLogs] = useState<StatutoryAuditLog[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);
  const [investigationCases, setInvestigationCases] = useState<AuditInvestigationCase[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [districtWorksList, setDistrictWorksList] = useState<Work[]>([]);
  const [citizenWorksList, setCitizenWorksList] = useState<Work[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Risk weights configuration state (MoSPI)
  const [weights, setWeights] = useState<RiskWeightsConfig['weights']>({
    financial_anomaly_weight: 0.3,
    physical_delay_weight: 0.25,
    vendor_risk_weight: 0.25,
    statistical_anomaly_weight: 0.2
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsSavedMsg, setWeightsSavedMsg] = useState<string | null>(null);

  // National priority alerts
  const [nationalAlerts, setNationalAlerts] = useState<AlertItem[]>([]);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  // Modals state
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false);
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [newRecForm, setNewRecForm] = useState({
    title: '',
    category: 'Drinking Water',
    estimated_cost: 1500000,
    district: 'PUNE',
    location_description: '',
    block: '',
    gram_panchayat: '',
    justification: '',
    priority: 'HIGH'
  });

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedWorkForMilestone, setSelectedWorkForMilestone] = useState<Work | null>(null);
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    physical_progress_pct: 50,
    contractor_velocity_score: 85,
    geo_latitude: 18.5204,
    geo_longitude: 73.8567,
    inspection_notes: '',
    is_completed: false
  });

  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    entity_type: 'WORK',
    entity_id: '',
    field_name: 'sanctioned_amount',
    previous_value: '',
    proposed_value: '',
    reason: ''
  });

  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState(false);
  const [auditorSubmitting, setAuditorSubmitting] = useState(false);
  const [auditorForm, setAuditorForm] = useState({
    title: '',
    entity_type: 'WORK',
    entity_id: '',
    severity: 'HIGH',
    hypothesis: '',
    evidence: '',
    auditor_notes: ''
  });

  const [isCitizenReportModalOpen, setIsCitizenReportModalOpen] = useState(false);
  const [citizenSubmitting, setCitizenSubmitting] = useState(false);
  const [citizenReportSuccess, setCitizenReportSuccess] = useState<string | null>(null);
  const [citizenForm, setCitizenForm] = useState({
    work_id: '',
    discrepancy_category: 'GHOST_WORK',
    description: '',
    reported_location: 'Pune District',
    photo_url: '',
    citizen_name: '',
    citizen_contact: ''
  });

  // Sync active tab if user identity changes
  useEffect(() => {
    if (user?.role === 'STATE_NODAL_AUTHORITY') setActiveTab('STATE');
    else if (user?.role === 'DISTRICT_AUTHORITY') setActiveTab('DISTRICT');
    else if (user?.role === 'MP') setActiveTab('MP');
    else if (user?.role === 'AUDITOR') setActiveTab('AUDITOR');
    else if (user?.role === 'MINISTRY_ADMIN' || user?.role === 'MINISTRY_OFFICIAL') setActiveTab('MINISTRY');
  }, [user]);

  // Load National Data
  const loadNational = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nData, wConfig, aData, logs, corrs] = await Promise.all([
        api.getNationalDashboard(),
        api.getRiskWeights().catch(() => null),
        api.getAlerts({ limit: 5 }).catch(() => ({ items: [] })),
        api.getAuditLogs(30).catch(() => []),
        api.listCorrectionRequests().catch(() => [])
      ]);
      setNationalData(nData);
      if (aData && aData.items) setNationalAlerts(aData.items);
      if (wConfig && wConfig.weights) setWeights(wConfig.weights);
      setAuditLogs(logs || []);
      setCorrectionRequests(corrs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load National MoSPI dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load State Data
  const loadState = async (stateName: string) => {
    try {
      setLoading(true);
      setError(null);
      const [res, recs] = await Promise.all([
        api.getStateDashboard(stateName),
        api.listRecommendations().catch(() => [])
      ]);
      setStateData(res);
      setRecommendations(recs || []);
    } catch (err: any) {
      setError(err.message || `Failed to load dashboard for state: ${stateName}`);
    } finally {
      setLoading(false);
    }
  };

  // Load District Data
  const loadDistrict = async (districtName: string, stateName: string) => {
    try {
      setLoading(true);
      setError(null);
      const [res, works] = await Promise.all([
        api.getDistrictDashboard(districtName, stateName),
        api.getWorks({ state: stateName, constituency: districtName, limit: 15 }).catch(() => ({ items: [] }))
      ]);
      setDistrictData(res);
      setDistrictWorksList(works.items || []);
    } catch (err: any) {
      setError(err.message || `Failed to load dashboard for district: ${districtName}`);
    } finally {
      setLoading(false);
    }
  };

  // Load MP Data
  const loadMp = async (mpId: string) => {
    try {
      setLoading(true);
      setError(null);
      const [res, recs] = await Promise.all([
        api.getMpDashboard(mpId),
        api.listRecommendations().catch(() => [])
      ]);
      setMpData(res);
      setRecommendations(recs || []);
    } catch (err: any) {
      setError(err.message || `Failed to load dashboard for MP: ${mpId}`);
    } finally {
      setLoading(false);
    }
  };

  // Load Auditor Data
  const loadAuditor = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cases, logs] = await Promise.all([
        api.listAuditInvestigations().catch(() => []),
        api.getAuditLogs(30).catch(() => [])
      ]);
      setInvestigationCases(cases || []);
      setAuditLogs(logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load forensic auditor intelligence');
    } finally {
      setLoading(false);
    }
  };

  // Load Citizen Data
  const loadCitizen = async () => {
    try {
      setLoading(true);
      setError(null);
      const [worksRes, reportsRes] = await Promise.all([
        api.getWorks({ state: selectedState, limit: 12 }).catch(() => ({ items: [] })),
        api.listCitizenReports().catch(() => [])
      ]);
      setCitizenWorksList(worksRes.items || []);
      setCitizenReports(reportsRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load open citizen portal data');
    } finally {
      setLoading(false);
    }
  };

  // Tab change trigger
  useEffect(() => {
    if (activeTab === 'MINISTRY') loadNational();
    else if (activeTab === 'STATE') loadState(selectedState);
    else if (activeTab === 'DISTRICT') loadDistrict(selectedDistrict, selectedState);
    else if (activeTab === 'MP') loadMp(selectedMpId);
    else if (activeTab === 'AUDITOR') loadAuditor();
    else if (activeTab === 'CITIZEN') loadCitizen();
  }, [activeTab, selectedState, selectedDistrict, selectedMpId]);

  // Handle weight update (MoSPI)
  const handleSaveWeights = async () => {
    try {
      setSavingWeights(true);
      setWeightsSavedMsg(null);
      await api.updateRiskWeights(weights);
      setWeightsSavedMsg('Weights saved & composite risk engine recalibrated.');
      setTimeout(() => setWeightsSavedMsg(null), 4000);
      loadNational();
    } catch (err: any) {
      alert(err.message || 'Failed to update risk weights');
    } finally {
      setSavingWeights(false);
    }
  };

  // Alert quick resolve
  const handleQuickResolveAlert = async (alertId: string) => {
    try {
      setResolvingAlertId(alertId);
      await api.updateAlert(alertId, {
        status: 'RESOLVED',
        reviewer_comment: 'Resolved from Statutory Governance Console after official inspection.'
      });
      if (activeTab === 'DISTRICT') loadDistrict(selectedDistrict, selectedState);
      else if (activeTab === 'STATE') loadState(selectedState);
      else if (activeTab === 'MINISTRY') loadNational();
      else if (activeTab === 'MP') loadMp(selectedMpId);
    } catch (err) {
      alert('Failed to update alert status');
    } finally {
      setResolvingAlertId(null);
    }
  };

  // MP: Create new recommendation (DRAFT)
  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecSubmitting(true);
      await api.createRecommendation({
        ...newRecForm,
        state: selectedState,
        constituency: selectedDistrict
      });
      setIsNewRecModalOpen(false);
      setNewRecForm({
        title: '',
        category: 'Drinking Water',
        estimated_cost: 1500000,
        district: selectedDistrict,
        location_description: '',
        block: '',
        gram_panchayat: '',
        justification: '',
        priority: 'HIGH'
      });
      if (activeTab === 'MP') loadMp(selectedMpId);
    } catch (err: any) {
      alert(err.message || 'Failed to submit recommendation');
    } finally {
      setRecSubmitting(false);
    }
  };

  // MP: Submit recommendation to District Authority (Locks editing)
  const handleSubmitDraftRecommendation = async (recId: string) => {
    if (!confirm('Statutory Lock Notice: Formally submitting this recommendation to District Authority will lock the proposal from further edits. Proceed?')) {
      return;
    }
    try {
      await api.submitRecommendation(recId);
      alert('Recommendation submitted to District Authority. Status updated to SUBMITTED.');
      if (activeTab === 'MP') loadMp(selectedMpId);
      else if (activeTab === 'STATE') loadState(selectedState);
    } catch (err: any) {
      alert(err.message || 'Failed to advance workflow');
    }
  };

  // District Authority: Milestone Execution Update
  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkForMilestone) return;
    try {
      setMilestoneSubmitting(true);
      await api.updateWorkExecution(selectedWorkForMilestone.work_id, {
        physical_progress_pct: Number(milestoneForm.physical_progress_pct),
        contractor_velocity_score: Number(milestoneForm.contractor_velocity_score),
        geo_latitude: Number(milestoneForm.geo_latitude),
        geo_longitude: Number(milestoneForm.geo_longitude),
        inspection_notes: milestoneForm.inspection_notes,
        is_completed: milestoneForm.is_completed
      });
      setIsMilestoneModalOpen(false);
      setSelectedWorkForMilestone(null);
      alert('Ground milestone progress updated and permanently recorded in statutory audit trail.');
      loadDistrict(selectedDistrict, selectedState);
    } catch (err: any) {
      alert(err.message || 'Failed to update work execution');
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  // District Authority: Submit Financial Correction Request
  const handleCreateCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCorrectionSubmitting(true);
      await api.createCorrectionRequest(correctionForm);
      setIsCorrectionModalOpen(false);
      alert('Formal Financial Correction Request logged. Submitted to Ministry for sign-off. Historical voucher remains sealed until authorized.');
      setCorrectionForm({
        entity_type: 'WORK',
        entity_id: '',
        field_name: 'sanctioned_amount',
        previous_value: '',
        proposed_value: '',
        reason: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction request');
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  // Ministry: Review Correction Request (APPROVE / REJECT)
  const handleReviewCorrection = async (corrId: string, action: 'APPROVE' | 'REJECT') => {
    const comments = prompt(`Enter administrative rationale for ${action}:`);
    if (comments === null) return;
    try {
      await api.reviewCorrectionRequest(corrId, action, comments || undefined);
      alert(`Correction request ${action}D. Audit trail updated.`);
      loadNational();
    } catch (err: any) {
      alert(err.message || 'Failed to review correction request');
    }
  };

  // Auditor: Create Forensic Investigation Dossier
  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuditorSubmitting(true);
      await api.createAuditInvestigation({
        ...auditorForm,
        jurisdiction: selectedState
      });
      setIsAuditorModalOpen(false);
      setAuditorForm({
        title: '',
        entity_type: 'WORK',
        entity_id: '',
        severity: 'HIGH',
        hypothesis: '',
        evidence: '',
        auditor_notes: ''
      });
      alert('Forensic Investigation Dossier registered. Added to active audit docket.');
      loadAuditor();
    } catch (err: any) {
      alert(err.message || 'Failed to register investigation');
    } finally {
      setAuditorSubmitting(false);
    }
  };

  // Citizen: Submit Ground Discrepancy Report
  const handleSubmitCitizenReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCitizenSubmitting(true);
      setCitizenReportSuccess(null);
      const res = await api.submitCitizenReport({
        ...citizenForm,
        state: selectedState,
        district: selectedDistrict,
        constituency: selectedDistrict
      });
      setCitizenReportSuccess(`Discrepancy report recorded successfully. Tracking Docket ID: #${res.report_id || 'CR-2026'}. Official inspection assigned to District Implementing Authority.`);
      setCitizenForm({
        work_id: '',
        discrepancy_category: 'GHOST_WORK',
        description: '',
        reported_location: `${selectedDistrict}, ${selectedState}`,
        photo_url: '',
        citizen_name: '',
        citizen_contact: ''
      });
      setTimeout(() => {
        setIsCitizenReportModalOpen(false);
        setCitizenReportSuccess(null);
        loadCitizen();
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit citizen report');
    } finally {
      setCitizenSubmitting(false);
    }
  };

  const currentDistricts = POPULAR_DISTRICTS[selectedState] || ['PUNE', 'MUMBAI', 'THANE', 'NAGPUR'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Intelligence Center', to: '/anomalies' },
          { label: 'Statutory Role Consoles & Governance Dashboards' },
        ]}
      />

      {/* ==================================================================== */}
      {/* STATUTORY AUTHORITY & JURISDICTION BANNER */}
      {/* ==================================================================== */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E4E2DC] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cw-badge-section">
                SIX STATUTORY TIERS (RBAC + ABAC)
              </span>
              {isAuthenticated && user ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Authenticated: {user.role} ({user.jurisdiction || 'National'})</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#C85A32]" />
                  <span>Statutory Public Access Mode (Zero-Barrier Transparency)</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316] tracking-tight">
              Statutory Governance &amp; Operational Consoles
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl leading-relaxed">
              Hierarchical role-based consoles enforcing statutory territorial jurisdiction, milestone verification, immutable financial ledgers, and open civic transparency under Section 4(1)(b) of the RTI Act.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Authority Sign-In</span>
              </Link>
            ) : (
              <div className="text-right text-xs">
                <span className="text-[10px] font-mono text-[#71717A] block">Logged In As</span>
                <span className="font-semibold text-[#121316]">{user?.display_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 6 Statutory Tiers Navigation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            {
              id: 'MINISTRY',
              roleKey: 'MINISTRY_ADMIN' as UserRole,
              title: 'Ministry / MoSPI',
              level: 'Level 1: National',
              icon: Landmark,
              color: 'text-[#C85A32]',
              bg: 'bg-[#FAF0EB]'
            },
            {
              id: 'STATE',
              roleKey: 'STATE_NODAL_AUTHORITY' as UserRole,
              title: 'State Nodal (SNA)',
              level: 'Level 2: State',
              icon: Layers,
              color: 'text-[#121316]',
              bg: 'bg-[#F0EFEA]'
            },
            {
              id: 'DISTRICT',
              roleKey: 'DISTRICT_AUTHORITY' as UserRole,
              title: 'District DM / IDA',
              level: 'Level 3: Execution',
              icon: Building2,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50'
            },
            {
              id: 'MP',
              roleKey: 'MP' as UserRole,
              title: 'Member of Parliament',
              level: 'Level 4: Quota',
              icon: Users,
              color: 'text-amber-800',
              bg: 'bg-amber-50'
            },
            {
              id: 'AUDITOR',
              roleKey: 'AUDITOR' as UserRole,
              title: 'Integrity Auditor',
              level: 'Level 5: Forensic',
              icon: Scale,
              color: 'text-purple-800',
              bg: 'bg-purple-50'
            },
            {
              id: 'CITIZEN',
              roleKey: 'CITIZEN' as UserRole,
              title: 'Citizen Social Audit',
              level: 'Level 6: Open Public',
              icon: Shield,
              color: 'text-blue-800',
              bg: 'bg-blue-50'
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setRole(tab.roleKey);
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#C85A32] bg-[#FAF0EB] shadow-xs'
                    : 'border-[#E4E2DC] bg-[#FAF8F5] hover:bg-[#F0EFEA]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${tab.bg} ${tab.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#121316] leading-tight">
                    {tab.title}
                  </h4>
                  <p className="text-[10px] text-[#71717A] font-mono mt-0.5">
                    {tab.level}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Administrative Drill-Down Scope Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span className="text-[#4A4D53] font-medium">Administrative Drill-Down Scope:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const firstD = POPULAR_DISTRICTS[e.target.value]?.[0] || 'PUNE';
                setSelectedDistrict(firstD);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DC] text-xs font-bold text-[#121316] focus:ring-1 focus:ring-[#C85A32] cursor-pointer"
            >
              {POPULAR_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DC] text-xs font-bold text-[#121316] focus:ring-1 focus:ring-[#C85A32] cursor-pointer"
            >
              {currentDistricts.map((dst) => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>

            <span className="text-[10px] text-[#71717A] font-mono hidden md:inline">
              (Viewing without privilege escalation)
            </span>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E4E2DC] shadow-xs space-y-3">
          <RefreshCw className="w-7 h-7 text-[#C85A32] animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#71717A]">Verifying Authority Records &amp; Synchronizing Scope...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 1: MINISTRY / MoSPI ADMINISTRATOR (NATIONAL LEVEL) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'MINISTRY' && nationalData && (
        <div className="space-y-6">
          {/* Macro KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">Total Works</span>
              <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                {nationalData.kpis.total_projects.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#71717A]">All India Coverage</span>
            </div>

            <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">Total Sanctioned</span>
              <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                ₹{(nationalData.kpis.total_sanctioned_amount / 10000000).toFixed(1)} Cr
              </div>
              <span className="text-[11px] text-[#71717A]">Approved allocations</span>
            </div>

            <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">Total Disbursed</span>
              <div className="text-2xl font-black text-emerald-800 mt-1 font-serif">
                ₹{(nationalData.kpis.total_expenditure / 10000000).toFixed(1)} Cr
              </div>
              <span className="text-[11px] text-emerald-700">Treasury outflow</span>
            </div>

            <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">Utilization Rate</span>
              <div className="text-2xl font-black text-blue-800 mt-1 font-serif">
                {nationalData.kpis.national_utilization_pct}%
              </div>
              <span className="text-[11px] text-blue-700">Exp / Sanction</span>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-rose-800 uppercase block">High-Risk Projects</span>
              <div className="text-2xl font-black text-rose-800 mt-1 font-serif">
                {nationalData.kpis.high_risk_projects}
              </div>
              <span className="text-[11px] text-rose-700">Risk score &gt; 70</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
              <span className="text-[10px] font-mono text-amber-800 uppercase block">Active Alerts</span>
              <div className="text-2xl font-black text-amber-800 mt-1 font-serif">
                {nationalData.kpis.total_alerts}
              </div>
              <span className="text-[11px] text-amber-700">Requiring action</span>
            </div>
          </div>

          {/* Configurable Risk Engine Weights Panel (MoSPI Exclusive Control) */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#121316]">
                    MoSPI Configurable Risk Scoring Weights
                  </h3>
                  <p className="text-xs text-[#71717A] font-light">
                    Adjust the relative contribution of each analytical vector in the 0–100 composite risk formula.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {weightsSavedMsg && (
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {weightsSavedMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveWeights}
                  disabled={savingWeights}
                  className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingWeights ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save &amp; Recalculate</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#121316]">Financial Mismatch</span>
                  <span className="font-mono font-bold text-[#C85A32]">
                    {(weights?.financial_anomaly_weight ?? 0.3).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights?.financial_anomaly_weight ?? 0.3}
                  onChange={(e) => setWeights({ ...weights, financial_anomaly_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
                <p className="text-[10px] text-[#71717A] font-light">
                  Weight for cost overruns &amp; progress divergence
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#121316]">Schedule Delay</span>
                  <span className="font-mono font-bold text-[#C85A32]">
                    {(weights?.physical_delay_weight ?? 0.25).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights?.physical_delay_weight ?? 0.25}
                  onChange={(e) => setWeights({ ...weights, physical_delay_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
                <p className="text-[10px] text-[#71717A] font-light">
                  Weight for timeline lag vs statutory windows
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#121316]">Vendor Concentration</span>
                  <span className="font-mono font-bold text-[#C85A32]">
                    {(weights?.vendor_risk_weight ?? 0.25).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights?.vendor_risk_weight ?? 0.25}
                  onChange={(e) => setWeights({ ...weights, vendor_risk_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
                <p className="text-[10px] text-[#71717A] font-light">
                  Weight for contractor concentration &amp; repeat awards
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#121316]">Statistical Outliers</span>
                  <span className="font-mono font-bold text-[#C85A32]">
                    {(weights?.statistical_anomaly_weight ?? 0.2).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights?.statistical_anomaly_weight ?? 0.2}
                  onChange={(e) => setWeights({ ...weights, statistical_anomaly_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
                <p className="text-[10px] text-[#71717A] font-light">
                  Weight for IsolationForest &amp; IQR Z-scores
                </p>
              </div>
            </div>
          </div>

          {/* Pending Financial Correction Requests (Statutory Governance) */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-bold text-[#121316]">
                  District Financial Correction Requests ({correctionRequests.filter(c => c.status === 'PENDING').length} Pending)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#71717A]">Ledger Immutability Gate</span>
            </div>

            {correctionRequests.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-2">
                No active correction requests submitted. All historical voucher ledgers remain strictly sealed.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase">
                      <th className="p-2">Target Work</th>
                      <th className="p-2">Field</th>
                      <th className="p-2">Current</th>
                      <th className="p-2">Proposed</th>
                      <th className="p-2">Authority Rationale</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DC]">
                    {correctionRequests.map((corr) => (
                      <tr key={corr.correction_id} className="hover:bg-[#FAF8F5]">
                        <td className="p-2 font-mono font-bold text-[#121316]">#{corr.entity_id}</td>
                        <td className="p-2 font-mono text-[#71717A]">{corr.field_name}</td>
                        <td className="p-2 font-mono text-rose-700">{corr.previous_value}</td>
                        <td className="p-2 font-mono text-emerald-700 font-bold">{corr.proposed_value}</td>
                        <td className="p-2 text-[#4A4D53] max-w-xs truncate" title={corr.reason}>{corr.reason}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            corr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' :
                            corr.status === 'REJECTED' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {corr.status}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {corr.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleReviewCorrection(corr.correction_id, 'APPROVE')}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewCorrection(corr.correction_id, 'REJECT')}
                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-[#71717A]">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Immutable Statutory Audit Trail Table */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-bold text-[#121316]">
                  Tamper-Evident Statutory Audit Trail ({auditLogs.length} Recent Entries)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Append-Only Ledger Active
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase sticky top-0 bg-white">
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">User / Role</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Entity</th>
                    <th className="p-2">Audit Rationale</th>
                    <th className="p-2">Jurisdiction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]">
                  {auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.log_id} className="hover:bg-[#FAF8F5]">
                      <td className="p-2 font-mono text-[10px] text-[#71717A]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-2 font-bold text-[#121316]">
                        {log.user_id} <span className="text-[10px] font-mono font-normal text-[#71717A]">({log.role})</span>
                      </td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[#4A4D53]">
                        {log.entity_type} #{log.entity_id}
                      </td>
                      <td className="p-2 text-[#71717A] max-w-xs truncate" title={log.reason || 'Statutory update'}>
                        {log.reason || 'Operational update'}
                      </td>
                      <td className="p-2 font-mono text-[10px] text-[#71717A]">
                        {log.jurisdiction || 'National'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 2: STATE NODAL AUTHORITY (STATE LEVEL) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'STATE' && (
        <div className="space-y-6">
          {stateData && (
            <>
              {/* State Overview KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">State Total Works</span>
                  <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                    {stateData.summary.total_works}
                  </div>
                  <span className="text-[11px] text-[#71717A]">Across {selectedState}</span>
                </div>

                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">Allocated Amount</span>
                  <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                    ₹{(stateData.summary.allocated_amount / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[11px] text-[#71717A]">State quota allocation</span>
                </div>

                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">Total Expenditure</span>
                  <div className="text-2xl font-black text-emerald-800 mt-1 font-serif">
                    ₹{(stateData.summary.total_expenditure / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[11px] text-emerald-700">Disbursed on ground</span>
                </div>

                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">Utilization Rate</span>
                  <div className="text-2xl font-black text-[#C85A32] mt-1 font-serif">
                    {stateData.summary.utilization_pct}%
                  </div>
                  <span className="text-[11px] text-[#C85A32]">Execution efficiency</span>
                </div>
              </div>

              {/* Inter-District Performance Ranking Table */}
              <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C85A32]" />
                    <h3 className="text-sm font-bold text-[#121316]">
                      Inter-District Performance Ranking ({selectedState})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#71717A]">Ranked by Project Velocity</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase">
                        <th className="p-2.5">District</th>
                        <th className="p-2.5 text-center">Total Works</th>
                        <th className="p-2.5 text-center">Completed</th>
                        <th className="p-2.5 text-right">Expenditure (₹)</th>
                        <th className="p-2.5 text-right">Utilization</th>
                        <th className="p-2.5 text-center">Inspect Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E2DC]">
                      {stateData.districts.map((d, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5] transition">
                          <td className="p-2.5 font-bold text-[#121316]">{d.district}</td>
                          <td className="p-2.5 text-center font-mono">{d.recommended_works_count}</td>
                          <td className="p-2.5 text-center font-mono text-emerald-700 font-bold">
                            {d.completed_works_count}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            ₹{(d.total_expenditure / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#FAF0EB] text-[#C85A32]">
                              {d.utilization_pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDistrict(d.district);
                                setActiveTab('DISTRICT');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#F0EFEA] hover:bg-[#FAF0EB] text-[#C85A32] font-bold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Inspect District</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 3: DISTRICT IMPLEMENTING AUTHORITY / DM (EXECUTION LEVEL) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'DISTRICT' && (
        <div className="space-y-6">
          {districtData && (
            <>
              {/* District Overview & Statutory 45-Day Sanction Clock */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">District Works</span>
                  <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                    {districtData.total_works}
                  </div>
                  <span className="text-[11px] text-[#71717A]">{districtData.district} Jurisdiction</span>
                </div>

                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">Allocated Quota</span>
                  <div className="text-2xl font-black text-[#121316] mt-1 font-serif">
                    ₹{(districtData.mp_info.allocated_amount / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[11px] text-[#71717A]">MPLADS quota release</span>
                </div>

                <div className="rounded-xl border border-[#E4E2DC] bg-white p-4 shadow-2xs">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">Total Expenditure</span>
                  <div className="text-2xl font-black text-emerald-800 mt-1 font-serif">
                    ₹{(districtData.mp_info.total_expenditure / 10000000).toFixed(2)} Cr
                  </div>
                  <span className="text-[11px] text-emerald-700">Disbursed to contractors</span>
                </div>

                {/* 45-Day Statutory Sanction Clock */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-800 uppercase font-bold">45-Day Sanction SLA</span>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-900 mt-1 font-serif">
                    18 Days Left
                  </div>
                  <span className="text-[11px] text-amber-700">Statutory MPLADS Para 3.12 clock</span>
                </div>
              </div>

              {/* District Active Works with Milestone & Execution Actions */}
              <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-bold text-[#121316]">
                      District Execution Management ({districtWorksList.length} Active Schemes)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCorrectionModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs font-semibold text-[#121316] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Request Financial Correction</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase">
                        <th className="p-2.5">Work Title</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Sanctioned (₹)</th>
                        <th className="p-2.5">Physical Progress</th>
                        <th className="p-2.5 text-center">Operational Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E2DC]">
                      {districtWorksList.map((dw) => {
                        const workTitle = dw.title || dw.work_description_normalized || 'Untitled Work';
                        const workCat = dw.category || dw.category_normalized || 'General';
                        const sanctionedAmount = dw.sanctioned_amount ?? 0;
                        const progressPct = dw.physical_progress_pct ?? 40;

                        return (
                          <tr key={dw.work_id} className="hover:bg-[#FAF8F5] transition">
                            <td className="p-2.5 font-bold text-[#121316] max-w-xs truncate" title={workTitle}>
                              {workTitle}
                              <span className="block text-[10px] font-mono text-[#71717A]">#{dw.work_id}</span>
                            </td>
                            <td className="p-2.5 text-[#71717A]">{workCat}</td>
                            <td className="p-2.5 font-mono">
                              ₹{(sanctionedAmount / 100000).toFixed(2)}L
                            </td>
                            <td className="p-2.5">
                              <div className="w-28 space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span>{progressPct}%</span>
                                  <span className={progressPct === 100 ? 'text-emerald-700 font-bold' : 'text-[#71717A]'}>
                                    {progressPct === 100 ? 'Verified' : 'In-Progress'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-600 rounded-full"
                                    style={{ width: `${Math.min(100, progressPct)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedWorkForMilestone(dw);
                                  setMilestoneForm({
                                    physical_progress_pct: progressPct,
                                    contractor_velocity_score: 85,
                                    geo_latitude: 18.5204,
                                    geo_longitude: 73.8567,
                                    inspection_notes: '',
                                    is_completed: progressPct === 100
                                  });
                                  setIsMilestoneModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition cursor-pointer inline-flex items-center gap-1 text-[11px]"
                              >
                                <span>Update Milestone</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 4: MEMBER OF PARLIAMENT (MP CONSTITUENCY LEVEL) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'MP' && mpData && (
        <div className="space-y-6">
          {/* MP Profile & Statutory ₹5 Cr Quota Tracker */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E2DC] pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Parliamentary Entitlement &amp; Quota Tracker
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#121316] font-serif">
                  {mpData.mp_profile.mp_name}
                </h2>
                <p className="text-xs text-[#71717A]">
                  {mpData.mp_profile.constituency} ({mpData.mp_profile.state}) | {mpData.mp_profile.house}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-right">
                  <span className="text-[10px] font-mono text-amber-800 uppercase block">Statutory Annual Quota</span>
                  <span className="text-xl font-black text-amber-900 font-serif">₹{mpData.mp_profile.statutory_annual_quota_cr}.00 Cr</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRecModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Recommend New Scheme</span>
                </button>
              </div>
            </div>

            {/* Quota Execution Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase">Allocated / Entitlement</span>
                <div className="text-xl font-black text-[#121316] mt-1 font-serif">
                  ₹{(mpData.mp_profile.allocated_amount / 10000000).toFixed(2)} Cr
                </div>
                <span className="text-[11px] text-[#71717A]">Approved by MoSPI</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase">Actual Expenditure</span>
                <div className="text-xl font-black text-emerald-800 mt-1 font-serif">
                  ₹{(mpData.mp_profile.total_expenditure / 10000000).toFixed(2)} Cr
                </div>
                <span className="text-[11px] text-emerald-700">Disbursed on ground</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase">Unspent Balance</span>
                <div className="text-xl font-black text-amber-800 mt-1 font-serif">
                  ₹{(mpData.mp_profile.unspent_balance / 10000000).toFixed(2)} Cr
                </div>
                <span className="text-[11px] text-amber-700">Available for recommendation</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase">Quota Utilization</span>
                <div className="text-xl font-black text-blue-800 mt-1 font-serif">
                  {mpData.mp_profile.utilization_pct}%
                </div>
                <span className="text-[11px] text-blue-700">Execution rate</span>
              </div>
            </div>
          </div>

          {/* MP Recommendations Ledger (With Statutory State Machine Lock) */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-bold text-[#121316]">
                  MP Work Recommendations Docket ({recommendations.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                State Machine: Once submitted, proposals are locked from MP edits
              </span>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-3">
                No draft recommendations in this session. Click &ldquo;Recommend New Scheme&rdquo; to initiate a proposal.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase">
                      <th className="p-2.5">Proposal Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Estimated Cost</th>
                      <th className="p-2.5">Workflow Status</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DC]">
                    {recommendations.map((rec) => {
                      const recTitle = rec.title || rec.proposed_title || 'Untitled Recommendation';
                      const recCat = rec.category || rec.sector || 'General';

                      return (
                        <tr key={rec.recommendation_id} className="hover:bg-[#FAF8F5] transition">
                          <td className="p-2.5 font-bold text-[#121316]">
                            {recTitle}
                            <span className="block text-[10px] font-mono text-[#71717A]">#{rec.recommendation_id}</span>
                          </td>
                          <td className="p-2.5 text-[#71717A]">{recCat}</td>
                          <td className="p-2.5 font-mono">
                            ₹{((rec.estimated_cost ?? 0) / 100000).toFixed(2)}L
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              rec.workflow_status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                              rec.workflow_status === 'SUBMITTED' ? 'bg-amber-50 text-amber-800' :
                              rec.workflow_status === 'SANCTIONED' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
                            }`}>
                              {rec.workflow_status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            {rec.workflow_status === 'DRAFT' ? (
                              <button
                                type="button"
                                onClick={() => handleSubmitDraftRecommendation(rec.recommendation_id)}
                                className="px-2.5 py-1 rounded bg-[#C85A32] hover:bg-[#B54C26] text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Send className="w-3 h-3" />
                                <span>Submit to DM</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-[#71717A] flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3 text-amber-600" />
                                <span>Locked for Review</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 5: PUBLIC FINANCE INTEGRITY AUDITOR (FORENSIC LEVEL) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'AUDITOR' && (
        <div className="space-y-6">
          {/* Statutory Forensic Mandate Alert */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs flex items-start gap-3">
            <Scale className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-serif text-sm">Independent Public Finance Forensic Mandate</strong>
              <p className="leading-relaxed">
                Under the Statutory Governance Charter, forensic auditors have read-only discovery access across all voucher records, vendor accounts, and physical progress metrics. Direct tampering or deletion of source treasury accounts is legally prohibited. Detected irregularities must be registered as formal <strong>Forensic Investigation Cases</strong>.
              </p>
            </div>
          </div>

          {/* Forensic Investigation Case Controls */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-[#121316]">
                  Active Forensic Investigation Cases ({investigationCases.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAuditorModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Forensic Case</span>
              </button>
            </div>

            {investigationCases.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-3">
                No open forensic cases. Click &ldquo;Open Forensic Case&rdquo; to formulate an empirical audit hypothesis.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E2DC] text-[10px] font-mono text-[#71717A] uppercase">
                      <th className="p-2.5">Case ID</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Assigned Auditor</th>
                      <th className="p-2.5">Jurisdiction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E2DC]">
                    {investigationCases.map((c) => (
                      <tr key={c.case_id} className="hover:bg-[#FAF8F5] transition">
                        <td className="p-2.5 font-mono font-bold text-purple-900">#{c.case_id}</td>
                        <td className="p-2.5 font-bold text-[#121316]">
                          {c.title}
                          <p className="text-[10px] font-light text-[#71717A] max-w-sm truncate">{c.hypothesis}</p>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            c.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-800' :
                            c.severity === 'HIGH' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                          }`}>
                            {c.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] font-bold text-[#4A4D53]">
                          {c.status}
                        </td>
                        <td className="p-2.5 font-mono text-[#71717A]">{c.assigned_auditor || 'Demo Auditor'}</td>
                        <td className="p-2.5 font-mono text-[#71717A]">{c.jurisdiction || 'National'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TIER 6: CITIZEN / SOCIAL AUDIT (PUBLIC LEVEL - NO LOGIN REQUIRED) */}
      {/* ==================================================================== */}
      {!loading && activeTab === 'CITIZEN' && (
        <div className="space-y-6">
          {/* Public Social Audit Banner */}
          <div className="p-6 rounded-2xl bg-linear-to-r from-[#FAF0EB] to-white border border-[#E8C5B6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-widest block">
                  Democracy &amp; Social Audit Transparency
                </span>
                <h2 className="text-xl font-bold font-serif text-[#121316]">
                  Open Public Infrastructure Inspectorate
                </h2>
                <p className="text-xs text-[#71717A] font-light max-w-2xl leading-relaxed">
                  Verified public expenditure data is proactively published under Section 4(1)(b) of the Right to Information Act, 2005. Any citizen can inspect physical progress, check contractor allocations, and report ground discrepancies directly to the District Magistrate.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCitizenReportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>Report Ground Discrepancy</span>
              </button>
            </div>
          </div>

          {/* Public Works List */}
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-bold text-[#121316]">
                  Public Works in {selectedState} ({citizenWorksList.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#71717A]">Verified Public Ledger</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citizenWorksList.map((w) => {
                const workTitle = w.title || w.work_description_normalized || 'Untitled Work';
                const workCat = w.category || w.category_normalized || 'General';
                const sanctionedAmount = w.sanctioned_amount ?? 0;

                return (
                  <div key={w.work_id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#71717A]">#{w.work_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800">
                          {w.lifecycle_status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#121316] line-clamp-2" title={workTitle}>
                        {workTitle}
                      </h4>
                      <p className="text-[11px] text-[#71717A]">{workCat}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#E4E2DC]">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#71717A]">Sanctioned:</span>
                        <span className="font-bold text-[#121316]">₹{(sanctionedAmount / 100000).toFixed(2)} Lakhs</span>
                      </div>
                      <div className="flex items-center justify-between">
                      <Link
                        to={`/works/${w.work_id}`}
                        className="text-[11px] font-bold text-[#C85A32] hover:underline flex items-center gap-1"
                      >
                        <span>View 360° Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenForm(prev => ({ ...prev, work_id: String(w.work_id) }));
                          setIsCitizenReportModalOpen(true);
                        }}
                        className="text-[10px] font-mono text-[#71717A] hover:text-rose-700 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Flag Issue</span>
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Public Citizen Reports Feed */}
          {citizenReports.length > 0 && (
            <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C85A32]" />
                  <h3 className="text-sm font-bold text-[#121316]">
                    Recent Public Social Audit Inquiries ({citizenReports.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#71717A]">Public Grievance Tracker</span>
              </div>

              <div className="divide-y divide-[#E4E2DC]">
                {citizenReports.slice(0, 5).map((rep) => (
                  <div key={rep.report_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-50 text-rose-800">
                          {rep.discrepancy_category}
                        </span>
                        <span className="font-bold text-[#121316]">Work #{rep.work_id}</span>
                        <span className="font-mono text-[10px] text-[#71717A]">Docket #{rep.report_id}</span>
                      </div>
                      <p className="text-[#4A4D53] font-light max-w-2xl">{rep.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-amber-50 text-amber-800 shrink-0">
                      {rep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: MP RECOMMENDATION MODAL */}
      {/* ==================================================================== */}
      {isNewRecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <h3 className="text-base font-bold text-[#121316] font-serif">Recommend New Constituency Scheme</h3>
              <button onClick={() => setIsNewRecModalOpen(false)} className="text-[#71717A] hover:text-[#121316] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecommendation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#121316] block mb-1">Scheme / Work Title *</label>
                <input
                  type="text"
                  required
                  value={newRecForm.title}
                  onChange={(e) => setNewRecForm({ ...newRecForm, title: e.target.value })}
                  placeholder="e.g. Solar Powered Deep Tubewell at Shivajinagar"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Category</label>
                  <select
                    value={newRecForm.category}
                    onChange={(e) => setNewRecForm({ ...newRecForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  >
                    <option value="Drinking Water">Drinking Water</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Roads & Bridges">Roads &amp; Bridges</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="50000"
                    max="50000000"
                    value={newRecForm.estimated_cost}
                    onChange={(e) => setNewRecForm({ ...newRecForm, estimated_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">District / Block / Gram Panchayat</label>
                <input
                  type="text"
                  value={newRecForm.location_description}
                  onChange={(e) => setNewRecForm({ ...newRecForm, location_description: e.target.value })}
                  placeholder="e.g. Haveli Block, Ward 14"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">Constituency Justification &amp; Impact</label>
                <textarea
                  rows={3}
                  value={newRecForm.justification}
                  onChange={(e) => setNewRecForm({ ...newRecForm, justification: e.target.value })}
                  placeholder="Explain public necessity, population benefited..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <strong>Statutory Notice:</strong> This scheme will be created in <code>DRAFT</code> status. You can refine it until you click &ldquo;Submit to DM&rdquo;, which formally locks the proposal.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsNewRecModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {recSubmitting ? 'Saving...' : 'Save Draft Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: DISTRICT MILESTONE EXECUTION MODAL */}
      {/* ==================================================================== */}
      {isMilestoneModalOpen && selectedWorkForMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#121316] font-serif">Update Ground Physical Milestone</h3>
                <p className="text-[11px] text-[#71717A]">Work #{selectedWorkForMilestone.work_id}: {selectedWorkForMilestone.title || selectedWorkForMilestone.work_description_normalized || 'Operational Scheme'}</p>
              </div>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="text-[#71717A] hover:text-[#121316] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-[#121316] mb-1">
                  <span>Physical Progress Percentage</span>
                  <span className="font-mono text-[#C85A32]">{milestoneForm.physical_progress_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={milestoneForm.physical_progress_pct}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, physical_progress_pct: Number(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Geo Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={milestoneForm.geo_latitude}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, geo_latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Geo Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={milestoneForm.geo_longitude}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, geo_longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">Officer Site Inspection Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={milestoneForm.inspection_notes}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, inspection_notes: e.target.value })}
                  placeholder="Enter physical foundation status, material verification, civil engineering remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_completed"
                  checked={milestoneForm.is_completed}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, is_completed: e.target.checked })}
                  className="rounded border-[#E4E2DC] text-[#C85A32] focus:ring-[#C85A32]"
                />
                <label htmlFor="is_completed" className="font-bold text-[#121316] cursor-pointer">
                  Certify Physical Completion (Ready for Final Utilization Certificate)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={milestoneSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {milestoneSubmitting ? 'Recording Proof...' : 'Commit Milestone to Audit Trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: FINANCIAL CORRECTION REQUEST MODAL */}
      {/* ==================================================================== */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#121316] font-serif">Request Statutory Financial Correction</h3>
                <p className="text-[11px] text-[#71717A]">Statutory ledger immutability prevents direct historical overwrites</p>
              </div>
              <button onClick={() => setIsCorrectionModalOpen(false)} className="text-[#71717A] hover:text-[#121316] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCorrection} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#121316] block mb-1">Target Scheme ID *</label>
                <input
                  type="text"
                  required
                  value={correctionForm.entity_id}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, entity_id: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Current Voucher Value</label>
                  <input
                    type="text"
                    required
                    value={correctionForm.previous_value}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, previous_value: e.target.value })}
                    placeholder="e.g. ₹15,00,000"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Proposed Audited Value *</label>
                  <input
                    type="text"
                    required
                    value={correctionForm.proposed_value}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_value: e.target.value })}
                    placeholder="e.g. ₹14,20,000"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">Statutory Audit Rationale *</label>
                <textarea
                  rows={3}
                  required
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  placeholder="Specify accounting discrepancy, revised technical sanction document reference, or treasury reconciliation note..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={correctionSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {correctionSubmitting ? 'Filing...' : 'Submit to Ministry for Sign-off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: AUDITOR FORENSIC CASE MODAL */}
      {/* ==================================================================== */}
      {isAuditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <h3 className="text-base font-bold text-[#121316] font-serif">Open Forensic Investigation Case</h3>
              <button onClick={() => setIsAuditorModalOpen(false)} className="text-[#71717A] hover:text-[#121316] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvestigation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#121316] block mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={auditorForm.title}
                  onChange={(e) => setAuditorForm({ ...auditorForm, title: e.target.value })}
                  placeholder="e.g. Statistical Outlier in Water Works Tranches"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Entity ID</label>
                  <input
                    type="text"
                    value={auditorForm.entity_id}
                    onChange={(e) => setAuditorForm({ ...auditorForm, entity_id: e.target.value })}
                    placeholder="e.g. 104"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Severity</label>
                  <select
                    value={auditorForm.severity}
                    onChange={(e) => setAuditorForm({ ...auditorForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">Forensic Hypothesis *</label>
                <textarea
                  rows={2}
                  required
                  value={auditorForm.hypothesis}
                  onChange={(e) => setAuditorForm({ ...auditorForm, hypothesis: e.target.value })}
                  placeholder="Empirical hypothesis (e.g. Disproportionate payment acceleration in Q4)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#121316] block mb-1">Evidence &amp; Statistical Signals</label>
                <textarea
                  rows={2}
                  value={auditorForm.evidence}
                  onChange={(e) => setAuditorForm({ ...auditorForm, evidence: e.target.value })}
                  placeholder="Z-scores, voucher timestamps, vendor concentration indices..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsAuditorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={auditorSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {auditorSubmitting ? 'Opening Case...' : 'Register Forensic Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: CITIZEN SOCIAL AUDIT DISCREPANCY REPORT */}
      {/* ==================================================================== */}
      {isCitizenReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#121316] font-serif">Report Ground Infrastructure Discrepancy</h3>
                <p className="text-[11px] text-[#71717A]">Open civic social audit under RTI Public Disclosure</p>
              </div>
              <button onClick={() => setIsCitizenReportModalOpen(false)} className="text-[#71717A] hover:text-[#121316] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {citizenReportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <p className="font-bold">{citizenReportSuccess}</p>
                <p className="text-[11px] text-emerald-700">Thank you for defending public fund integrity.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCitizenReport} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#121316] block mb-1">Work ID or Project Name *</label>
                  <input
                    type="text"
                    required
                    value={citizenForm.work_id}
                    onChange={(e) => setCitizenForm({ ...citizenForm, work_id: e.target.value })}
                    placeholder="e.g. 102 or Primary School Renovation"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#121316] block mb-1">Discrepancy Category</label>
                  <select
                    value={citizenForm.discrepancy_category}
                    onChange={(e) => setCitizenForm({ ...citizenForm, discrepancy_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  >
                    <option value="GHOST_WORK">Ghost Work (Asset non-existent on ground)</option>
                    <option value="INFERIOR_QUALITY">Substandard Material or Structural Defect</option>
                    <option value="SCHEDULE_DELAY">Abandoned / Stalled Site</option>
                    <option value="FUNDS_MISAPPROPRIATION">Discrepancy in Published Cost</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#121316] block mb-1">Detailed Ground Observations *</label>
                  <textarea
                    rows={3}
                    required
                    value={citizenForm.description}
                    onChange={(e) => setCitizenForm({ ...citizenForm, description: e.target.value })}
                    placeholder="Describe what you observed on site (e.g. Wall cracked, borewell dry, no work done despite full disbursement)..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#121316] block mb-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={citizenForm.citizen_name}
                      onChange={(e) => setCitizenForm({ ...citizenForm, citizen_name: e.target.value })}
                      placeholder="Anonymous or Name"
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#121316] block mb-1">Email / Phone (Optional)</label>
                    <input
                      type="text"
                      value={citizenForm.citizen_contact}
                      onChange={(e) => setCitizenForm({ ...citizenForm, citizen_contact: e.target.value })}
                      placeholder="For inspection status updates"
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    onClick={() => setIsCitizenReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-[#71717A] hover:bg-[#F0EFEA] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={citizenSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B54C26] text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {citizenSubmitting ? 'Transmitting...' : 'File Citizen Discrepancy Docket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const RoleDashboardsPage: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <RoleDashboardsPageContent />
    </DashboardErrorBoundary>
  );
};
