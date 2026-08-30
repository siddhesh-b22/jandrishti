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
    <footer className="bg-[#08102B] text-white border-t border-slate-800 text-xs font-manrope">
      {/* Top Reconciled Trust & Integrity Strip */}
      <div className="bg-[#040817] text-slate-300 py-3 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Democratic Transparency &amp; Citizens' Rights:{' '}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-3.5 md:col-span-1">
          <div className="inline-flex items-center">
            <BrandLogo size="md" theme="dark" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            Protecting public wealth and empowering citizens' rights. JanDrishti transforms complex parliamentary finance into transparent, double-entry verified civic intelligence.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              API Online · Read-Only Immutable Dataset
            </span>
          </div>
        </div>

        {/* Col 2: National Registries */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">National Registries</h4>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li><Link to="/mps" className="hover:text-[#3B82F6] transition font-medium">Parliamentarians (778 MPs)</Link></li>
            <li><Link to="/states" className="hover:text-[#3B82F6] transition font-medium">Spatial Atlas (28 States &amp; 8 UTs)</Link></li>
            <li><Link to="/works" className="hover:text-[#3B82F6] transition font-medium">Physical Infrastructure (102,437 Works)</Link></li>
            <li><Link to="/transactions" className="hover:text-[#3B82F6] transition font-medium">Disbursement Vouchers (82,296)</Link></li>
            <li><Link to="/vendors" className="hover:text-[#3B82F6] transition font-medium">Contractor Footprints (22,377)</Link></li>
          </ul>
        </div>

        {/* Col 3: Analytical Systems */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">Analytical Systems</h4>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li><Link to="/anomalies" className="hover:text-rose-400 transition font-medium">Signal Center (1,831 MAD Signals)</Link></li>
            <li><Link to="/anomalies?severity=CRITICAL" className="hover:text-rose-400 transition font-medium">21 Critical Priority Signals</Link></li>
            <li><Link to="/methodology" className="hover:text-blue-400 transition font-medium">Deterministic Double-Entry Ledger</Link></li>
            <li><Link to="/methodology#mad-framework" className="hover:text-blue-400 transition font-medium">MAD Z-Score Framework</Link></li>
            <li><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition font-medium inline-flex items-center gap-1">FastAPI Swagger Specs <ExternalLink className="w-3 h-3" /></a></li>
          </ul>
        </div>

        {/* Col 4: Public Audit & Integrity */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-manrope">Public Audit &amp; Rights</h4>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            All analytical figures are deterministically computed without political or subjective bias, empowering democratic transparency.
          </p>
          <div className="pt-2 text-slate-500 text-[11px] font-mono">
            <div>Engine: SQLite3 Immutable Read-Only</div>
            <div>Snapshot: 26 August 2026</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 bg-[#040817] py-4 text-center text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; 2026 JanDrishti Civic Intelligence Platform. Empowering Democratic Transparency &amp; Citizens' Rights.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/methodology" className="hover:text-white transition">Data Methodology</Link>
            <span>•</span>
            <Link to="/anomalies" className="hover:text-white transition">Audit Signals</Link>
            <span>•</span>
            <span className="text-emerald-400">₹0.00 Variance Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
