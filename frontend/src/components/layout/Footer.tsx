import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Database,
  Mail,
  Zap,
  CheckCircle2,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#08102B] text-white border-t border-slate-800 text-xs font-manrope">
      {/* Top Reconciled Trust & Integrity Strip */}
      <div className="bg-[#040817] text-slate-300 py-3.5 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              National Public Exchequer Reconciliation:{' '}
              <strong className="text-emerald-400 font-mono font-extrabold">₹0.00 Variance Guaranteed</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 text-[11px] font-mono">
            <span className="text-white font-extrabold">28 States &amp; 8 UTs</span>
            <span>•</span>
            <span>778 MPs</span>
            <span>•</span>
            <span>102,437 Works</span>
            <span>•</span>
            <span>82,296 Vouchers</span>
            <span>•</span>
            <span className="text-emerald-400">Data Snapshot: 26 Aug 2026</span>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-4 md:col-span-1">
          <div className="inline-flex items-center p-2.5 px-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/40">
            <BrandLogo size="md" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            Indian Public Finance is complex. JanDrishti makes it transparent, verifiable, and understandable for every citizen and auditor.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              API Online · Immutable Read-Only Engine
            </span>
          </div>
        </div>

        {/* Col 2: National Registries */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">National Registries</h4>
          <ul className="space-y-2.5 text-slate-400 text-xs">
            <li><Link to="/mps" className="hover:text-[#3B82F6] transition font-medium">Parliamentarians (778 MPs)</Link></li>
            <li><Link to="/states" className="hover:text-[#3B82F6] transition font-medium">Spatial Atlas (28 States &amp; 8 UTs)</Link></li>
            <li><Link to="/works" className="hover:text-[#3B82F6] transition font-medium">Physical Infrastructure (102,437 Works)</Link></li>
            <li><Link to="/transactions" className="hover:text-[#3B82F6] transition font-medium">Disbursement Vouchers (82,296)</Link></li>
            <li><Link to="/vendors" className="hover:text-[#3B82F6] transition font-medium">Contractor Footprints (22,377)</Link></li>
          </ul>
        </div>

        {/* Col 3: Analytical Systems */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">Analytical Systems</h4>
          <ul className="space-y-2.5 text-slate-400 text-xs">
            <li><Link to="/anomalies" className="hover:text-rose-400 transition font-medium">Signal Center (1,831 MAD Signals)</Link></li>
            <li><Link to="/methodology" className="hover:text-[#3B82F6] transition font-medium">Technical Methodology &amp; Proofs</Link></li>
            <li><Link to="/methodology" className="hover:text-[#3B82F6] transition font-medium">MAD Robust Z-Score Algorithms</Link></li>
            <li><Link to="/methodology" className="hover:text-[#3B82F6] transition font-medium">Double-Entry Ledger Verification</Link></li>
          </ul>
        </div>

        {/* Col 4: About JanDrishti */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">About JanDrishti</h4>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            An open civic intelligence platform built with modern data forensics to audit public spending from parliamentary authorization to ground delivery.
          </p>
          <div className="pt-2 space-y-2 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Official MoSPI &amp; eSAKSHI Datasets</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">transparency@jandrishti.org</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="border-t border-slate-800/80 py-6 text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} JanDrishti Civic Data Intelligence. Built for transparent, accountable governance in the Republic of India.
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>28 States &amp; 8 UTs</span>
            <span>•</span>
            <span>Non-Accusatory Statistical Signals</span>
            <span>•</span>
            <Link to="/methodology" className="hover:text-slate-300 transition">Methodology</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
