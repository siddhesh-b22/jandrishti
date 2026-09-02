import React, { useState } from 'react';
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
      alert('Failed to create review case. Please try again.');
    } finally {
      setCreatingCase(false);
    }
  };

  const roundScore = (num: number) => Math.round(num * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#08102B]/80 backdrop-blur-md animate-fade-in font-manrope">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase tracking-widest border border-amber-200">
                <Copy className="w-3 h-3 text-amber-600" />
                Comparative Overlap Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                {Math.round(pair.similarity_score * 100)}% Similarity Score
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#08102B] tracking-tight">
              Project A vs Project B: Duplicate Work Review
            </h2>
            <p className="text-xs text-slate-500 font-light">
              Objective comparison of ground projects flagged with substantial description, spatial, and cost alignment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[11px] leading-snug">
              <strong>Responsible Governance Protocol:</strong> This system identifies mathematical similarity indicators. Final verification of separate asset utility is determined by authorized district engineers.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-mono text-[10px] font-bold text-amber-800 shrink-0">
            Status: Requires Review
          </span>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Side-by-Side Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Project A */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-[10px] font-mono font-bold">
                    RECORD A · WORK #{pair.work_a.work_id}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {pair.work_a.lifecycle_status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#08102B] leading-snug">
                  {pair.work_a.title || `Public Infrastructure Scheme #${pair.work_a.work_id}`}
                </h3>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Category:</span>
                    <strong className="text-slate-900">{pair.work_a.category || 'General'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Parliamentarian:</span>
                    <strong className="text-slate-900">{pair.work_a.mp_name || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:</span>
                    <strong className="text-slate-900">{pair.work_a.constituency}, {pair.work_a.state}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Agency (IDA):</span>
                    <strong className="text-slate-900 truncate max-w-[180px]">{pair.work_a.ida || 'District Administration'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Year:</span>
                    <strong className="text-slate-900">{pair.work_a.year || '2024-25'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-mono font-bold">Estimated Outlay</span>
                <span className="text-lg font-black font-mono text-[#08102B]">
                  ₹{pair.work_a.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Project B */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-[10px] font-mono font-bold">
                    RECORD B · WORK #{pair.work_b.work_id}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {pair.work_b.lifecycle_status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#08102B] leading-snug">
                  {pair.work_b.title || `Public Infrastructure Scheme #${pair.work_b.work_id}`}
                </h3>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Category:</span>
                    <strong className="text-slate-900">{pair.work_b.category || 'General'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Parliamentarian:</span>
                    <strong className="text-slate-900">{pair.work_b.mp_name || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:</span>
                    <strong className="text-slate-900">{pair.work_b.constituency}, {pair.work_b.state}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Agency (IDA):</span>
                    <strong className="text-slate-900 truncate max-w-[180px]">{pair.work_b.ida || 'District Administration'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Year:</span>
                    <strong className="text-slate-900">{pair.work_b.year || '2024-25'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-mono font-bold">Estimated Outlay</span>
                <span className="text-lg font-black font-mono text-[#08102B]">
                  ₹{pair.work_b.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Explainable AI Reasons & Overlap Breakdown */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                CONTRIBUTORY SIMILARITY FACTORS
              </span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span>Text Overlap: <strong>{Math.round(pair.text_similarity * 100)}%</strong></span>
                <span>·</span>
                <span>Cost Parity: <strong>{Math.round(pair.cost_similarity * 100)}%</strong></span>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-700">
              {pair.reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            {caseSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Case Registered: {caseSuccess} (Logged to Audit Trail)
              </span>
            ) : (
              <span>Recommended: {pair.recommended_action}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              type="button"
              disabled={creatingCase || !!caseSuccess}
              onClick={handleInitiateCase}
              className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {creatingCase ? 'Registering...' : caseSuccess ? 'Case Active' : 'Initiate Review Case →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
