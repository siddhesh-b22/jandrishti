import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Users,
  IndianRupee,
  Layers,
  Receipt,
  Building2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { StateSummary, MP, Work, Transaction, Vendor, Anomaly } from '../../api/types';

export type DossierEntity =
  | { type: 'STATE'; data: StateSummary }
  | { type: 'MP'; data: MP }
  | { type: 'WORK'; data: Work }
  | { type: 'TRANSACTION'; data: Transaction }
  | { type: 'VENDOR'; data: Vendor }
  | { type: 'SIGNAL'; data: Anomaly };

interface EntityDossierDrawerProps {
  entity: DossierEntity | null;
  onClose: () => void;
}

export const EntityDossierDrawer: React.FC<EntityDossierDrawerProps> = ({ entity, onClose }) => {
  const navigate = useNavigate();

  if (!entity) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-950/40 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-out Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col border-l border-warm-border overflow-hidden text-navy-950"
        >
          {/* Header */}
          <div className="p-5 border-b border-warm-border flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-navy-950 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                {entity.type} DOSSIER
              </span>
              <span className="text-xs font-mono text-slate-500">· Connected Evidence</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body with Progressive Disclosure */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STATE DOSSIER */}
            {entity.type === 'STATE' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-saffron-600 uppercase">
                    <MapPin className="w-3.5 h-3.5" /> 28 States &amp; 8 UTs
                  </div>
                  <h2 className="text-2xl font-black text-navy-950 font-display">{entity.data.state}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Consolidated territorial overview across Lok Sabha constituencies and Rajya Sabha representation.
                  </p>
                </div>

                {/* Primary Financial Ledger */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Allocated Limit</span>
                    <strong className="text-lg font-black text-navy-950">
                      ₹{(entity.data.total_allocated_amount / 1e7).toFixed(2)} Cr
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Disbursed</span>
                    <strong className="text-lg font-black text-brand-600">
                      ₹{(entity.data.total_expenditure / 1e7).toFixed(2)} Cr
                    </strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Utilization Rate:</span>
                    <strong className="text-navy-950 font-bold">{entity.data.state_utilization_pct.toFixed(1)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, entity.data.state_utilization_pct)}%` }}
                      className="bg-brand-600 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Physical Works Execution */}
                <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-2 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Physical Infrastructure</div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Proposed Works:</span>
                    <strong className="text-navy-950">{entity.data.total_recommended_works.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completed Works:</span>
                    <strong className="text-emerald-700">{entity.data.total_completed_works.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completion Rate:</span>
                    <strong className="text-navy-950">{entity.data.state_completion_rate_pct.toFixed(1)}%</strong>
                  </div>
                </div>

                {/* Connected Exploration Buttons */}
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">Connected Entities</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/mps?state=${encodeURIComponent(entity.data.state)}`}
                      onClick={onClose}
                      className="p-3 rounded-xl border border-warm-border hover:border-navy-950 text-xs font-bold text-navy-950 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" /> MPs ({entity.data.total_mps})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/works?state=${encodeURIComponent(entity.data.state)}`}
                      onClick={onClose}
                      className="p-3 rounded-xl border border-warm-border hover:border-navy-950 text-xs font-bold text-navy-950 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-emerald-600" /> Works</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* MP DOSSIER */}
            {entity.type === 'MP' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-navy-950 uppercase">
                    <Users className="w-3.5 h-3.5" /> {entity.data.house === 'LOK_SABHA' ? '18th Lok Sabha' : 'Rajya Sabha'}
                  </div>
                  <h2 className="text-2xl font-black text-navy-950 font-display">{entity.data.mp_name_normalized}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {entity.data.constituency_normalized ? `${entity.data.constituency_normalized}, ` : ''}{entity.data.state_normalized}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Allocated</span>
                    <strong className="text-lg font-black text-navy-950">
                      ₹{((entity.data.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Disbursed</span>
                    <strong className="text-lg font-black text-brand-600">
                      ₹{((entity.data.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-2 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Implementation Milestone</div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Recommended Works:</span>
                    <strong className="text-navy-950">{entity.data.recommended_works_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completed Works:</span>
                    <strong className="text-emerald-700">{entity.data.completed_works_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Disbursement Transactions:</span>
                    <strong className="text-brand-600">{entity.data.transaction_count || 0} vouchers</strong>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    to={`/works?mp=${encodeURIComponent(entity.data.mp_name_normalized)}`}
                    onClick={onClose}
                    className="w-full p-3 rounded-xl bg-navy-950 text-white text-xs font-bold flex items-center justify-between hover:bg-slate-800 transition"
                  >
                    <span>Inspect MP Physical Works →</span>
                    <Layers className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* WORK DOSSIER */}
            {entity.type === 'WORK' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 uppercase">
                    <Layers className="w-3.5 h-3.5" /> {entity.data.category_normalized}
                  </div>
                  <h2 className="text-xl font-black text-navy-950 font-display leading-snug">
                    {entity.data.work_description_normalized || `Work #${entity.data.work_id}`}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {entity.data.constituency_normalized}, {entity.data.state_normalized} · MP: {entity.data.mp_name_normalized}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Recommended Cost:</span>
                    <strong className="text-navy-950">₹{((entity.data.recommended_amount || 0) / 1e5).toFixed(2)} Lakh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sanctioned Amount:</span>
                    <strong className="text-brand-600">₹{((entity.data.sanctioned_amount || 0) / 1e5).toFixed(2)} Lakh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lifecycle Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {entity.data.lifecycle_status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VENDOR DOSSIER */}
            {entity.type === 'VENDOR' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-700 uppercase">
                    <Building2 className="w-3.5 h-3.5" /> Contractor Registry
                  </div>
                  <h2 className="text-xl font-black text-navy-950 font-display leading-snug">{entity.data.vendor_name_normalized}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {entity.data.primary_state || 'National Contractor'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Received</span>
                    <strong className="text-lg font-black text-navy-950">
                      ₹{((entity.data.total_received_amount || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Disbursement Count</span>
                    <strong className="text-lg font-black text-brand-600">
                      {entity.data.total_transaction_count || 0} Txns
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-warm-canvas border border-warm-border space-y-2 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Procurement Concentration</div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Single-Patron Reliance:</span>
                    <strong className="text-navy-950">{entity.data.single_mp_reliance_pct ? `${entity.data.single_mp_reliance_pct.toFixed(1)}%` : 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Representatives Served:</span>
                    <strong className="text-navy-950">{entity.data.unique_mps_served} MPs</strong>
                  </div>
                </div>
              </div>
            )}

            {/* SIGNAL DOSSIER */}
            {entity.type === 'SIGNAL' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-coral-700 uppercase">
                    <ShieldAlert className="w-3.5 h-3.5" /> Statistical Divergence
                  </div>
                  <h2 className="text-xl font-black text-navy-950 font-display leading-snug">{entity.data.anomaly_type}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Severity: <span className="font-bold text-coral-700">{entity.data.severity}</span> · Entity ID: {entity.data.entity_id}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-coral-50 border border-coral-200 space-y-2 text-xs font-mono text-coral-950">
                  <div className="text-[10px] font-bold uppercase text-coral-700">MAD Mathematical Calculation</div>
                  <div className="flex justify-between">
                    <span>Robust Z-Score:</span>
                    <strong className="text-coral-900">{entity.data.robust_zscore?.toFixed(2) || 'N/A'}σ</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Peer Group Baseline:</span>
                    <span>{entity.data.baseline_reference || 'National Cohort'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reason:</span>
                    <span className="text-slate-700">{entity.data.reason}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-warm-canvas border border-warm-border text-xs text-slate-600">
                  <strong>OBJECTIVE AUDIT NOTE:</strong> A statistical signal represents mathematical divergence from peer group medians. Signals isolate unusual data distributions for administrative audit and do not constitute proof of wrongdoing.
                </div>
              </div>
            )}
          </div>

          {/* Footer Provenance */}
          <div className="p-4 border-t border-warm-border bg-[#FAF8F5] flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Reconciled Ledger Record
            </span>
            <span className="font-bold text-navy-950">JanDrishti</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
