import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Database,
  Lock,
  Mail,
  Phone,
  Sparkles,
  Building,
  Landmark,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1120] text-white border-t border-slate-800 text-xs">
      {/* Top Reconciled Trust Strip */}
      <div className="bg-[#0F172A] text-slate-300 py-3.5 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              National Public Exchequer Reconciliation:{' '}
              <strong className="text-emerald-400 font-mono">₹0.00 Variance Guaranteed</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            <span className="text-white font-bold">28 States &amp; 8 UTs</span>
            <span>•</span>
            <span>778 MPs</span>
            <span>•</span>
            <span>102,437 Works</span>
            <span>•</span>
            <span>82,296 Vouchers</span>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-4 md:col-span-1">
          <div className="inline-flex items-center p-2.5 px-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/40">
            <BrandLogo size="md" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Empowering citizens and public auditors with transparent, deterministic financial intelligence across India's parliamentary development funds.
          </p>
        </div>

        {/* Col 2: National Registries */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">National Registries</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/mps" className="hover:text-blue-400 transition">Parliamentarians (778 MPs)</Link></li>
            <li><Link to="/states" className="hover:text-blue-400 transition">Spatial Atlas (28 States &amp; 8 UTs)</Link></li>
            <li><Link to="/works" className="hover:text-blue-400 transition">Physical Works (102,437 Works)</Link></li>
            <li><Link to="/transactions" className="hover:text-blue-400 transition">Disbursement Vouchers (82,296)</Link></li>
            <li><Link to="/vendors" className="hover:text-blue-400 transition">Contractor Intelligence (22,377)</Link></li>
          </ul>
        </div>

        {/* Col 3: Analytical Systems */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Analytical Systems</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/anomalies" className="hover:text-rose-400 transition">Signal Center (1,831 Signals)</Link></li>
            <li><Link to="/methodology" className="hover:text-blue-400 transition">Technical Methodology</Link></li>
            <li><Link to="/methodology" className="hover:text-blue-400 transition">MAD Robust Z-Score Algorithms</Link></li>
            <li><Link to="/methodology" className="hover:text-blue-400 transition">Double-Entry Ledger Verification</Link></li>
          </ul>
        </div>

        {/* Col 4: About JanDrishti */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">About JanDrishti</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            An open civic intelligence platform built to make public spending transparent, verifiable, and understandable for every Indian citizen.
          </p>
          <div className="pt-1 space-y-2 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Official MoSPI &amp; eSAKSHI Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">transparency@jandrishti.org</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800/80 py-4 text-center text-slate-400 text-[11px]">
        © 2026 JanDrishti Civic Intelligence Platform · Built for Public Transparency &amp; Democratic Accountability.
      </div>
    </footer>
  );
};
