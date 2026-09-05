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

  const getFileNumber = () => {
    switch (entity.type) {
      case 'STATE':
        return `STA-${entity.data.state.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}`;
      case 'MP':
        return `MP-${entity.data.internal_mp_id || entity.data.mp_name_normalized.slice(0, 4).toUpperCase()}`;
      case 'WORK':
        return `WRK-${entity.data.work_id}`;
      case 'TRANSACTION':
        return `VOU-${entity.data.internal_transaction_id}`;
      case 'VENDOR':
        return `VEN-${entity.data.vendor_name_normalized.slice(0, 6).toUpperCase()}`;
      case 'SIGNAL':
        return `SIG-${entity.data.anomaly_id || entity.data.entity_id}`;
      default:
        return 'REC-0000';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#121316]/50 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-out Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl z-10 flex flex-col border-l border-[#E4E2DC] overflow-hidden text-[#121316]"
        >
          {/* Header with Archival Stamping */}
          <div className="p-5 border-b border-[#E4E2DC] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] tracking-widest text-[#C85A32] bg-[#FAF0EB] px-2.5 py-1 rounded-md border border-[#E8C5B6] uppercase font-bold">
                [FILE NO. {getFileNumber()}]
              </span>
              <span className="text-xs font-mono text-[#71717A]">· Connected Dossier</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[#F0EFEA] text-[#71717A] hover:text-[#121316] transition"
              aria-label="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body with Progressive Disclosure */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. STATE DOSSIER */}
            {entity.type === 'STATE' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> 28 States &amp; 8 UTs · Territorial Ledger
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#121316] leading-tight">
                    {entity.data.state}
                  </h2>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    Consolidated territorial fiscal summary across Lok Sabha constituencies and Rajya Sabha representation.
                  </p>
                </div>

                {/* Primary Financial Ledger Bento Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Statutory Quota</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 01</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#121316] block">
                      ₹{(entity.data.total_allocated_amount / 1e7).toFixed(2)} Cr
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Central MoSPI Limit</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Disbursed</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 02</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#C85A32] block">
                      ₹{(entity.data.total_expenditure / 1e7).toFixed(2)} Cr
                    </strong>
                    <span className="font-mono text-[10px] text-[#2E7D32] font-semibold">
                      {entity.data.state_utilization_pct.toFixed(1)}% Disbursed
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#4A4D53]">Territorial Utilization:</span>
                    <strong className="text-[#121316] font-bold">{entity.data.state_utilization_pct.toFixed(1)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E4E2DC] overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, entity.data.state_utilization_pct)}%` }}
                      className="bg-[#C85A32] h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                    <span>Target: 100%</span>
                    <span>Unspent: ₹{((entity.data.total_allocated_amount - entity.data.total_expenditure) / 1e7).toFixed(2)} Cr</span>
                  </div>
                </div>

                {/* Physical Works Execution */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2.5 text-xs font-mono">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Physical Asset Execution</div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Recommended Works:</span>
                    <strong className="text-[#121316]">{entity.data.total_recommended_works.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Completed &amp; Commissioned:</span>
                    <strong className="text-[#2E7D32]">{entity.data.total_completed_works.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Ground Completion Ratio:</span>
                    <strong className="text-[#121316]">{entity.data.state_completion_rate_pct.toFixed(1)}%</strong>
                  </div>
                </div>

                {/* Connected Navigation Links */}
                <div className="pt-2 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Connected Registries</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/mps?state=${encodeURIComponent(entity.data.state)}`}
                      onClick={onClose}
                      className="p-3 rounded-lg border border-[#E4E2DC] bg-[#FAF8F5] hover:bg-[#F0EFEA] text-xs font-semibold text-[#121316] flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#71717A]" /> MPs ({entity.data.total_mps})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C85A32]" />
                    </Link>
                    <Link
                      to={`/works?state=${encodeURIComponent(entity.data.state)}`}
                      onClick={onClose}
                      className="p-3 rounded-lg border border-[#E4E2DC] bg-[#FAF8F5] hover:bg-[#F0EFEA] text-xs font-semibold text-[#121316] flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#2E7D32]" /> Works</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C85A32]" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MP DOSSIER */}
            {entity.type === 'MP' && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#F0EFEA] border border-[#E4E2DC] shrink-0 flex items-center justify-center">
                    {entity.data.photo_url ? (
                      <img
                        src={entity.data.photo_url}
                        alt={entity.data.mp_name_normalized}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="font-serif font-bold text-[#71717A] text-xl">{entity.data.mp_name_normalized[0]}</span>
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-[#C85A32] uppercase">
                        {entity.data.house === 'LOK_SABHA' ? '18th Lok Sabha' : 'Rajya Sabha'}
                      </span>
                      {entity.data.party && (
                        <span className="px-2 py-0.5 rounded-full bg-[#F0EFEA] text-[#121316] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                          {entity.data.party}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[#121316] leading-tight truncate">
                      {entity.data.mp_name_normalized}
                    </h2>
                    <p className="text-xs text-[#4A4D53] font-light truncate">
                      {entity.data.constituency_normalized ? `${entity.data.constituency_normalized}, ` : ''}{entity.data.state_normalized}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                {(entity.data.email || entity.data.contact_number) && (
                  <div className="p-3.5 rounded-xl bg-[#FAF0EB] border border-[#E8C5B6] space-y-1.5 text-xs">
                    {entity.data.email && (
                      <div className="flex items-center gap-1.5 text-[#4A4D53] truncate">
                        <span className="text-[#71717A] font-mono text-[10px] uppercase font-bold">Email:</span>
                        <a href={`mailto:${entity.data.email.split(',')[0].trim()}`} className="text-[#C85A32] font-medium hover:underline truncate">
                          {entity.data.email.split(',')[0].trim()}
                        </a>
                      </div>
                    )}
                    {entity.data.contact_number && (
                      <div className="flex items-center gap-1.5 text-[#4A4D53]">
                        <span className="text-[#71717A] font-mono text-[10px] uppercase font-bold">Phone:</span>
                        <a href={`tel:${entity.data.contact_number}`} className="font-mono font-bold text-[#121316] hover:underline">
                          {entity.data.contact_number}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Financial Bento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Statutory Quota</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 01</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#121316] block">
                      ₹{((entity.data.allocated_amount || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Statutory Cap</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Disbursed</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 02</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#C85A32] block">
                      ₹{((entity.data.total_expenditure || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                    <span className="font-mono text-[10px] text-[#2E7D32] font-semibold">
                      {entity.data.utilization_pct ? `${entity.data.utilization_pct.toFixed(1)}% Utilized` : 'Audited'}
                    </span>
                  </div>
                </div>

                {/* Physical Milestones */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2.5 text-xs font-mono">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Parliamentary Portfolio</div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Recommended Works:</span>
                    <strong className="text-[#121316]">{entity.data.recommended_works_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Completed &amp; Commissioned:</span>
                    <strong className="text-[#2E7D32]">{entity.data.completed_works_count || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Treasury Vouchers:</span>
                    <strong className="text-[#C85A32]">{entity.data.transaction_count || 0} disbursements</strong>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <Link
                    to={`/mps/${entity.data.internal_mp_id}`}
                    onClick={onClose}
                    className="w-full p-3.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>View Full Parliamentary Profile →</span>
                    <Users className="w-4 h-4 text-[#C85A32]" />
                  </Link>
                  <Link
                    to={`/works?mp=${encodeURIComponent(entity.data.mp_name_normalized)}`}
                    onClick={onClose}
                    className="w-full p-3 rounded-lg bg-[#F0EFEA] hover:bg-[#E4E2DC] text-[#121316] text-xs font-semibold flex items-center justify-between transition border border-[#E4E2DC]"
                  >
                    <span>Inspect Ground Physical Works ({entity.data.recommended_works_count || 0})</span>
                    <Layers className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                </div>
              </div>
            )}

            {/* 3. WORK DOSSIER */}
            {entity.type === 'WORK' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" /> {entity.data.category_normalized || 'COMMUNITY ASSET'}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#121316] leading-snug">
                    {entity.data.work_description_normalized || `Work #${entity.data.work_id}`}
                  </h2>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    {entity.data.constituency_normalized ? `${entity.data.constituency_normalized}, ` : ''}{entity.data.state_normalized} · MP: {entity.data.mp_name_normalized}
                  </p>
                </div>

                {/* Outlay Bento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Sanctioned Outlay</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 01</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#121316] block">
                      ₹{(((entity.data.sanctioned_amount || entity.data.recommended_amount || entity.data.final_amount || 0)) / 1e5).toFixed(2)} L
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Technical Sanction</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Disbursed</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 02</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#C85A32] block">
                      ₹{(((entity.data.final_amount || entity.data.recommended_amount || 0)) / 1e5).toFixed(2)} L
                    </strong>
                    <span className="font-mono text-[10px] text-[#2E7D32] font-semibold">
                      {entity.data.lifecycle_status}
                    </span>
                  </div>
                </div>

                {/* Lifecycle & Ground Details */}
                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Lifecycle Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-bold text-[10px] border border-[#E8C5B6]">
                      {entity.data.lifecycle_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Implementing Agency:</span>
                    <strong className="text-[#121316] truncate max-w-[200px]">{entity.data.ida_normalized || 'District Collectorate'}</strong>
                  </div>
                  {entity.data.work_contractor && (
                    <div className="flex justify-between">
                      <span className="text-[#4A4D53]">Contractor / Vendor:</span>
                      <strong className="text-[#121316] truncate max-w-[200px]">{entity.data.work_contractor}</strong>
                    </div>
                  )}
                  {entity.data.village && (
                    <div className="flex justify-between">
                      <span className="text-[#4A4D53]">Village / Locality:</span>
                      <strong className="text-[#121316]">{entity.data.village}</strong>
                    </div>
                  )}
                </div>

                {/* Action Link */}
                <div className="pt-2">
                  <Link
                    to={`/works/${entity.data.work_id}`}
                    onClick={onClose}
                    className="w-full p-3.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Inspect Full 360° Project Dossier &amp; Vouchers →</span>
                    <ArrowRight className="w-4 h-4 text-[#C85A32]" />
                  </Link>
                </div>
              </div>
            )}

            {/* 4. TRANSACTION / VOUCHER DOSSIER */}
            {entity.type === 'TRANSACTION' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                    <Receipt className="w-3.5 h-3.5" /> Treasury Line-Item Voucher
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#121316] leading-snug">
                    Voucher #{entity.data.internal_transaction_id}
                  </h2>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    Disbursed to {entity.data.vendor_name_normalized || 'Designated Implementing Agency'} · MP: {entity.data.mp_name_normalized}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Voucher Amount</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 01</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#C85A32] block">
                      ₹{((entity.data.expenditure_amount || 0) / 1e5).toFixed(2)} Lakh
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Verified Treasury Release</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Disbursement Date</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 02</span>
                    </div>
                    <strong className="text-sm font-mono font-bold text-[#121316] block mt-1">
                      {entity.data.expenditure_date || 'Reconciled'}
                    </strong>
                    <span className="font-mono text-[10px] text-[#2E7D32] font-semibold">Zero Variance</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Beneficiary Vendor:</span>
                    <strong className="text-[#121316] truncate max-w-[200px]">{entity.data.vendor_name_normalized || 'Nodal Agency'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Implementing Agency:</span>
                    <strong className="text-[#121316] truncate max-w-[200px]">{entity.data.ida_normalized || 'District Authority'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Payment Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] font-bold text-[10px] border border-[#E8C5B6]">
                      {entity.data.payment_status || 'SUCCESS'}
                    </span>
                  </div>
                  {entity.data.activity_description_normalized && (
                    <div className="flex justify-between">
                      <span className="text-[#4A4D53]">Activity Description:</span>
                      <strong className="text-[#121316] truncate max-w-[200px]">{entity.data.activity_description_normalized}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    to="/transactions"
                    onClick={onClose}
                    className="w-full p-3.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Inspect in Treasury Voucher Registry →</span>
                    <ArrowRight className="w-4 h-4 text-[#C85A32]" />
                  </Link>
                </div>
              </div>
            )}

            {/* 5. VENDOR DOSSIER */}
            {entity.type === 'VENDOR' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" /> Contractor &amp; Vendor Registry
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#121316] leading-snug">{entity.data.vendor_name_normalized}</h2>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    Primary Jurisdiction: {entity.data.primary_state || 'National Contractor'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Total Received</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 01</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#121316] block">
                      ₹{((entity.data.total_received_amount || 0) / 1e7).toFixed(2)} Cr
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Cumulative Inflow</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">Disbursements</span>
                      <span className="font-mono text-[10px] text-[#71717A]">/ 02</span>
                    </div>
                    <strong className="text-lg font-serif font-bold text-[#C85A32] block">
                      {entity.data.total_transaction_count || 0}
                    </strong>
                    <span className="font-mono text-[10px] text-[#71717A]">Treasury Vouchers</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] space-y-2.5 text-xs font-mono">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Procurement Concentration</div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Single-Patron Reliance:</span>
                    <strong className="text-[#121316]">{entity.data.single_mp_reliance_pct ? `${entity.data.single_mp_reliance_pct.toFixed(1)}%` : 'Audited'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Representatives Served:</span>
                    <strong className="text-[#121316]">{entity.data.unique_mps_served} MPs</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/vendors"
                    onClick={onClose}
                    className="w-full p-3.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Inspect in Contractor Registry →</span>
                    <ArrowRight className="w-4 h-4 text-[#C85A32]" />
                  </Link>
                </div>
              </div>
            )}

            {/* 6. SIGNAL DOSSIER */}
            {entity.type === 'SIGNAL' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" /> Statistical Divergence Signal
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#121316] leading-snug">{entity.data.anomaly_type}</h2>
                  <p className="text-xs text-[#4A4D53] font-light leading-relaxed">
                    Severity: <span className="font-bold text-[#C85A32]">{entity.data.severity}</span> · Entity ID: {entity.data.entity_id}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF0EB] border border-[#E8C5B6] space-y-2 text-xs font-mono">
                  <div className="text-[10px] font-bold uppercase text-[#C85A32]">MAD Mathematical Computation</div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Robust Z-Score:</span>
                    <strong className="text-[#121316]">{entity.data.robust_zscore?.toFixed(2) || 'N/A'}σ</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Peer Group Baseline:</span>
                    <span className="text-[#121316]">{entity.data.baseline_reference || 'National Cohort'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4D53]">Detection Rationale:</span>
                    <span className="text-[#121316] font-medium text-right max-w-[240px]">{entity.data.reason}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] text-xs text-[#4A4D53] leading-relaxed">
                  <strong className="text-[#121316] block mb-1 font-mono text-[10px] uppercase tracking-wider">Statutory Audit Protocol:</strong>
                  A statistical signal represents mathematical divergence from peer group medians. Signals isolate unusual data distributions for administrative audit and do not constitute proof of irregularity.
                </div>

                <div className="pt-2">
                  <Link
                    to="/cases"
                    onClick={onClose}
                    className="w-full p-3.5 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Open Case in Human-in-the-Loop Docket →</span>
                    <ArrowRight className="w-4 h-4 text-[#C85A32]" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Provenance */}
          <div className="p-4 border-t border-[#E4E2DC] bg-[#FAF8F5] flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" /> Reconciled Statutory Record
            </span>
            <span className="font-bold text-[#121316]">JanDrishti · MoSPI</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

