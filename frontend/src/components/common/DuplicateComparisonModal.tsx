import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Building2,
  Users,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { DuplicatePair } from '../../api/types';
import { api } from '../../api/client';
import { useRole } from '../../context/RoleContext';

interface DuplicateComparisonModalProps {
  pair: DuplicatePair | null;
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated?: (caseId: string) => void;
}

export const DuplicateComparisonModal: React.FC<DuplicateComparisonModalProps> = ({
  pair,
  isOpen,
  onClose,
  onCaseCreated,
}) => {
  const { currentRole, roleConfig } = useRole();
  const [creatingCase, setCreatingCase] = useState(false);
  const [caseSuccess, setCaseSuccess] = useState<string | null>(null);
  const [distinctMarked, setDistinctMarked] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pair) return null;

  const handleInitiateCase = async () => {
    try {
      setCreatingCase(true);
      const res = await api.createCase({
        entity_type: 'WORK',
        entity_id: `${pair.work_a.work_id}`,
        title: `Duplicate Work Investigation: #${pair.work_a.work_id} vs #${pair.work_b.work_id}`,
        severity: pair.similarity_score >= 0.85 ? 'CRITICAL' : 'HIGH',
        risk_score: roundScore(pair.similarity_score * 100),
        category: 'DUPLICATE_WORK',
        assigned_to: 'Nodal District Review Committee',
        assigned_role: 'DISTRICT_AUTHORITY',
        user: roleConfig.shortLabel,
        role: currentRole,
        notes: `Automated duplicate trigger: ${pair.reasons.join(' | ')}. Requires field asset verification.`
      });
      setCaseSuccess(res.case_id);
      if (onCaseCreated) {
        onCaseCreated(res.case_id);
      }
    } catch (err) {
      window.alert('Failed to create review case. Please try again.');
    } finally {
      setCreatingCase(false);
    }
  };

  const roundScore = (num: number) => Math.round(num * 10) / 10;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#121316]/60 backdrop-blur-xs animate-fade-in font-sans"
    >
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-2xl border border-[#E4E2DC] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#121316]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E2DC] bg-[#FAF8F5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] tracking-widest text-[#C85A32] bg-[#FAF0EB] px-2.5 py-1 rounded-md border border-[#E8C5B6] uppercase font-bold">
                [FILE NO. DUP-{pair.work_a.work_id}-{pair.work_b.work_id}]
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F0EFEA] text-[#121316] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                {Math.round(pair.similarity_score * 100)}% Mathematical Overlap
              </span>
            </div>
            <h2 id="duplicate-modal-title" className="text-xl font-serif font-bold text-[#121316] tracking-tight">
              Project Record A vs Record B: Spatial &amp; Textual Overlap
            </h2>
            <p className="text-xs text-[#4A4D53] font-light">
              These two project entries share correlated textual tokens, comparable budgets, and co-located district jurisdictions.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close comparison modal"
            onClick={onClose}
            className="p-2 rounded-md text-[#71717A] hover:text-[#121316] hover:bg-[#F0EFEA] transition min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="px-6 py-2.5 bg-[#FAF0EB] border-b border-[#E8C5B6] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span className="text-[11px] leading-snug text-[#4A4D53]">
              <strong className="text-[#121316]">Objective Audit Notice:</strong> Statistical similarity indicators do not imply wrongdoing. Final determination of distinct civic utility requires field verification by designated district engineers.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8C5B6] font-mono text-[10px] font-bold text-[#C85A32] shrink-0 self-start sm:self-auto">
            Status: Human Review Required
          </span>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Side-by-Side Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Project A */}
            <div className="p-5 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#121316] text-[10px] font-mono font-bold border border-[#E4E2DC]">
                    RECORD A · WORK #{pair.work_a.work_id}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#71717A]">
                    {pair.work_a.lifecycle_status}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#121316] leading-snug">
                  {pair.work_a.title || `Public Infrastructure Scheme #${pair.work_a.work_id}`}
                </h3>

                <div className="space-y-2 text-xs pt-2 border-t border-[#E4E2DC] font-mono">
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#71717A]" /> Sector:</span>
                    <strong className="text-[#121316]">{pair.work_a.category || 'General'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#71717A]" /> Representative:</span>
                    <strong className="text-[#121316]">{pair.work_a.mp_name || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#71717A]" /> Jurisdiction:</span>
                    <strong className="text-[#121316]">{pair.work_a.constituency}, {pair.work_a.state}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#71717A]" /> Agency (IDA):</span>
                    <strong className="text-[#121316] truncate max-w-[180px]">{pair.work_a.ida || 'District Administration'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span>Fiscal Year:</span>
                    <strong className="text-[#121316]">{pair.work_a.year || '2024-25'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-xs text-[#71717A] uppercase font-mono font-bold">Estimated Cost</span>
                <span className="text-lg font-serif font-bold text-[#121316]">
                  ₹{pair.work_a.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Project B */}
            <div className="p-5 rounded-xl bg-[#F0EFEA] border border-[#E4E2DC] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6]">
                    RECORD B · WORK #{pair.work_b.work_id}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#71717A]">
                    {pair.work_b.lifecycle_status}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#121316] leading-snug">
                  {pair.work_b.title || `Public Infrastructure Scheme #${pair.work_b.work_id}`}
                </h3>

                <div className="space-y-2 text-xs pt-2 border-t border-[#E4E2DC] font-mono">
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#71717A]" /> Sector:</span>
                    <strong className="text-[#121316]">{pair.work_b.category || 'General'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#71717A]" /> Representative:</span>
                    <strong className="text-[#121316]">{pair.work_b.mp_name || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#71717A]" /> Jurisdiction:</span>
                    <strong className="text-[#121316]">{pair.work_b.constituency}, {pair.work_b.state}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-[#71717A]" /> Agency (IDA):</span>
                    <strong className="text-[#121316] truncate max-w-[180px]">{pair.work_b.ida || 'District Administration'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#4A4D53]">
                    <span>Fiscal Year:</span>
                    <strong className="text-[#121316]">{pair.work_b.year || '2024-25'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between">
                <span className="text-xs text-[#71717A] uppercase font-mono font-bold">Estimated Cost</span>
                <span className="text-lg font-serif font-bold text-[#121316]">
                  ₹{pair.work_b.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Similarities & Contributory Overlap Breakdown */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider">
                Contributory Overlap Vectors
              </span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span>Description Overlap: <strong className="text-[#121316]">{Math.round(pair.text_similarity * 100)}%</strong></span>
                <span className="text-[#71717A]">·</span>
                <span>Cost Parity: <strong className="text-[#121316]">{Math.round(pair.cost_similarity * 100)}%</strong></span>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-[#4A4D53]">
              {pair.reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E4E2DC] bg-[#F0EFEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[#4A4D53] font-mono">
            {caseSuccess ? (
              <span className="text-[#2E7D32] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                Case Registered: {caseSuccess} (Logged to Audit Trail)
              </span>
            ) : distinctMarked ? (
              <span className="text-[#121316] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                Marked as Distinct Physical Works
              </span>
            ) : (
              <span>Recommended Action: {pair.recommended_action}</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setDistinctMarked(true);
                setTimeout(onClose, 1200);
              }}
              className="px-4 py-2 rounded-lg bg-[#FAF8F5] border border-[#E4E2DC] text-[#121316] font-semibold hover:bg-[#F0EFEA] transition min-h-[38px] cursor-pointer"
            >
              Mark as Distinct
            </button>

            <button
              type="button"
              disabled={creatingCase || !!caseSuccess}
              onClick={handleInitiateCase}
              className="px-5 py-2 rounded-lg bg-[#121316] hover:bg-[#2A2C32] text-[#FAF8F5] font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50 min-h-[38px] cursor-pointer"
            >
              {creatingCase ? 'Registering...' : caseSuccess ? 'Case Active' : 'Initiate Review Case →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
