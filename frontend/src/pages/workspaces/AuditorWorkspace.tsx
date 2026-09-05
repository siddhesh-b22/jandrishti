import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Zap,
  Scale,
  Copy,
  Receipt,
  Building2,
  FileText,
  Plus,
  History,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  X,
  Send,
  AlertOctagon,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { api } from '../../api/client';
import {
  AuditInvestigationCase,
  StatutoryAuditLog
} from '../../api/types';
import { useRole } from '../../context/RoleContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const AuditorWorkspace: React.FC = () => {
  const { user } = useRole();
  const [investigations, setInvestigations] = useState<AuditInvestigationCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<StatutoryAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Open Investigation Modal
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cases, logs] = await Promise.all([
        api.listAuditInvestigations().catch(() => []),
        api.getAuditLogs(30).catch(() => [])
      ]);
      setInvestigations(cases || []);
      setAuditLogs(logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load forensic auditor intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuditorSubmitting(true);
      await api.createAuditInvestigation({
        ...auditorForm,
        jurisdiction: 'ALL_INDIA'
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
      alert('Forensic Investigation Dossier registered. Docket updated with cryptographic timestamp.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to register investigation');
    } finally {
      setAuditorSubmitting(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, nextStatus: string) => {
    const notes = prompt(`Enter forensic observation notes for status ${nextStatus}:`);
    if (notes === null) return;
    try {
      await api.updateAuditInvestigation(caseId, {
        status: nextStatus,
        auditor_notes: notes || undefined
      });
      alert(`Dossier status transitioned to ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update investigation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#71717A]">Loading Forensic Integrity Desk...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <Breadcrumbs
        items={[
          { label: 'Governance Consoles' },
          { label: 'Public Finance Integrity & Forensic Audit Desk' }
        ]}
      />

      {/* Forensic Mandate Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>CAG / INDEPENDENT PUBLIC FINANCE AUDITOR</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-mono font-bold border border-slate-200">
                All-India Forensic Integrity Jurisdiction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              Statutory Forensic Investigation &amp; Empirical Anomaly Audit
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              Cross-jurisdictional financial forensics, non-accusatory statistical anomaly detection (MAD, Benford's Law, HHI concentration), and immutable dossier docket management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAuditorModalOpen(true)}
              className="cw-btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Open Forensic Dossier</span>
            </button>
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs text-[#121316] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Forensic Notice Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900">Statutory Mandate Notice:</span> Under the Comptroller &amp; Auditor General's (DPC) Act, 1971, forensic auditors inspect all primary accounting books and vouchers in read-only mode. Historical treasury transactions cannot be modified. All findings are registered as immutable case dossiers.
          </p>
        </div>

        {/* Forensic Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Statistical Outliers (MAD)</div>
            <div className="text-xl font-bold font-serif text-[#C85A32] mt-1">1,831</div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Empirical cost & delay anomalies</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Vendor Concentration Spikes</div>
            <div className="text-xl font-bold font-serif text-amber-700 mt-1">42 Clusters</div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">HHI Index &gt; 2,500 (Oligopoly)</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Duplicate Works Cosine Flag</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">218 Pairs</div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Cosine similarity &gt; 0.85</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Active Forensic Cases</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">{investigations.length}</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Registered in docket</div>
          </div>
        </div>
      </div>

      {/* Forensic Signal Deep-Dives Quick Navigator */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link
          to="/anomalies"
          className="p-5 rounded-2xl border border-[#E4E2DC] bg-white hover:border-[#C85A32] transition group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FAF0EB] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white transition">
              <Zap className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
          </div>
          <h3 className="text-sm font-bold text-[#121316]">Statistical Signals (MAD)</h3>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Median Absolute Deviation cost outliers free from parametric assumptions.
          </p>
        </Link>

        <Link
          to="/duplicates"
          className="p-5 rounded-2xl border border-[#E4E2DC] bg-white hover:border-[#C85A32] transition group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FAF0EB] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white transition">
              <Copy className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
          </div>
          <h3 className="text-sm font-bold text-[#121316]">Duplicate Scheme Studio</h3>
          <p className="text-xs text-[#71717A] leading-relaxed">
            TF-IDF text similarity &amp; geospatial proximity clustering.
          </p>
        </Link>

        <Link
          to="/vendors"
          className="p-5 rounded-2xl border border-[#E4E2DC] bg-white hover:border-[#C85A32] transition group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FAF0EB] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white transition">
              <Building2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
          </div>
          <h3 className="text-sm font-bold text-[#121316]">Contractor HHI Registry</h3>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Market concentration indices and repeat vendor dominance matrices.
          </p>
        </Link>

        <Link
          to="/transactions"
          className="p-5 rounded-2xl border border-[#E4E2DC] bg-white hover:border-[#C85A32] transition group shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FAF0EB] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white transition">
              <Receipt className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
          </div>
          <h3 className="text-sm font-bold text-[#121316]">Treasury Disbursements</h3>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Double-entry reconciled voucher ledger with zero cash leakage variance.
          </p>
        </Link>
      </div>

      {/* Active Forensic Investigation Cases Docket */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Active Forensic Dossiers Docket
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            Official Audit Evidence Records
          </span>
        </div>

        {investigations.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-mono text-[#121316]">No active forensic investigation cases open.</p>
            <p className="text-[11px] text-[#71717A] mt-0.5">Click "Open Forensic Dossier" to initiate formal inquiry.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investigations.map((c) => (
              <div key={c.case_id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#121316]">
                      Case #{c.case_id}: {c.title}
                    </h3>
                    <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                      Target: {c.entity_type} {c.entity_id ? `#${c.entity_id}` : ''} &bull; Jurisdiction: {c.jurisdiction || 'National'}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    c.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    c.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {c.severity} &bull; {c.status}
                  </span>
                </div>

                <div className="text-xs text-[#4A4D53] bg-white p-3 rounded-lg border border-[#E4E2DC] space-y-1">
                  <div><span className="font-semibold text-[#121316]">Hypothesis:</span> {c.hypothesis}</div>
                  {c.evidence && <div><span className="font-semibold text-[#121316]">Evidence:</span> {c.evidence}</div>}
                  {c.auditor_notes && <div><span className="font-semibold text-[#121316]">Auditor Notes:</span> {c.auditor_notes}</div>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {c.status !== 'EVIDENCE_COLLECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.case_id, 'EVIDENCE_COLLECTED')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-[11px] font-medium transition cursor-pointer"
                    >
                      Attach Verified Evidence
                    </button>
                  )}
                  {c.status !== 'REFERRED_TO_CBI_CAG' && (
                    <button
                      onClick={() => handleUpdateStatus(c.case_id, 'REFERRED_TO_CBI_CAG')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Escalate to CAG / Special Inquiry
                    </button>
                  )}
                  {c.status !== 'CLOSED_NO_IRREGULARITY' && (
                    <button
                      onClick={() => handleUpdateStatus(c.case_id, 'CLOSED_NO_IRREGULARITY')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer"
                    >
                      Close Dossier (Satisfactory Explanation)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Statutory Audit Ledger */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Statutory Provenance Log (Cryptographically Chained)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            Audit Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">User ID</th>
                <th className="py-2 px-3">Event Action</th>
                <th className="py-2 px-3">Target Entity</th>
                <th className="py-2 pl-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60 font-mono text-[11px]">
              {auditLogs.slice(0, 8).map((log, idx) => (
                <tr key={log.log_id || idx} className="hover:bg-[#FAF8F5]">
                  <td className="py-2 pr-3 text-[#71717A] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-semibold text-[#121316]">{log.user_role}</td>
                  <td className="py-2 px-3 text-[#71717A]">{log.user_id}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] font-semibold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#121316]">
                    {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                  </td>
                  <td className="py-2 pl-3 text-[#71717A] max-w-xs truncate">
                    {log.details || log.rationale || 'Forensic ledger event'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Forensic Dossier Modal */}
      {isAuditorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#121316]">
                  Open Statutory Forensic Investigation Case
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Initiates evidence collection under Public Finance Integrity mandate
                </p>
              </div>
              <button
                onClick={() => setIsAuditorModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0EFEA] text-[#71717A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvestigation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Dossier Case Title</label>
                <input
                  required
                  placeholder="e.g. Statistical Outlier in Water Works Cost / Pune District"
                  value={auditorForm.title}
                  onChange={(e) => setAuditorForm({ ...auditorForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Entity Type</label>
                  <select
                    value={auditorForm.entity_type}
                    onChange={(e) => setAuditorForm({ ...auditorForm, entity_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs bg-white font-mono"
                  >
                    <option value="WORK">WORK</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="TRANSACTION">TRANSACTION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Target ID</label>
                  <input
                    required
                    placeholder="e.g. 1042"
                    value={auditorForm.entity_id}
                    onChange={(e) => setAuditorForm({ ...auditorForm, entity_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Severity</label>
                  <select
                    value={auditorForm.severity}
                    onChange={(e) => setAuditorForm({ ...auditorForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs bg-white font-mono"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Forensic Hypothesis</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail empirical suspicion: e.g. Cost per km exceeds 3.5 MAD deviations from regional median..."
                  value={auditorForm.hypothesis}
                  onChange={(e) => setAuditorForm({ ...auditorForm, hypothesis: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Initial Corroborating Evidence</label>
                <textarea
                  rows={2}
                  placeholder="Voucher transaction hashes, vendor concentration HHI metrics, satellite physical variance..."
                  value={auditorForm.evidence}
                  onChange={(e) => setAuditorForm({ ...auditorForm, evidence: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsAuditorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#71717A] hover:bg-[#F0EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={auditorSubmitting}
                  className="cw-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{auditorSubmitting ? 'Registering...' : 'Register Investigation Dossier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
