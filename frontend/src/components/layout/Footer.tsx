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
  HeartHandshake,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121316] text-[#FAF8F5] border-t border-[#2A2C32] text-xs font-sans">
      {/* Top Reconciled Trust & Integrity Strip */}
      <div className="bg-[#0C0D0F] text-[#A1A1AA] py-3 border-b border-[#2A2C32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C85A32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C85A32]"></span>
            </span>
            <span className="text-[#FAF8F5] font-semibold">Statutory Compliance Monitor:</span>
            <span className="text-[#C85A32]">Article 9 Norms &amp; ₹0.00 Variance Guaranteed</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-stone-400 text-[11px] font-mono">
            <span className="text-[#FAF8F5]">28 States &amp; 8 UTs</span>
            <span>•</span>
            <span>778 MPs</span>
            <span>•</span>
            <span>102,437 Works</span>
            <span>•</span>
            <span className="text-[#C85A32]">Snapshot: Aug 2026</span>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory with Roman Numerals (GetCasework style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: i · Engagement & Intake */}
        <div className="space-y-3 md:col-span-1">
          <span className="font-mono text-[10px] text-[#C85A32] tracking-widest uppercase block">
            i · Intake &amp; Governance
          </span>
          <div className="inline-flex items-center pt-1">
            <BrandLogo size="md" theme="dark" />
          </div>
          <p className="text-stone-400 text-xs leading-relaxed font-light">
            AI-powered statutory monitoring and decision-support for MPLADS works. Grounded in MoSPI guidelines, CAG norms, and double-entry treasury reconciliation.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A1B1F] border border-[#2A2C32] text-stone-300 text-[10px] font-mono">
              <Activity className="w-3 h-3 text-[#C85A32]" />
              Immutable Audit Pipeline Active
            </span>
          </div>
        </div>

        {/* Col 2: ii · Four User Roles */}
        <div className="space-y-2.5">
          <span className="font-mono text-[10px] text-[#C85A32] tracking-widest uppercase block">
            ii · Four Statutory Roles
          </span>
          <ul className="space-y-2 text-stone-400 text-xs">
            <li><Link to="/dashboards?role=MINISTRY_ADMIN" className="hover:text-[#FAF8F5] transition">MoSPI Administrator (Policy &amp; Weights)</Link></li>
            <li><Link to="/dashboards?role=STATE_NODAL_AUTHORITY" className="hover:text-[#FAF8F5] transition">State Nodal Authority (Inter-District Audit)</Link></li>
            <li><Link to="/dashboards?role=DISTRICT_AUTHORITY" className="hover:text-[#FAF8F5] transition">District Authority (Collector / DM)</Link></li>
            <li><Link to="/dashboards?role=MP" className="hover:text-[#FAF8F5] transition">Member of Parliament (₹5 Cr Quota)</Link></li>
            <li><Link to="/dashboards?role=CITIZEN" className="hover:text-[#FAF8F5] transition">Citizen Transparency Watch</Link></li>
          </ul>
        </div>

        {/* Col 3: iii · Analytical Engines */}
        <div className="space-y-2.5">
          <span className="font-mono text-[10px] text-[#C85A32] tracking-widest uppercase block">
            iii · Analytical Engines
          </span>
          <ul className="space-y-2 text-stone-400 text-xs">
            <li><Link to="/cases" className="hover:text-[#FAF8F5] transition">Cases &amp; Anomaly Docket</Link></li>
            <li><Link to="/ingest" className="hover:text-[#FAF8F5] transition">Data Ingestion Pipeline (CSV/Excel)</Link></li>
            <li><Link to="/duplicates" className="hover:text-[#FAF8F5] transition">TF-IDF Duplicate Detection</Link></li>
            <li><Link to="/anomalies" className="hover:text-[#FAF8F5] transition">IsolationForest &amp; Statistical Outliers</Link></li>
            <li><Link to="/data-quality" className="hover:text-[#FAF8F5] transition">SHA-256 Provenance Ledger</Link></li>
          </ul>
        </div>

        {/* Col 4: iv · Statutory Disclosures */}
        <div className="space-y-2.5">
          <span className="font-mono text-[10px] text-[#C85A32] tracking-widest uppercase block">
            iv · Statutory Disclosures
          </span>
          <div className="p-3 rounded-lg bg-[#1A1B1F] border border-[#2A2C32] text-[11px] text-stone-400 leading-relaxed font-light">
            <strong className="text-stone-200 block mb-1 font-sans">Non-Accusatory Principle</strong>
            JanDrishti is a decision-support and audit platform. Flags represent potential risk indicators requiring field verification; they do not constitute proof of irregularity.
          </div>
          <div className="text-stone-500 text-[10px] font-mono pt-1">
            Demo Environment · Synthetic Data Reconciled
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2A2C32] bg-[#0C0D0F] py-4 text-center text-stone-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; 2026 JanDrishti Civic Intelligence Platform. Aligned with MoSPI MPLADS Guidelines.
          </div>
          <div className="flex items-center gap-4 text-stone-400 font-mono text-[10px]">
            <Link to="/methodology" className="hover:text-white transition">Audit Methodology</Link>
            <span>•</span>
            <Link to="/data-quality" className="hover:text-white transition">Data Provenance</Link>
            <span>•</span>
            <span className="text-[#C85A32]">Decision-Support Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
