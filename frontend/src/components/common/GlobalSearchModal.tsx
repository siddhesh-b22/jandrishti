import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Users,
  Layers,
  Receipt,
  Building2,
  MapPin,
  ShieldAlert,
  FileText,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const registryItems = [
    {
      category: 'PARLIAMENT',
      label: 'Members of Parliament',
      desc: '778 Lok Sabha & Rajya Sabha MPs directory',
      icon: Users,
      path: '/mps',
    },
    {
      category: 'IMPLEMENTATION',
      label: 'Physical Works Registry',
      desc: '102,437 project items & physical execution milestones',
      icon: Layers,
      path: '/works',
    },
    {
      category: 'SIGNALS',
      label: 'Analytical Signal Center',
      desc: '1,831 explainable risk indicators & statistical deviations',
      icon: ShieldAlert,
      path: '/anomalies',
    },
    {
      category: 'TREASURY',
      label: 'Disbursement Vouchers',
      desc: '82,296 line-item treasury disbursement records',
      icon: Receipt,
      path: '/transactions',
    },
    {
      category: 'PROCUREMENT',
      label: 'Contractor Intelligence',
      desc: '22,377 vendors & single-patron reliance percentiles',
      icon: Building2,
      path: '/vendors',
    },
    {
      category: 'GEOGRAPHY',
      label: 'State & UT Landscape',
      desc: '28 States & 8 Union Territories fiscal intelligence',
      icon: MapPin,
      path: '/states',
    },
    {
      category: 'RESEARCH',
      label: 'Mathematical Methodology',
      desc: 'Scoring models, MAD algorithms & House-Aware Standards',
      icon: FileText,
      path: '/methodology',
    },
  ];

  const popularStates = [
    'Maharashtra',
    'Uttar Pradesh',
    'Tamil Nadu',
    'Bihar',
    'Karnataka',
    'Gujarat',
    'West Bengal',
    'Rajasthan',
    'Kerala',
    'Andhra Pradesh',
  ];

  const filteredLinks = registryItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStates = popularStates.filter((st) =>
    st.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'ArrowDown' && isOpen) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredLinks.length));
      }
      if (e.key === 'ArrowUp' && isOpen) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredLinks.length) % Math.max(1, filteredLinks.length));
      }
      if (e.key === 'Enter' && isOpen) {
        e.preventDefault();
        if (query.trim() && filteredLinks.length === 0) {
          navigate(`/mps?search=${encodeURIComponent(query.trim())}`);
          onClose();
        } else if (filteredLinks[selectedIndex]) {
          navigate(filteredLinks[selectedIndex].path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredLinks, selectedIndex, query, navigate]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/mps?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search JanDrishti by MP name, state, constituency, contractor, or signal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm bg-transparent text-navy-950 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </form>

        {/* Results Container */}
        <div className="p-3 max-h-[420px] overflow-y-auto space-y-3">
          {/* Main Registry Links */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              DATASETS &amp; REGISTRIES
            </div>
            {filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left group ${
                    isSelected ? 'bg-slate-100 border border-slate-200 shadow-xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isSelected ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-950">{item.label}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-navy-950 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick State Filtering Shortcuts */}
          {query.trim().length > 0 && filteredStates.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                MATCHING JURISDICTIONS
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {filteredStates.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelect(`/mps?state=${encodeURIComponent(st.toUpperCase())}`)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-navy-950 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{st}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">View MPs →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-navy-950 text-white text-xs font-bold shadow-xs hover:bg-brand-900 transition"
              >
                <span>Search all records for "{query}"</span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-brand-200">
                  <span>Press Enter</span>
                  <CornerDownLeft className="w-3 h-3" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">JanDrishti Global Command</span>
        </div>
      </div>
    </div>
  );
};
