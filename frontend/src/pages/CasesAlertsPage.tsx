import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  FileText,
  Activity,
  History,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { Anomaly, ReviewCase, AuditLog } from '../api/types';
import { useRole } from '../context/RoleContext';
import { SeverityBadge } from '../components/common/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

export const CasesAlertsPage: React.FC = () => {
  const { currentRole, roleConfig } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'CASES' | 'AUDIT'>('ALERTS');
  const [alerts, setAlerts] = useState<Anomaly[]>([]);
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected case for status update modal
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anomRes, caseRes, auditRes] = await Promise.all([
        api.getAnomalies({ severity: severityFilter || undefined, limit: 30 }),
        api.getCases({ status: statusFilter || undefined, limit: 50 }),
        api.getAuditTrail(40),
      ]);
      setAlerts(anomRes.items);
      setCases(caseRes.items);
      setAuditLogs(auditRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load governance alerts and cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [severityFilter, statusFilter]);

  const handleCreateCaseFromAlert = async (anomalyItem: Anomaly) => {
    try {
      const res = await api.createCase({
        entity_type: anomalyItem.entity_type,
        entity_id: anomalyItem.entity_id,
        title: `${anomalyItem.anomaly_type.replace(/_/g, ' ')} on ${anomalyItem.entity_type} #${anomalyItem.entity_id}`,
        severity: anomalyItem.severity,
        risk_score: Math.round(anomalyItem.anomaly_score * 100),
        category: anomalyItem.anomaly_type,
        assigned_to: 'Nodal Authority',
        assigned_role: 'DISTRICT_AUTHORITY',
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: `Converted from MAD statistical anomaly: ${anomalyItem.reason}`
      });
      window.alert(`Case ${res.case_id} registered successfully.`);
      setActiveTab('CASES');
      loadData();
    } catch (err) {
      window.alert('Failed to create case');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !updateStatus) return;

    try {
      setUpdating(true);
      await api.updateCaseStatus(selectedCase.case_id, {
        new_status: updateStatus,
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: updateNotes
      });
      setSelectedCase(null);
      setUpdateNotes('');
      loadData();
    } catch (err) {
      alert('Failed to update case status');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-50 text-[#2563EB] border-blue-200',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    CLARIFICATION_REQUESTED: 'bg-purple-50 text-purple-700 border-purple-200',
    DETAILED_REVIEW: 'bg-orange-50 text-orange-700 border-orange-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-manrope">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Intelligence Center', to: '/anomalies' },
          { label: 'Risk Alerts & Case Management' },
        ]}
      />

      {/* Header & Governance Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-mono font-bold uppercase tracking-widest border border-blue-200">
                <Sparkles className="w-3 h-3 text-[#2563EB]" />
                Human-in-the-Loop Governance Suite
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                Active Perspective: {roleConfig.shortLabel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#08102B] tracking-tight">
              Risk-Based Alerts &amp; Case Management Command Center
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl font-light leading-relaxed">
              Traces public funds and project anomalies through a structured administrative lifecycle: 
              <strong> Data → AI Detection → Risk Scoring → Alert → Human Review → Action → Audit Trail</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Active Cases</span>
              <span className="text-2xl font-black font-mono text-[#08102B]">{cases.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-rose-600 block font-mono">Critical Flags</span>
              <span className="text-2xl font-black font-mono text-rose-700">21</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALERTS')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'ALERTS'
                ? 'bg-[#08102B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Alerts Feed ({alerts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CASES')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'CASES'
                ? 'bg-[#08102B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Review Cases Workflow ({cases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'AUDIT'
                ? 'bg-[#08102B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Immutable Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-20" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: ALERTS FEED */}
          {activeTab === 'ALERTS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Severity Filter:</span>
                  {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverityFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        severityFilter === s
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s || 'All Severities'}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Showing <strong>{alerts.length}</strong> prioritized alerts
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.anomaly_id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={a.severity} />
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                            {a.entity_type} #{a.entity_id}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Score: {(a.anomaly_score * 100).toFixed(1)}/100
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#08102B]">
                          {a.anomaly_type.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-xs text-slate-600 font-light leading-relaxed">
                          {a.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {a.entity_type === 'WORK' && (
                          <Link
                            to={`/works/${a.entity_id}`}
                            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                          >
                            Inspect Dossier
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCreateCaseFromAlert(a)}
                          className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Create Case</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CASES WORKFLOW */}
          {activeTab === 'CASES' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">Status Filter:</span>
                  {['', 'NEW', 'UNDER_REVIEW', 'CLARIFICATION_REQUESTED', 'DETAILED_REVIEW', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        statusFilter === st
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st ? st.replace(/_/g, ' ') : 'All Statuses'}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-slate-400">
                  {cases.length} Administrative Cases Active
                </div>
              </div>

              <div className="space-y-3">
                {cases.map((c) => (
                  <div
                    key={c.case_id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                          <SeverityBadge severity={c.severity} />
                          <span className="text-xs font-mono text-slate-400 font-bold">
                            {c.case_id} · Risk {c.risk_score}/100
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-[#08102B]">
                          {c.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                          <span>Entity: <strong>{c.entity_type} #{c.entity_id}</strong></span>
                          <span>·</span>
                          <span>Assigned: <strong className="text-slate-700">{c.assigned_to}</strong></span>
                          <span>·</span>
                          <span>Updated: {new Date(c.updated_at).toLocaleDateString()}</span>
                        </div>

                        {c.resolution_notes && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-light whitespace-pre-line mt-2">
                            {c.resolution_notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCase(c);
                            setUpdateStatus(c.status);
                            setUpdateNotes('');
                          }}
                          className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition shadow-xs"
                        >
                          Update Status / Action
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'AUDIT' && (
            <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#08102B]">
                    Constitutional Audit Trail &amp; Accountability Log
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Cryptographically ordered, append-only administrative records of every alert review and status transition.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Append-Only Immutable
                </span>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.log_id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-start gap-4 text-xs font-mono"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-sans text-xs">{log.action}</strong>
                          <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">
                            {log.case_id}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-600 font-sans text-xs">
                        {log.details}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                        <span>Actor: <strong className="text-slate-700">{log.performed_by}</strong> ({log.role})</span>
                        {log.previous_state && log.new_state && (
                          <span>Transition: <strong className="text-slate-700">{log.previous_state} → {log.new_state}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Case Status Update Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08102B]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider block">
                    Administrative Action Modal
                  </span>
                  <h3 className="text-base font-extrabold text-[#08102B]">
                    {selectedCase.case_id}: Update Lifecycle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select New Status:</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="NEW">New (Unverified)</option>
                    <option value="UNDER_REVIEW">Under Review (Committee Assigned)</option>
                    <option value="CLARIFICATION_REQUESTED">Clarification Requested (Notice Sent)</option>
                    <option value="DETAILED_REVIEW">Detailed Review / Audit Hearing</option>
                    <option value="RESOLVED">Resolved (Document/Asset Verified)</option>
                    <option value="ESCALATED">Escalated (Referred to Ministry / CAG)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Resolution / Finding Notes:</label>
                  <textarea
                    rows={4}
                    required
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Enter factual ground findings, inspection results, or clarification reference..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 font-sans leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-slate-700">
                  Logged by: <strong>{roleConfig.shortLabel}</strong>. This entry will be cryptographically appended to the public audit log.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !updateNotes.trim()}
                    className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold disabled:opacity-50 transition shadow-xs"
                  >
                    {updating ? 'Saving...' : 'Commit Action to Audit Trail'}
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
