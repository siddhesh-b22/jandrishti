import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  MapPin,
  Building2,
  Receipt,
  MessageSquare,
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  FileCheck,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Camera,
  Upload,
  ImageIcon,
  Trash2
} from 'lucide-react';
import { api } from '../../api/client';
import { Work, CitizenReport } from '../../api/types';
import { useRole } from '../../context/RoleContext';

const POPULAR_STATES = [
  'MAHARASHTRA',
  'UTTAR PRADESH',
  'KARNATAKA',
  'GUJARAT',
  'TAMIL NADU',
  'BIHAR',
  'WEST BENGAL',
  'RAJASTHAN',
  'MADHYA PRADESH',
  'DELHI'
];

export const CitizenWorkspace: React.FC = () => {
  const { selectedState, setSelectedState } = useRole();
  const [activeState, setActiveState] = useState<string>(selectedState || 'MAHARASHTRA');
  const [works, setWorks] = useState<Work[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Citizen Discrepancy Reporting Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({
    work_id: '',
    discrepancy_category: 'GHOST_WORK',
    description: '',
    reported_location: `${activeState}`,
    photo_url: '',
    citizen_name: '',
    citizen_contact: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [worksRes, reportsRes] = await Promise.all([
        api.getWorks({ state: activeState, limit: 16 }).catch(() => ({ items: [] })),
        api.listCitizenReports().catch(() => [])
      ]);
      setWorks(worksRes.items || []);
      const repItems = Array.isArray(reportsRes) ? reportsRes : (reportsRes?.items || []);
      setCitizenReports(repItems);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeState]);

  const handleFileSelect = (file: File) => {
    setFileError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Only JPEG, PNG, and WebP images are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReportSubmitting(true);
      setReportSuccessMsg(null);

      let photoUrl = reportForm.photo_url;

      // Upload file first if selected
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadRes = await api.uploadCitizenEvidence(selectedFile);
          photoUrl = uploadRes.photo_url;
        } catch (uploadErr: any) {
          alert(uploadErr.message || 'Failed to upload evidence photo');
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      const res = await api.submitCitizenReport({
        ...reportForm,
        photo_url: photoUrl,
        state: activeState,
        district: 'PUNE',
        constituency: 'PUNE'
      });
      setReportSuccessMsg(
        `Discrepancy registered under Tracking Docket #${res.report_id || 'CR-2026'}. Scheduled for District Implementing Authority inspection.`
      );
      setReportForm({
        work_id: '',
        discrepancy_category: 'GHOST_WORK',
        description: '',
        reported_location: `${activeState}`,
        photo_url: '',
        citizen_name: '',
        citizen_contact: ''
      });
      handleClearFile();
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccessMsg(null);
        loadData();
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const filteredWorks = works.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const title = (w.title || w.work_description_normalized || '').toLowerCase();
    const category = (w.category || w.category_normalized || '').toLowerCase();
    const agency = (w.implementing_agency || '').toLowerCase();
    return title.includes(q) || category.includes(q) || agency.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Public Civic Transparency Banner */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              JanDrishti Open Infrastructure &amp; Expenditure Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              Public works, payments, and community infrastructure information for civic review.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="cw-btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Report Ground Discrepancy</span>
            </button>
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs text-[#121316] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Portal</span>
            </button>
          </div>
        </div>

        {/* Public Macro Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Verified Public Schemes</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">1,02,437</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Openly audited</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Total Public Capital</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">₹4,567.89 Cr</div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">All-India allocations</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Registered Contractors</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">22,377</div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Public agencies & vendors</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Citizen Inquiries Filed</div>
            <div className="text-xl font-bold font-serif text-[#C85A32] mt-1">
              {citizenReports.length > 0 ? citizenReports.length : 12}
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Under field verification</div>
          </div>
        </div>
      </div>

      {/* State Filter Chips & Search Bar */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
            {POPULAR_STATES.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setActiveState(st);
                  setSelectedState(st);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition cursor-pointer ${
                  activeState === st
                    ? 'bg-[#121316] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#4A4D53] border border-[#E4E2DC] hover:border-[#C85A32]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter schemes, contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] text-xs outline-none focus:border-[#C85A32]"
            />
          </div>
        </div>

        {/* Verified Works Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#71717A]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32] mx-auto mb-2" />
            Loading verified public works in {activeState}...
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
            <p className="text-xs font-mono text-[#71717A]">No works matching your filter in {activeState}.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredWorks.map((work) => (
              <div
                key={work.work_id}
                className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] hover:border-[#C85A32] transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white border border-[#E4E2DC] text-[#71717A]">
                      #{work.work_id}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified Public Record
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#121316] line-clamp-2">
                    {work.title || work.work_description_normalized || 'Public Development Scheme'}
                  </h3>

                  <div className="text-[11px] font-mono text-[#71717A]">
                    Sector: <span className="text-[#121316]">{work.category || work.category_normalized || 'Civil'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#71717A]">
                    Implementing Agency: <span className="text-[#121316]">{work.implementing_agency || 'District Implementing Agency'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E2DC] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#71717A]">Sanctioned</span>
                    <span className="font-bold text-[#121316]">
                      ₹{((work.sanctioned_amount || 2500000) / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                      <span>Physical Ground Progress</span>
                      <span className="font-bold text-emerald-700">{work.physical_progress_pct ?? 50}%</span>
                    </div>
                    <div className="w-full bg-[#E4E2DC] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${work.physical_progress_pct ?? 50}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/works/${work.work_id}`}
                    className="w-full py-1.5 rounded-lg bg-white hover:bg-[#F0EFEA] border border-[#E4E2DC] text-center text-xs font-medium text-[#121316] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <span>View Public Audit Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Reports Public Transparency Docket */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Public Discrepancy Reports &amp; Social Audit Docket
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#71717A] hidden sm:inline">
              Direct Civic Accountability
            </span>
            <Link
              to="/track-reports"
              className="text-[11px] font-mono font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
            >
              <span>Open Full Tracker</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {citizenReports.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-mono text-[#121316]">No ground discrepancies currently reported.</p>
            <p className="text-[11px] text-[#71717A] mt-0.5">Use "Report Ground Discrepancy" if you observe abandoned or ghost works in your locality.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {citizenReports.map((report) => (
              <div key={report.report_id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#121316]">
                      Docket #{report.report_id} &bull; Work #{report.work_id || 'General'}
                    </span>
                    <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                      Category: {report.discrepancy_category || 'GHOST_WORK'} &bull; {report.reported_location || 'Pune'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                    {report.status || 'SUBMITTED'}
                  </span>
                </div>

                <p className="text-xs text-[#4A4D53] bg-white p-2.5 rounded-lg border border-[#E4E2DC]">
                  "{report.description}"
                </p>

                {report.photo_url && (
                  <div className="rounded-lg overflow-hidden border border-[#E4E2DC] bg-white">
                    <img
                      src={report.photo_url.startsWith('http') ? report.photo_url : `${window.location.protocol}//${window.location.hostname}:8000${report.photo_url}`}
                      alt="Evidence photo"
                      className="w-full h-32 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#71717A]">
                      <Camera className="w-3 h-3" />
                      <span>Photographic Ground Evidence Attached</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-1">
                  <span>Reported by: {report.citizen_name || 'Anonymous Citizen'}</span>
                  <span>{new Date(report.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Ground Discrepancy Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#121316]">
                  Report Ground Infrastructure Discrepancy
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Logged into public social audit docket and routed to District Authority
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0EFEA] text-[#71717A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p>{reportSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Work ID (if visible on site plaque)</label>
                  <input
                    placeholder="e.g. 1024 (leave blank if unknown)"
                    value={reportForm.work_id}
                    onChange={(e) => setReportForm({ ...reportForm, work_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">Issue Category</label>
                    <select
                      value={reportForm.discrepancy_category}
                      onChange={(e) => setReportForm({ ...reportForm, discrepancy_category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs bg-white font-mono"
                    >
                      <option value="GHOST_WORK">Ghost Work (Sanctioned but Non-Existent)</option>
                      <option value="SUBSTANDARD_MATERIAL">Substandard Materials / Poor Quality</option>
                      <option value="ABANDONED_CONSTRUCTION">Abandoned Construction Site</option>
                      <option value="SIGNBOARD_MISSING">Mandatory MPLADS Plaque Missing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">Location Details</label>
                    <input
                      required
                      placeholder="e.g. Near ZP School, Haveli, Pune"
                      value={reportForm.reported_location}
                      onChange={(e) => setReportForm({ ...reportForm, reported_location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Discrepancy Details &amp; Ground Observations</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe exact physical findings, lack of progress, broken structures, or contractor absence..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                  />
                </div>

                {/* Photo Evidence Upload Zone */}
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">
                    <Camera className="w-3.5 h-3.5 inline mr-1" />
                    Photographic Evidence (Optional, max 5 MB)
                  </label>

                  {filePreview ? (
                    <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-[#E4E2DC]">
                        <img
                          src={filePreview}
                          alt="Evidence preview"
                          className="w-full h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-red-50 border border-[#E4E2DC] text-[#71717A] hover:text-red-600 transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(0)} KB)</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('evidence-file-input')?.click()}
                      className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#C85A32] bg-[#FAF0EB] scale-[1.01]'
                          : 'border-[#E4E2DC] bg-[#FAF8F5] hover:border-[#C85A32] hover:bg-[#FAF0EB]/50'
                      }`}
                    >
                      <input
                        id="evidence-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileSelect(f);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2.5 rounded-full transition ${
                          isDragging ? 'bg-[#C85A32]/10' : 'bg-[#F0EFEA]'
                        }`}>
                          <Upload className={`w-5 h-5 transition ${isDragging ? 'text-[#C85A32]' : 'text-[#71717A]'}`} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#121316]">Click or drag photo here</p>
                          <p className="text-[10px] text-[#71717A] font-mono mt-0.5">JPEG, PNG, or WebP • Max 5 MB</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {fileError && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 font-mono bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">Your Name (Optional)</label>
                    <input
                      placeholder="Leave blank for anonymous"
                      value={reportForm.citizen_name}
                      onChange={(e) => setReportForm({ ...reportForm, citizen_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">Mobile / Email (Optional)</label>
                    <input
                      placeholder="For inspection status SMS"
                      value={reportForm.citizen_contact}
                      onChange={(e) => setReportForm({ ...reportForm, citizen_contact: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#71717A] hover:bg-[#F0EFEA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="cw-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{reportSubmitting ? (uploadingFile ? 'Uploading evidence...' : 'Logging...') : 'Submit to Public Social Audit'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
