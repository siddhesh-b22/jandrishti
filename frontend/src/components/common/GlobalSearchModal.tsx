import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { api } from '../../api/client';
import { GlobalSearchResponse, GlobalSearchResultItem } from '../../api/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedFlatIndex, setSelectedFlatIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Static Registry Links for empty state
  const registryItems = [
    { category: 'PARLIAMENT', label: '778 Members of Parliament', desc: 'Lok Sabha & Rajya Sabha MPs directory', icon: Users, path: '/mps' },
    { category: 'IMPLEMENTATION', label: '102,437 Physical Works', desc: 'Ground execution projects and lifecycle tracking', icon: Layers, path: '/works' },
    { category: 'SIGNALS', label: '1,831 Analytical Signals', desc: 'MAD statistical indicators & audit flags', icon: ShieldAlert, path: '/anomalies' },
    { category: 'TREASURY', label: '82,296 Disbursement Vouchers', desc: 'Itemized treasury financial records (₹0.00 variance)', icon: Receipt, path: '/transactions' },
    { category: 'AGENCIES & CONTRACTORS', label: '763 IDAs & 22,377 Vendors', desc: 'Implementing agencies and vendor concentration HHI', icon: Building2, path: '/vendors' },
    { category: 'PROVENANCE', label: 'Authoritative Source Registry', desc: '14 Tier 1 to 4 government sources and audit reports', icon: FileText, path: '/data-quality' },
  ];

  const popularStates = [
    'Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'Bihar', 'Karnataka',
    'Gujarat', 'West Bengal', 'Rajasthan', 'Kerala', 'Andhra Pradesh'
  ];

  // Debounced live backend search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      api.globalSearch(q, 4)
        .then((res) => {
          setSearchResults(res);
          setSelectedFlatIndex(0);
        })
        .catch(() => setSearchResults(null))
        .finally(() => setSearching(false));
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Flatten active search items for keyboard navigation
  const flatSearchResults: GlobalSearchResultItem[] = searchResults
    ? [
        ...(searchResults.groups.PEOPLE?.items || []),
        ...(searchResults.groups.WORKS?.items || []),
        ...(searchResults.groups.ENTITIES?.items || []),
        ...(searchResults.groups.VOUCHERS?.items || []),
        ...(searchResults.groups.CASES?.items || []),
      ]
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const maxLen = flatSearchResults.length > 0 ? flatSearchResults.length : registryItems.length;
        setSelectedFlatIndex((prev) => (prev + 1) % Math.max(1, maxLen));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const maxLen = flatSearchResults.length > 0 ? flatSearchResults.length : registryItems.length;
        setSelectedFlatIndex((prev) => (prev - 1 + maxLen) % Math.max(1, maxLen));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatSearchResults.length > 0 && flatSearchResults[selectedFlatIndex]) {
          navigate(flatSearchResults[selectedFlatIndex].target_url);
          onClose();
        } else if (query.trim()) {
          navigate(`/mps?search=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flatSearchResults, selectedFlatIndex, query, navigate, registryItems.length]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-[#121316]/60 backdrop-blur-xs transition-opacity animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl border border-[#E4E2DC] shadow-2xl overflow-hidden transition-all animate-slide-up text-[#121316]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E4E2DC] gap-3 bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-[#71717A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search MPs, works, agencies, vendors, vouchers, or cases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm bg-transparent text-[#121316] placeholder-[#71717A] focus:outline-none font-sans font-medium"
          />
          {searching && <Loader2 className="w-4 h-4 text-[#C85A32] animate-spin" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#71717A] hover:text-[#121316] hover:bg-[#F0EFEA] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#71717A] bg-[#F0EFEA] rounded-md border border-[#E4E2DC]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-[460px] overflow-y-auto space-y-4">
          {/* Live Search Mode */}
          {searchResults && searchResults.total_results > 0 ? (
            <div className="space-y-4">
              {/* 1. PEOPLE (MPs) */}
              {searchResults.groups.PEOPLE?.items.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    PARLIAMENTARY REPRESENTATIVES ({searchResults.groups.PEOPLE.count})
                  </div>
                  {searchResults.groups.PEOPLE.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.target_url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-serif font-bold text-xs text-[#121316] group-hover:text-[#C85A32] transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#4A4D53] font-light truncate">{item.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 2. WORKS */}
              {searchResults.groups.WORKS?.items.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    PHYSICAL ASSETS &amp; WORKS ({searchResults.groups.WORKS.count})
                  </div>
                  {searchResults.groups.WORKS.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.target_url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-serif font-bold text-xs text-[#121316] group-hover:text-[#2E7D32] transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#4A4D53] font-light truncate">{item.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F0EFEA] text-[#2E7D32] border border-[#E4E2DC] shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 3. ENTITIES (Agencies & Contractors) */}
              {searchResults.groups.ENTITIES?.items.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" />
                    AGENCIES &amp; CONTRACTORS ({searchResults.groups.ENTITIES.count})
                  </div>
                  {searchResults.groups.ENTITIES.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.target_url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-serif font-bold text-xs text-[#121316] group-hover:text-[#C85A32] transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#4A4D53] font-light truncate">{item.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F0EFEA] text-[#121316] border border-[#E4E2DC] shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 4. VOUCHERS */}
              {searchResults.groups.VOUCHERS?.items.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3 h-3" />
                    TREASURY VOUCHERS ({searchResults.groups.VOUCHERS.count})
                  </div>
                  {searchResults.groups.VOUCHERS.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.target_url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-serif font-bold text-xs text-[#121316] group-hover:text-[#C85A32] transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#4A4D53] font-light truncate">{item.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 5. CASES */}
              {searchResults.groups.CASES?.items.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    AUDIT CASES &amp; DOCKETS ({searchResults.groups.CASES.count})
                  </div>
                  {searchResults.groups.CASES.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.target_url)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-serif font-bold text-xs text-[#121316] group-hover:text-[#C85A32] transition truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#4A4D53] font-light truncate">{item.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6] shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 && !searching ? (
            <div className="p-8 text-center space-y-2">
              <FolderOpen className="w-8 h-8 text-[#71717A] mx-auto" />
              <p className="text-xs font-serif font-bold text-[#121316]">No statutory records found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-[#4A4D53] font-light">
                Try searching by a broader term, MP name, Work ID, or District.
              </p>
            </div>
          ) : (
            /* Default View: Static Navigation Shortcuts */
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
                  STATUTORY REGISTRY DIRECTORIES
                </div>
                {registryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F0EFEA] border border-transparent hover:border-[#E4E2DC] transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#F0EFEA] text-[#121316] group-hover:bg-[#FAF0EB] group-hover:text-[#C85A32] transition border border-[#E4E2DC]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-serif font-bold text-[#121316] group-hover:text-[#C85A32] transition">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-[#4A4D53] font-light">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>

              {/* Popular States */}
              <div className="space-y-2 pt-2 border-t border-[#E4E2DC]">
                <div className="px-3 text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
                  TOP FISCAL LANDSCAPES
                </div>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {popularStates.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSelect(`/states?search=${encodeURIComponent(st)}`)}
                      className="px-2.5 py-1 rounded-lg bg-[#F0EFEA] hover:bg-[#FAF0EB] hover:text-[#C85A32] text-[11px] font-medium text-[#121316] border border-[#E4E2DC] transition"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-[#E4E2DC] bg-[#F0EFEA] flex items-center justify-between text-[11px] text-[#71717A] font-mono">
          <span>STATUTORY AUDIT &gt; RECONCILED</span>
          <span>{searchResults ? `${searchResults.total_results} results found` : 'Ctrl + K to toggle'}</span>
        </div>
      </div>
    </div>
  );
};
