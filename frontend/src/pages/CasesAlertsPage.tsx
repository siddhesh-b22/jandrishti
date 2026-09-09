import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  FileText,
  Activity,
  History,
  PlusCircle,
  X,
  RotateCcw,
  ExternalLink,
  Info,
  Check,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  Building2,
  UserCheck,
  Camera,
  Eye,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { Anomaly, ReviewCase, AuditLog, CitizenReport } from '../api/types';
import { useRole } from '../context/RoleContext';
import { SeverityBadge } from '../components/common/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Pagination } from '../components/common/Pagination';

const PAGE_SIZE = 10;

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  NEW: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', label: 'New (Pending Review)' },
  UNDER_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Under Review' },
  CLARIFICATION_REQUESTED: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Clarification Requested' },
  DETAILED_REVIEW: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: 'Detailed Review' },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Resolved & Verified' },
  ESCALATED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: 'Escalated to Ministry' },
};

const OBSERVATION_TEMPLATES = [
  'On-site physical inspection verified: 100% of reported milestone works executed per approved technical specs.',
  'Expenditure audit notice dispatched to nodal implementing agency requiring itemized vendor vouchers and bank statements.',
  'GIS satellite coordinates cross-referenced against cadastral land registry maps; boundary overlap verified resolved.',
  'Administrative show-cause inquiry issued to nodal authority regarding milestone completion delay with 14-day statutory reply window.',
  'Detailed Project Report (DPR) cost line items reconciled against state Schedule of Rates (SoR); expenditure justified.',
];

