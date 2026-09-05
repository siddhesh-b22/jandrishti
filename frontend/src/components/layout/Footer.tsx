import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ExternalLink, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121316] text-[#FAF8F5] border-t border-[#2A2C32] text-xs font-sans">
      {/* Top Reconciled Trust & Integrity Strip */}
      <div className="bg-[#0C0D0F] text-[#A1A1AA] py-2.5 border-b border-[#2A2C32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C85A32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C85A32]"></span>
            </span>
            <span className="text-[#FAF8F5] font-semibold">Statutory Compliance Monitor:</span>
            <span className="text-[#C85A32]">Article 9 Norms &amp; ₹0.00 Variance Guaranteed</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-stone-400 text-[11px]">
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

      {/* Streamlined Minimal Middle Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <BrandLogo size="sm" theme="dark" />
          <span className="hidden sm:inline text-stone-600">|</span>
          <p className="text-stone-400 text-xs font-light max-w-md leading-relaxed">
            AI-powered statutory monitoring and decision-support for MPLADS works. Grounded in MoSPI guidelines and double-entry treasury reconciliation.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-stone-300 text-xs font-medium">
          <Link to="/states" className="hover:text-[#C85A32] transition">States Atlas</Link>
          <Link to="/mps" className="hover:text-[#C85A32] transition">MP Track</Link>
          <Link to="/works" className="hover:text-[#C85A32] transition">Verified Works</Link>
          <Link to="/alerts" className="hover:text-[#C85A32] transition">Risk Alerts</Link>
          <Link to="/methodology" className="hover:text-[#C85A32] transition">Methodology</Link>
          <a
            href="https://jandrishti-production.up.railway.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C85A32] transition inline-flex items-center gap-1 text-stone-400"
          >
            API Docs <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </div>

      {/* Bottom Bar: Single-line Copyright & Non-Accusatory Disclosure */}
      <div className="border-t border-[#2A2C32] bg-[#0C0D0F] py-3 text-stone-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; 2026 JanDrishti Civic Platform · MoSPI MPLADS Aligned
          </div>
          <div className="text-stone-500 font-mono text-[10px] text-center sm:text-right">
            Non-Accusatory Principle: Flags represent statistical risk indicators requiring administrative field verification.
          </div>
        </div>
      </div>
    </footer>
  );
};