export const CasesAlertsPage: React.FC = () => {
  const { currentRole, roleConfig, canEdit, user } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get('tab');
  const targetCaseId = searchParams.get('case') || searchParams.get('case_id') || searchParams.get('q') || '';

  // Authority Scope Guards
  const isDistrictLocked = currentRole === 'DISTRICT_AUTHORITY' && !!user?.district;
  const userJurisdictionDistrict = user?.district ? user.district.toUpperCase() : '';
  const isStateLocked = (currentRole === 'STATE_NODAL_AUTHORITY' || currentRole === 'DISTRICT_AUTHORITY') && !!user?.state;
  const userJurisdictionState = user?.state ? user.state.toUpperCase() : '';

  const savedTab = localStorage.getItem('jandrishti_cases_tab') as any;
  const initialActiveTab = (
    urlTab === 'CASES' ? 'CASES' :
    urlTab === 'CITIZEN_REPORTS' ? 'CITIZEN_REPORTS' :
    urlTab === 'AUDIT' ? 'AUDIT' :
    urlTab === 'ALERTS' ? 'ALERTS' :
    (savedTab && ['ALERTS', 'CASES', 'AUDIT', 'CITIZEN_REPORTS'].includes(savedTab)) ? savedTab : 'ALERTS'
  );

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'CASES' | 'AUDIT' | 'CITIZEN_REPORTS'>(initialActiveTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global counts for metrics
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [casesTotal, setCasesTotal] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [citizenReportsTotal, setCitizenReportsTotal] = useState(0);

  // TAB 1: Risk Alerts Feed
  const [alerts, setAlerts] = useState<Anomaly[]>([]);
  const [alertsOffset, setAlertsOffset] = useState(0);
  const [alertSeverity, setAlertSeverity] = useState<string>('');

  // TAB 2: Review Cases Workflow
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [casesOffset, setCasesOffset] = useState(0);
  const [caseStatusFilter, setCaseStatusFilter] = useState<string>('');
  const [caseSeverityFilter, setCaseSeverityFilter] = useState<string>('');

  // TAB 3: Immutable Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditOffset, setAuditOffset] = useState(0);

  // TAB 4: Citizen Ground Reports State
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [selectedCitizenReport, setSelectedCitizenReport] = useState<CitizenReport | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [actingOnReportId, setActingOnReportId] = useState<string | null>(null);
  const [citizenStatusFilter, setCitizenStatusFilter] = useState<string>('ALL');

  // Keyword search across active view - initialized from URL parameter if provided
  const [searchQuery, setSearchQuery] = useState<string>(targetCaseId);

  // Synchronize Tab changes with URL Search Params & Local Storage
  const handleTabChange = (newTab: 'ALERTS' | 'CASES' | 'AUDIT' | 'CITIZEN_REPORTS') => {
    setActiveTab(newTab);
    localStorage.setItem('jandrishti_cases_tab', newTab);
    setSearchQuery('');
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', newTab);
      if (newTab !== 'CASES') {
        p.delete('case');
        p.delete('case_id');
      }
      return p;
    });
  };

  // Status update modal state
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('UNDER_REVIEW');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // In-app toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Initial overview metrics load
  useEffect(() => {
    const scopeState = isStateLocked ? userJurisdictionState : undefined;
    const scopeDistrict = isDistrictLocked ? userJurisdictionDistrict : undefined;

    // Anomalies count
    api.getAnomalies({ state: scopeState, district: scopeDistrict, limit: 1 })
      .then((res) => setAlertsTotal(res.total))
      .catch(() => {});

    // Critical anomalies count
    api.getAnomalies({ state: scopeState, district: scopeDistrict, severity: 'CRITICAL', limit: 1 })
      .then((res) => setCriticalCount(res.total))
      .catch(() => {});

    // Cases total count
    api.getCases({ limit: 1 })
      .then((res) => setCasesTotal(res.total))
      .catch(() => {});

    // Audit trail initial load
    api.getAuditTrail(300, 0)
      .then((logs) => setAuditLogs(logs || []))
      .catch(() => {});
  }, [isStateLocked, userJurisdictionState, isDistrictLocked, userJurisdictionDistrict]);

  // Fetch Alerts for Tab 1
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAnomalies({
        state: isStateLocked ? userJurisdictionState : undefined,
        district: isDistrictLocked ? userJurisdictionDistrict : undefined,
        severity: alertSeverity || undefined,
        limit: PAGE_SIZE,
        offset: alertsOffset,
      });
      setAlerts(res.items || []);
      setAlertsTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load risk alerts feed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Cases for Tab 2
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCases({
        search: searchQuery || undefined,
        status: caseStatusFilter || undefined,
        severity: caseSeverityFilter || undefined,
        sort_by: 'newest',
        limit: PAGE_SIZE,
        offset: casesOffset,
      });
      setCases(res.items || []);
      setCasesTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative review cases');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Audit for Tab 3
  const fetchAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const logs = await api.getAuditTrail(300, 0);
      setAuditLogs(logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load immutable audit trail');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Citizen Reports for Tab 4
  const fetchCitizenReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { limit: 50 };
      if (isDistrictLocked && userJurisdictionDistrict) {
        params.district = userJurisdictionDistrict;
      } else if (isStateLocked && userJurisdictionState) {
        params.state = userJurisdictionState;
      }
      if (citizenStatusFilter && citizenStatusFilter !== 'ALL') {
        params.status = citizenStatusFilter;
      }
      const res = await api.listCitizenReports(params);
      const items = Array.isArray(res) ? res : (res?.items || []);
      const total = Array.isArray(res) ? res.length : (res?.total || items.length);
      setCitizenReports(items);
      setCitizenReportsTotal(total);
    } catch (err: any) {
      setError(err.message || 'Failed to load citizen ground reports');
    } finally {
      setLoading(false);
    }
  };

  // Authority Action Handlers for Citizen Reports
  const handleDispatchInspection = async (report: CitizenReport) => {
    try {
      setActingOnReportId(report.report_id);
      await api.updateCitizenReportStatus(report.report_id, {
        status: 'INSPECTION_DISPATCHED',
        assigned_authority: `District Verification Cell (${userJurisdictionDistrict || report.district || 'Pune'})`,
        notes: `Physical verification team dispatched on-site by ${roleConfig.shortLabel}.`
      });
      showToast(`Inspection dispatched for Report #${report.report_id}. Status synced to citizen tracker.`, 'success');
      fetchCitizenReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to update inspection status', 'error');
    } finally {
      setActingOnReportId(null);
    }
  };

  const handleEscalateToCase = async (report: CitizenReport) => {
    try {
      setActingOnReportId(report.report_id);
      const res = await api.escalateCitizenReport(report.report_id, {
        priority: 'CRITICAL',
        notes: `Escalated to statutory investigation docket by ${roleConfig.shortLabel}. Payment tranches frozen pending ground inspection.`
      });
      showToast(`Report #${report.report_id} escalated to Statutory Case #${res.case.case_id}!`, 'success');
      setActiveTab('CASES');
      setCasesOffset(0);
      fetchCases();
      fetchCitizenReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to escalate report to case', 'error');
    } finally {
      setActingOnReportId(null);
    }
  };

  const handleMarkResolved = async (report: CitizenReport) => {
    try {
      setActingOnReportId(report.report_id);
      await api.updateCitizenReportStatus(report.report_id, {
        status: 'VERIFIED',
        notes: `On-ground physical rectification completed and verified by ${roleConfig.shortLabel}.`
      });
      showToast(`Report #${report.report_id} verified & marked RESOLVED.`, 'success');
      fetchCitizenReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve report', 'error');
    } finally {
      setActingOnReportId(null);
    }
  };

  // Load data based on active tab & filters
  useEffect(() => {
    if (activeTab === 'ALERTS') {
      fetchAlerts();
    } else if (activeTab === 'CASES') {
      fetchCases();
    } else if (activeTab === 'AUDIT') {
      fetchAudit();
    } else if (activeTab === 'CITIZEN_REPORTS') {
      fetchCitizenReports();
    }
  }, [activeTab, searchQuery, alertsOffset, alertSeverity, casesOffset, caseStatusFilter, caseSeverityFilter, citizenStatusFilter, isStateLocked, userJurisdictionState, isDistrictLocked, userJurisdictionDistrict]);

  // Convert Alert into Review Case
  const handleCreateCaseFromAlert = async (anomalyItem: Anomaly) => {
    if (!canEdit()) {
      showToast(
        'Read-Only Civic Perspective: Your active role does not have statutory privileges to initiate formal inquiry cases. Switch role in top header.',
        'info'
      );
      return;
    }
    try {
      const res = await api.createCase({
        entity_type: anomalyItem.entity_type,
        entity_id: anomalyItem.entity_id,
        title: `${anomalyItem.anomaly_type.replace(/_/g, ' ')} on ${anomalyItem.entity_type} #${anomalyItem.entity_id}`,
        severity: anomalyItem.severity,
        risk_score: Math.round(anomalyItem.anomaly_score * 100),
        category: anomalyItem.anomaly_type,
        assigned_to: 'Nodal District Authority',
        assigned_role: 'DISTRICT_AUTHORITY',
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: `Converted from MAD statistical anomaly flag: ${anomalyItem.reason}`,
      });
      showToast(
        `Statutory Case ${res.case_id} registered and entered into public audit trail.`,
        'success'
      );
      setActiveTab('CASES');
      setCasesOffset(0);
      fetchCases();
      fetchAudit();
    } catch (err) {
      showToast('Failed to initiate administrative review case. Please verify database connection.', 'error');
    }
  };

  // Update Case Status & Record Action
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !updateStatus) return;

    try {
      setUpdating(true);
      await api.updateCaseStatus(selectedCase.case_id, {
        new_status: updateStatus,
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: updateNotes,
      });
      showToast(`Case ${selectedCase.case_id} updated to ${updateStatus}. Audit record committed.`, 'success');
      setSelectedCase(null);
      setUpdateNotes('');
      fetchCases();
      fetchAudit();
    } catch (err) {
      showToast('Failed to commit review status update.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Search filtering
  const displayedAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase();
    return alerts.filter(
      (a) =>
        a.anomaly_id?.toLowerCase().includes(q) ||
        a.entity_id?.toLowerCase().includes(q) ||
        a.anomaly_type?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q) ||
        a.entity_type?.toLowerCase().includes(q)
    );
  }, [alerts, searchQuery]);

  const displayedCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const q = searchQuery.toLowerCase();
    return cases.filter(
      (c) =>
        c.case_id?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.entity_id?.toLowerCase().includes(q) ||
        c.assigned_to?.toLowerCase().includes(q) ||
        c.resolution_notes?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }, [cases, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase();
    return auditLogs.filter(
      (log) =>
        log.case_id?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.performed_by?.toLowerCase().includes(q) ||
        log.role?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.case_title?.toLowerCase().includes(q)
    );
  }, [auditLogs, searchQuery]);

  const displayedAuditLogs = useMemo(() => {
    return filteredAuditLogs.slice(auditOffset, auditOffset + PAGE_SIZE);
  }, [filteredAuditLogs, auditOffset]);

  const displayedCitizenReports = useMemo(() => {
    if (!searchQuery.trim()) return citizenReports;
    const q = searchQuery.toLowerCase();
    return citizenReports.filter(
      (r) =>
        r.report_id?.toLowerCase().includes(q) ||
        r.work_id?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.reported_location?.toLowerCase().includes(q) ||
        r.discrepancy_category?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [citizenReports, searchQuery]);

  const getAnomalyInsight = (a: Anomaly) => {
    const type = a.anomaly_type;
    if (type === 'CONTRACTOR_CONCENTRATION') {
      return {
        what: 'A single contractor received an unusually high percentage of contracts in this constituency.',
        why: a.reason || 'Contractor reliance index deviates significantly from peer district distributions.',
        nextStep: 'Verify whether tenders followed open competitive bidding guidelines and check vendor tax compliance.',
        method: 'Statistical Gini & MAD Robust Analysis',
        confidence: 'High Confidence (Direct Tender Ledgers)',
      };
    } else if (type === 'PROGRESS_MISMATCH') {
      return {
        what: 'Financial expenditures are progressing significantly faster than verified physical work on the ground.',
        why: a.reason || 'Expenditure ratio exceeds reported milestone completion by more than 30 percentage points.',
        nextStep: 'Withhold subsequent tranche disbursements pending an on-site physical milestone inspection by district engineers.',
        method: 'Milestone Divergence Calculation',
        confidence: 'Critical Risk (Immediate Field Audit)',
      };
    } else if (type === 'DELAY_RISK') {
      return {
        what: 'Project duration on ground has exceeded twice the expected benchmark for this category of work.',
        why: a.reason || 'Duration is more than 2.0x the median timeline of similar completed works.',
        nextStep: 'Issue an administrative timeline show-cause inquiry to the nodal implementing authority.',
        method: 'Predictive Timeline Modeling',
        confidence: 'High Schedule Risk',
      };
    } else if (type === 'BUDGET_VARIANCE') {
      return {
        what: 'Sanctioned project cost is noticeably higher than median costs for comparable infrastructure in this region.',
        why: a.reason || 'Estimated outlay significantly exceeds regional median rates for this category.',
        nextStep: 'Cross-check the Detailed Project Report (DPR) line items and schedule of rates (SoR).',
        method: 'Peer Cost Distribution Outlier Detection',
        confidence: 'Moderate (Document Review Required)',
      };
    } else if (type === 'CITIZEN_DISCREPANCY') {
      return {
        what: 'Local resident submitted on-ground physical observation & photographic discrepancy evidence.',
        why: a.reason || 'Reported non-existence, abandoned progress, or substandard material during field social audit.',
        nextStep: 'Dispatch District Verification Cell engineer to inspect site and freeze pending disbursement tranche under Rule 3.12.',
        method: 'Citizen Social Audit & On-Ground Photogrammetry',
        confidence: 'High Ground Truth (Community Whistleblower)',
      };
    } else if (type === 'LOW_UTILIZATION_ALERT') {
      return {
        what: 'MP allocation shows significantly lower fund absorption compared to parliamentary peer medians.',
        why: a.reason || 'Member utilization percentage deviates from parliamentary baseline distributions.',
        nextStep: 'Notify district nodal office to expedite administrative approvals for pending work recommendations.',
        method: 'Robust Z-Score (MAD Baseline)',
        confidence: 'High Confidence (PFMS Ledgers)',
      };
    }
    return {
      what: `Unusual operational pattern detected in ${a.entity_type.toLowerCase()} record.`,
      why: a.reason || 'Diverges from expected peer baseline metrics.',
      nextStep: 'Examine supporting transaction vouchers and execution milestone proofs.',
      method: a.detection_method || 'Statistical Peer Comparison',
      confidence: 'Standard Statutory Verification',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl border shadow-xl max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-rose-50 border-rose-700'
                : 'bg-[#121316]/95 text-[#FAF8F5] border-[#383A42]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs leading-relaxed font-sans">{toast.message}</div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Intelligence Center', to: '/anomalies' },
          { label: 'Statutory Cases & Alerts Docket' },
        ]}
      />

      {/* Hero Header & Governance Banner */}
      <div className="rounded-3xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#E4E2DC] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="cw-badge-section">
                HUMAN-IN-THE-LOOP STATUTORY GOVERNANCE
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-[#71717A] text-[11px] font-mono border border-[#E4E2DC]">
                Active Perspective: <strong className="text-[#121316] font-semibold">{roleConfig.label}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#121316] tracking-tight">
              Statutory Cases &amp; Risk Alerts Docket
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-3xl font-light leading-relaxed">
              Traces public funds and infrastructure integrity through a transparent, constitutional administrative lifecycle:
              <strong className="text-[#121316] font-normal"> Data &rarr; AI Detection &rarr; Risk Scoring &rarr; Alert &rarr; Human Review &rarr; Administrative Action &rarr; Immutable Audit Trail</strong>.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 shrink-0 font-mono">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] text-center min-w-[110px]">
              <span className="text-[10px] uppercase text-[#71717A] block font-sans tracking-wide">Live Alerts</span>
              <span className="text-2xl font-bold text-[#121316]">{alertsTotal ? alertsTotal.toLocaleString() : '1,831'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] text-center min-w-[110px]">
              <span className="text-[10px] uppercase text-[#71717A] block font-sans tracking-wide">Review Cases</span>
              <span className="text-2xl font-bold text-[#121316]">{casesTotal ? casesTotal.toLocaleString() : '109'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF0EB] border border-[#E8C5B6] text-center min-w-[110px]">
              <span className="text-[10px] uppercase text-[#C85A32] block font-sans font-semibold tracking-wide">Critical Flags</span>
              <span className="text-2xl font-bold text-[#C85A32]">{criticalCount ? criticalCount.toLocaleString() : '21'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[110px]">
              <span className="text-[10px] uppercase text-amber-800 block font-sans font-semibold tracking-wide">Citizen Flags</span>
              <span className="text-2xl font-bold text-amber-900">{citizenReportsTotal ? citizenReportsTotal.toLocaleString() : '18'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Global Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => handleTabChange('ALERTS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                activeTab === 'ALERTS'
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316] hover:bg-[#E4E2DC]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Alerts Feed ({alertsTotal.toLocaleString()})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CASES')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                activeTab === 'CASES'
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316] hover:bg-[#E4E2DC]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Review Cases Workflow ({casesTotal.toLocaleString()})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CITIZEN_REPORTS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                activeTab === 'CITIZEN_REPORTS'
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316] hover:bg-[#E4E2DC]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Citizen Ground Dockets ({citizenReportsTotal.toLocaleString()})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('AUDIT')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                activeTab === 'AUDIT'
                  ? 'bg-[#121316] text-[#FAF8F5] shadow-xs'
                  : 'bg-[#F0EFEA] text-[#71717A] hover:text-[#121316] hover:bg-[#E4E2DC]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Immutable Audit Trail ({auditLogs.length.toLocaleString()})</span>
            </button>
          </div>

          {/* Real-time Search Input */}
          <div className="relative min-w-[260px] max-w-sm">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search in ${activeTab === 'ALERTS' ? 'alerts' : activeTab === 'CASES' ? 'cases' : activeTab === 'CITIZEN_REPORTS' ? 'citizen reports' : 'audit logs'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-full border border-[#E4E2DC] bg-[#FAF8F5] text-xs text-[#121316] placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#121316] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-24" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => activeTab === 'ALERTS' ? fetchAlerts() : activeTab === 'CASES' ? fetchCases() : fetchAudit()} />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: RISK ALERTS FEED */}
          {activeTab === 'ALERTS' && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[#121316] mr-1">Severity:</span>
                  {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setAlertSeverity(s);
                        setAlertsOffset(0);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        alertSeverity === s
                          ? 'bg-[#121316] text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#71717A] border border-[#E4E2DC] hover:border-[#C85A32] hover:text-[#121316]'
                      }`}
                    >
                      {s || 'All Severities'}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-[#71717A]">
                  Total catalog: <strong className="text-[#121316] font-semibold">{alertsTotal.toLocaleString()}</strong> records
                </div>
              </div>

              {/* Alerts List */}
              {displayedAlerts.length === 0 ? (
                <div className="rounded-3xl border border-[#E4E2DC] bg-white p-12 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-[#71717A] mx-auto opacity-50" />
                  <h3 className="text-base font-serif text-[#121316]">No matching alerts found</h3>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto font-light">
                    No risk flags match your selected severity or keyword query. Try resetting your search filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAlertSeverity('');
                      setSearchQuery('');
                      setAlertsOffset(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] hover:bg-[#F0EFEA] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedAlerts.map((a) => {
                    const insight = getAnomalyInsight(a);
                    return (
                      <div
                        key={a.anomaly_id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E4E2DC] shadow-2xs hover:border-[#C85A32]/40 transition space-y-4"
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EFEA] pb-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <SeverityBadge severity={a.severity} />
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#121316] text-xs font-mono font-medium border border-[#E4E2DC]">
                              {a.entity_type} #{a.entity_id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#71717A] text-xs font-mono border border-[#E4E2DC]">
                              Risk Score: <strong className="text-[#121316]">{(a.anomaly_score * 100).toFixed(0)}/100</strong>
                            </span>
                            <span className="text-[11px] font-mono text-[#71717A]">
                              {a.anomaly_id}
                            </span>
                            {a.anomaly_type === 'CITIZEN_DISCREPANCY' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
                                CITIZEN GROUND AUDIT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                            {a.entity_type === 'WORK' ? (
                              <Link
                                to={`/works/${a.entity_id}`}
                                className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC] font-medium text-xs transition flex items-center gap-1 min-h-[34px]"
                              >
                                <span>Inspect Work</span>
                                <ChevronRight className="w-3 h-3 text-[#71717A]" />
                              </Link>
                            ) : a.entity_type === 'MP' ? (
                              <Link
                                to={`/mps/${a.entity_id}`}
                                className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC] font-medium text-xs transition flex items-center gap-1 min-h-[34px]"
                              >
                                <span>Inspect MP Dossier</span>
                                <ChevronRight className="w-3 h-3 text-[#71717A]" />
                              </Link>
                            ) : a.entity_type === 'TRANSACTION' ? (
                              <Link
                                to={`/transactions?search=${a.entity_id}`}
                                className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC] font-medium text-xs transition flex items-center gap-1 min-h-[34px]"
                              >
                                <span>Inspect Voucher</span>
                                <ChevronRight className="w-3 h-3 text-[#71717A]" />
                              </Link>
                            ) : (
                              <Link
                                to={`/vendors?search=${encodeURIComponent(a.entity_id)}`}
                                className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC] font-medium text-xs transition flex items-center gap-1 min-h-[34px]"
                              >
                                <span>Inspect Entity</span>
                                <ChevronRight className="w-3 h-3 text-[#71717A]" />
                              </Link>
                            )}

                            {canEdit() && (
                              <button
                                type="button"
                                onClick={() => handleCreateCaseFromAlert(a)}
                                className="px-4 py-1.5 rounded-full bg-[#C85A32] hover:bg-[#B34E28] text-white font-medium text-xs transition flex items-center gap-1.5 shadow-xs min-h-[34px] cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Initiate Review Case</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Anomaly Title */}
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-serif text-[#121316]">
                            {a.anomaly_type.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-xs text-[#71717A] leading-relaxed">
                            {a.reason}
                          </p>
                        </div>

                        {/* 4-Question Human Explanation Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#E4E2DC]">
                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-sky-800 uppercase tracking-wider text-[10px] block">
                              1. What happened?
                            </span>
                            <p className="text-[#121316] leading-relaxed font-sans">
                              {insight.what}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-amber-800 uppercase tracking-wider text-[10px] block">
                              2. Why was it flagged?
                            </span>
                            <p className="text-[#71717A] leading-relaxed font-sans">
                              {insight.why}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-emerald-800 uppercase tracking-wider text-[10px] block">
                              3. Recommended Next Step
                            </span>
                            <p className="text-[#121316] leading-relaxed font-sans">
                              {insight.nextStep}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-[#71717A] uppercase tracking-wider text-[10px] block">
                              4. Detection Method &amp; Confidence
                            </span>
                            <p className="text-[#71717A] leading-relaxed font-sans">
                              <strong className="text-[#121316] font-semibold">{insight.method}</strong> &middot; {insight.confidence}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 1 Pagination */}
              <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                <Pagination
                  total={alertsTotal}
                  limit={PAGE_SIZE}
                  offset={alertsOffset}
                  onPageChange={(newOffset) => setAlertsOffset(newOffset)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW CASES WORKFLOW */}
          {activeTab === 'CASES' && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[#121316] mr-1">Status:</span>
                  {['', 'NEW', 'UNDER_REVIEW', 'CLARIFICATION_REQUESTED', 'DETAILED_REVIEW', 'RESOLVED', 'ESCALATED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setCaseStatusFilter(st);
                        setCasesOffset(0);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        caseStatusFilter === st
                          ? 'bg-[#121316] text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#71717A] border border-[#E4E2DC] hover:border-[#C85A32] hover:text-[#121316]'
                      }`}
                    >
                      {st ? st.replace(/_/g, ' ') : 'All Statuses'}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-[#71717A]">
                  Active cases: <strong className="text-[#121316] font-semibold">{casesTotal.toLocaleString()}</strong>
                </div>
              </div>

              {/* Cases List */}
              {displayedCases.length === 0 ? (
                <div className="rounded-3xl border border-[#E4E2DC] bg-white p-12 text-center space-y-3">
                  <FileText className="w-8 h-8 text-[#71717A] mx-auto opacity-50" />
                  <h3 className="text-base font-serif text-[#121316]">No review cases found</h3>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto font-light">
                    No administrative cases match your filter criteria or search terms.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCaseStatusFilter('');
                      setCaseSeverityFilter('');
                      setSearchQuery('');
                      setCasesOffset(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] hover:bg-[#F0EFEA] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedCases.map((c) => {
                    const isTargeted = targetCaseId && (c.case_id.toLowerCase() === targetCaseId.toLowerCase() || c.entity_id === targetCaseId);
                    const badge = STATUS_BADGES[c.status] || {
                      bg: 'bg-neutral-100',
                      text: 'text-neutral-700',
                      border: 'border-neutral-200',
                      label: c.status,
                    };

                    return (
                      <div
                        key={c.case_id}
                        className={`p-5 sm:p-6 rounded-3xl bg-white border shadow-2xs transition space-y-3.5 ${
                          isTargeted
                            ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 bg-[#FAF8F5]'
                            : 'border-[#E4E2DC] hover:border-[#C85A32]/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isTargeted && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C85A32] text-white animate-pulse">
                                  TARGET CASE DOCKET
                                </span>
                              )}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {badge.label}
                              </span>
                              <SeverityBadge severity={c.severity} />
                              <span className="text-xs font-mono text-[#71717A] font-semibold">
                                {c.case_id}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#121316] text-xs font-mono border border-[#E4E2DC]">
                                Risk Score: <strong className="text-[#C85A32] font-semibold">{c.risk_score}/100</strong>
                              </span>
                            </div>

                            <h3 className="text-base font-serif text-[#121316]">
                              {c.title}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-[#71717A] font-mono flex-wrap">
                              <span>Entity: <strong className="text-[#121316]">{c.entity_type} #{c.entity_id}</strong></span>
                              <span>&middot;</span>
                              <span>Assigned: <strong className="text-[#121316]">{c.assigned_to}</strong></span>
                              <span>&middot;</span>
                              <span>Updated: {new Date(c.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>

                            {c.resolution_notes && (
                              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] text-xs text-[#121316] font-light whitespace-pre-line leading-relaxed">
                                <span className="font-mono text-[10px] uppercase font-semibold text-[#71717A] block mb-1">
                                  Ground Verification / Resolution Log:
                                </span>
                                {c.resolution_notes}
                              </div>
                            )}
                          </div>

                          {canEdit() && (
                            <div className="shrink-0 self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setUpdateStatus(c.status);
                                  setUpdateNotes('');
                                }}
                                className="px-4 py-2 rounded-full font-medium text-xs transition shadow-xs bg-[#121316] hover:bg-black text-[#FAF8F5] cursor-pointer flex items-center gap-1.5"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>Review Case &amp; Record Action</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2 Pagination */}
              <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                <Pagination
                  total={casesTotal}
                  limit={PAGE_SIZE}
                  offset={casesOffset}
                  onPageChange={(newOffset) => setCasesOffset(newOffset)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white border border-[#E4E2DC] p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EFEA] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif text-[#121316]">
                      Constitutional Audit Trail &amp; Accountability Log
                    </h3>
                    <p className="text-xs text-[#71717A] font-light">
                      Cryptographically ordered, append-only administrative records of every alert review, status transition, and field resolution.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-medium border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Append-Only Immutable
                  </span>
                </div>

                {displayedAuditLogs.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <History className="w-8 h-8 text-[#71717A] mx-auto opacity-40" />
                    <p className="text-xs text-[#71717A]">No audit records match your search query.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedAuditLogs.map((log) => (
                      <div
                        key={log.log_id}
                        className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] flex items-start gap-4 text-xs font-mono"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-[#121316] font-sans text-xs font-semibold">{log.action}</strong>
                              <span className="px-2 py-0.5 rounded bg-white text-[#121316] text-[11px] border border-[#E4E2DC]">
                                {log.case_id}
                              </span>
                              {log.case_title && (
                                <span className="text-[11px] text-[#71717A] font-sans truncate max-w-xs">
                                  &middot; {log.case_title}
                                </span>
                              )}
                            </div>
                            <span className="text-[#71717A] text-[11px]">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-[#121316] font-sans text-xs leading-relaxed">
                            {log.details}
                          </div>

                          <div className="text-[11px] text-[#71717A] flex items-center gap-3 pt-1 flex-wrap">
                            <span>Actor: <strong className="text-[#121316] font-medium">{log.performed_by}</strong> ({log.role})</span>
                            {log.previous_state && log.new_state && (
                              <span>Transition: <strong className="text-[#C85A32] font-semibold">{log.previous_state} &rarr; {log.new_state}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                {/* Tab 3 Pagination */}
                <div className="p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                  <Pagination
                    total={filteredAuditLogs.length}
                    limit={PAGE_SIZE}
                    offset={auditOffset}
                    onPageChange={(newOffset) => setAuditOffset(newOffset)}
                  />
                </div>
            </div>
          )}

          {/* TAB 4: CITIZEN GROUND REPORTS & SOCIAL AUDIT */}
          {activeTab === 'CITIZEN_REPORTS' && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E4E2DC] shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[#121316] mr-1">Filter Status:</span>
                  {['ALL', 'SUBMITTED', 'ACKNOWLEDGED', 'INSPECTION_DISPATCHED', 'VERIFIED', 'RESOLVED', 'ESCALATED_TO_CASE'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCitizenStatusFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        citizenStatusFilter === st
                          ? 'bg-[#121316] text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#71717A] border border-[#E4E2DC] hover:border-[#C85A32] hover:text-[#121316]'
                      }`}
                    >
                      {st === 'ALL' ? 'All Reports' : st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-[#71717A]">
                  Active Scope: <strong className="text-[#121316] font-semibold">{isDistrictLocked ? `${userJurisdictionDistrict} (District Authority)` : isStateLocked ? `${userJurisdictionState} (State Nodal)` : 'National Ground Repository'}</strong> &middot; <strong>{displayedCitizenReports.length}</strong> reports
                </div>
              </div>

              {/* Citizen Reports Grid */}
              {displayedCitizenReports.length === 0 ? (
                <div className="rounded-3xl border border-[#E4E2DC] bg-white p-12 text-center space-y-3">
                  <Camera className="w-8 h-8 text-[#71717A] mx-auto opacity-50" />
                  <h3 className="text-base font-serif text-[#121316]">No Citizen Ground Reports in Scope</h3>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto font-light">
                    No citizen ground discrepancy observations have been logged for this jurisdiction matching the current filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedCitizenReports.map((rep) => (
                    <div
                      key={rep.report_id}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E4E2DC] shadow-2xs hover:border-[#C85A32]/50 transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                            ['GHOST_WORK', 'GHOST_PROJECT', 'FUND_MISUSE'].includes(rep.discrepancy_category)
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {rep.discrepancy_category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-[#71717A]">
                            {rep.report_id}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-mono text-[#71717A]">
                            Location: <strong className="text-[#121316] font-medium">{rep.reported_location || `${rep.district || 'Pune'}, ${rep.state || 'Maharashtra'}`}</strong>
                          </div>
                          {rep.work_id && (
                            <Link
                              to={`/works/${rep.work_id}`}
                              className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1 mt-1"
                            >
                              <span>Inspect Linked Work #{rep.work_id}</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>

                        <p className="text-xs text-[#121316] italic leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E4E2DC]">
                          "{rep.description}"
                        </p>

                        {/* Photo Evidence Preview */}
                        {rep.photo_url && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[#71717A] flex items-center gap-1">
                              <Camera className="w-3 h-3 text-[#C85A32]" />
                              Attached Photographic Proof:
                            </span>
                            <img
                              src={rep.photo_url.startsWith('http') ? rep.photo_url : `http://127.0.0.1:8000${rep.photo_url}`}
                              alt="Ground proof"
                              className="w-full h-36 object-cover rounded-xl border border-[#E4E2DC] cursor-pointer hover:opacity-90 transition"
                              onClick={() => setPreviewPhotoUrl(rep.photo_url?.startsWith('http') ? rep.photo_url : `http://127.0.0.1:8000${rep.photo_url}`)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] pt-2 border-t border-[#F0EFEA]">
                          <span>Status: <strong className="text-[#121316]">{rep.status}</strong></span>
                          <span>{new Date(rep.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Authority Actions */}
                      {canEdit() && (
                        <div className="flex items-center gap-2 pt-3 border-t border-[#F0EFEA] flex-wrap">
                          {rep.status === 'SUBMITTED' && (
                            <button
                              type="button"
                              disabled={actingOnReportId === rep.report_id}
                              onClick={() => handleDispatchInspection(rep)}
                              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium border border-blue-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Dispatch Inspection</span>
                            </button>
                          )}

                          {(rep.status === 'SUBMITTED' || rep.status === 'ACKNOWLEDGED' || rep.status === 'INSPECTION_DISPATCHED') && (
                            <button
                              type="button"
                              disabled={actingOnReportId === rep.report_id}
                              onClick={() => handleEscalateToCase(rep)}
                              className="px-3 py-1.5 rounded-full bg-[#C85A32] hover:bg-[#B34E28] text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Escalate to Statutory Case</span>
                            </button>
                          )}

                          {rep.status === 'INSPECTION_DISPATCHED' && (
                            <button
                              type="button"
                              disabled={actingOnReportId === rep.report_id}
                              onClick={() => handleMarkResolved(rep)}
                              className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Verified &amp; Close</span>
                            </button>
                          )}

                          {rep.status === 'ESCALATED_TO_CASE' && (
                            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-mono font-medium flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-purple-700" />
                              <span>Case Docket Active</span>
                            </span>
                          )}

                          {(rep.status === 'VERIFIED' || rep.status === 'RESOLVED') && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>On-Ground Verified &amp; Closed</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full Photo Preview Modal */}
      <AnimatePresence>
        {previewPhotoUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
            onClick={() => setPreviewPhotoUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewPhotoUrl}
                alt="Full photographic evidence"
                className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Status Update Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-action-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/60 backdrop-blur-xs font-sans"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E2DC] shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3.5">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#C85A32] uppercase tracking-wider block">
                    Statutory Action &amp; Audit Logger
                  </span>
                  <h3 id="case-action-title" className="text-lg font-serif text-[#121316]">
                    {selectedCase.case_id}: Record Review Finding
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Close action modal"
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 rounded-full text-[#71717A] hover:text-[#121316] hover:bg-[#F0EFEA] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Case Snapshot Pill */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4E2DC] text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Title: <strong className="text-[#121316] font-sans">{selectedCase.title}</strong></span>
                  <span className="text-[#C85A32] font-semibold">Risk: {selectedCase.risk_score}/100</span>
                </div>
                <div className="text-[#71717A]">
                  Entity: <strong className="text-[#121316]">{selectedCase.entity_type} #{selectedCase.entity_id}</strong> &middot; Current Status: <strong className="text-[#121316]">{selectedCase.status}</strong>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="new-status-select" className="font-semibold text-[#121316] block mb-1.5 font-sans">
                    Updated Administrative Status:
                  </label>
                  <select
                    id="new-status-select"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] font-medium text-[#121316] min-h-[42px] focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32]"
                  >
                    <option value="NEW">New (Pending Field Review)</option>
                    <option value="UNDER_REVIEW">Under Review (Committee Assigned)</option>
                    <option value="CLARIFICATION_REQUESTED">Clarification Requested (Official Show-Cause Issued)</option>
                    <option value="DETAILED_REVIEW">Detailed Review / Technical Audit</option>
                    <option value="RESOLVED">Resolved (Field Milestone / Vouchers Reconciled)</option>
                    <option value="ESCALATED">Escalated (Referred to MoSPI / CAG Inquiry)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="resolution-notes" className="font-semibold text-[#121316] block font-sans">
                      Official Findings &amp; Ground Inspection Summary:
                    </label>
                    <span className="text-[10px] text-[#71717A] font-mono">Mandatory field record</span>
                  </div>
                  <textarea
                    id="resolution-notes"
                    rows={4}
                    required
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Document specific physical milestone checks, contractor responses, or engineering committee findings..."
                    className="w-full p-3.5 rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] text-[#121316] font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32]"
                  />
                </div>

                {/* Preset observation templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#71717A] font-semibold block">
                    Quick Inspection Templates (Click to paste):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {OBSERVATION_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUpdateNotes((prev) => (prev ? `${prev}\n\n${tpl}` : tpl));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-[#71717A] hover:text-[#121316] hover:border-[#C85A32] text-[11px] font-sans text-left transition cursor-pointer"
                      >
                        + {tpl.slice(0, 42)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit signing disclaimer */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] text-[11px] text-[#71717A] leading-relaxed flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    Recorded by <strong className="text-[#121316]">{roleConfig.label}</strong>. This entry is cryptographically appended to the permanent public audit trail.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EFEA]">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="px-4 py-2 rounded-full border border-[#E4E2DC] text-[#71717A] font-medium hover:bg-[#F0EFEA] hover:text-[#121316] min-h-[40px] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !updateNotes.trim()}
                    className="px-5 py-2 rounded-full bg-[#121316] hover:bg-black text-[#FAF8F5] font-medium disabled:opacity-40 transition shadow-xs min-h-[40px] cursor-pointer"
                  >
                    {updating ? 'Committing...' : 'Commit to Public Audit Trail'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
