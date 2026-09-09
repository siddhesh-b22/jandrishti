import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Upload,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Building2,
  Filter,
  FileText,
  MapPin,
  Calendar,
  X,
  Info,
  Check,
  ChevronRight,
  Eye,
  RefreshCw,
  Layers
} from 'lucide-react';
import { api } from '../api/client';
import { CitizenReport } from '../api/types';
import { useRole } from '../context/RoleContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Pagination } from '../components/common/Pagination';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  GHOST_WORK: { label: 'Ghost / Non-Existent Work', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  POOR_QUALITY: { label: 'Substandard / Defective Quality', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  DELAYED_WORK: { label: 'Abandoned / Prolonged Delay', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  MISSING_BOARD: { label: 'Missing MPLADS Citizen Signboard', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  FUND_MISUSE: { label: 'Fund Diversion / Misappropriation', color: 'bg-red-50 text-red-800 border-red-200' },
};

const PAGE_SIZE = 6;

export const TrackReportsPage: React.FC = () => {
  const { selectedState, canEdit, roleConfig } = useRole();
  const [offset, setOffset] = useState(0);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeReport, setActiveReport] = useState<CitizenReport | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [actingOnReport, setActingOnReport] = useState(false);
  const [trackActionMsg, setTrackActionMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    work_id: '',
    discrepancy_category: 'GHOST_WORK',
    description: '',
    reported_location: selectedState || 'Pune, Maharashtra',
    citizen_name: '',
    citizen_contact: '',
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.listCitizenReports().catch(() => []);
      const data = Array.isArray(res) ? res : (res?.items || []);
      setReports(data || []);
      if (data && data.length > 0 && !activeReport) {
        setActiveReport(data[0]);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const handleTrackDispatchInspection = async () => {
    if (!activeReport) return;
    try {
      setActingOnReport(true);
      const updated = await api.updateCitizenReportStatus(activeReport.report_id, {
        status: 'INSPECTION_DISPATCHED',
        assigned_authority: `District Verification Cell (${activeReport.district || 'Pune'})`,
        notes: `Physical verification team dispatched on-site by ${roleConfig.shortLabel}.`
      });
      setActiveReport(updated);
      setTrackActionMsg(`Stage advanced to Inspection Dispatched for #${activeReport.report_id}.`);
      fetchReports();
      setTimeout(() => setTrackActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch inspection');
    } finally {
      setActingOnReport(false);
    }
  };

  const handleTrackEscalate = async () => {
    if (!activeReport) return;
    try {
      setActingOnReport(true);
      const res = await api.escalateCitizenReport(activeReport.report_id, {
        priority: 'CRITICAL',
        notes: `Formally escalated to statutory investigation docket by ${roleConfig.shortLabel}.`
      });
      setTrackActionMsg(`Report escalated to Statutory Case Docket #${res.case.case_id}!`);
      fetchReports();
      setTimeout(() => setTrackActionMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to escalate report');
    } finally {
      setActingOnReport(false);
    }
  };

  const handleTrackResolve = async () => {
    if (!activeReport) return;
    try {
      setActingOnReport(true);
      const updated = await api.updateCitizenReportStatus(activeReport.report_id, {
        status: 'RESOLVED',
        notes: `Ground verification and corrective action certified by ${roleConfig.shortLabel}.`
      });
      setActiveReport(updated);
      setTrackActionMsg(`Report #${activeReport.report_id} verified & marked RESOLVED.`);
      fetchReports();
      setTimeout(() => setTrackActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report');
    } finally {
      setActingOnReport(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileSelect = (file: File) => {
    setFileError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Only JPEG, PNG, and WebP images are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB.`);
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

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    try {
      setSubmitting(true);
      setSuccessMessage(null);

      let uploadedPhotoUrl = '';
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadRes = await api.uploadCitizenEvidence(selectedFile);
          uploadedPhotoUrl = uploadRes.photo_url;
        } catch {
          setFileError('Could not upload image. Submitting report without photo.');
        } finally {
          setUploadingFile(false);
        }
      }

      const res = await api.submitCitizenReport({
        work_id: formData.work_id || undefined,
        discrepancy_category: formData.discrepancy_category,
        description: formData.description,
        reported_location: formData.reported_location,
        photo_url: uploadedPhotoUrl || undefined,
        citizen_name: formData.citizen_name || undefined,
        citizen_contact: formData.citizen_contact || undefined,
      });

      setSuccessMessage(`Ground discrepancy logged successfully as Docket #${res.report_id}! It is now routed to the District Authority.`);
      setFormData({
        work_id: '',
        discrepancy_category: 'GHOST_WORK',
        description: '',
        reported_location: selectedState || 'Pune, Maharashtra',
        citizen_name: '',
        citizen_contact: '',
      });
      handleClearFile();
      await fetchReports();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 2500);
    } catch {
      setSuccessMessage('Failed to submit report. Please verify connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.report_id?.toLowerCase().includes(q) ||
        r.work_id?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.reported_location?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'ALL' || r.discrepancy_category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'RESOLVED' && (r.status === 'RESOLVED' || r.status === 'CLOSED')) ||
        (selectedStatus === 'UNDER_REVIEW' && (r.status === 'UNDER_REVIEW' || r.status === 'INVESTIGATING')) ||
        (selectedStatus === 'SUBMITTED' && (r.status === 'SUBMITTED' || r.status === 'OPEN' || !r.status));

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [reports, searchQuery, selectedCategory, selectedStatus]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setOffset(0);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const paginatedReports = useMemo(() => {
    return filteredReports.slice(offset, offset + PAGE_SIZE);
  }, [filteredReports, offset]);

  const resolveStatusStep = (status?: string): number => {
    const s = (status || '').toUpperCase();
    if (s === 'RESOLVED' || s === 'CLOSED') return 4;
    if (s === 'FIELD_INSPECTION' || s === 'INSPECTING') return 3;
    if (s === 'UNDER_REVIEW' || s === 'INVESTIGATING') return 2;
    return 1; // SUBMITTED
  };

  const getFullPhotoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${window.location.protocol}//${window.location.hostname}:8000${url}`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#121316] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Citizen Transparency Portal', to: '/explore' },
          { label: 'Track Reports & Social Audit Docket' },
        ]}
      />

      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAF8F5] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                CIVIC ACCOUNTABILITY WINDOW
              </span>
              <span className="text-xs font-mono text-[#71717A]">
                {reports.length} Public Submissions Recorded
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#121316]">
              Public Discrepancy Docket &amp; Report Tracker
            </h1>
            <p className="text-xs text-[#4A4D53] leading-relaxed">
              Real-time tracking of photographic ground evidence submitted by citizens across India. 
              Submissions automatically link to public works and alert District Authorities for statutory field audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReports()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#F0EFEA] border border-[#E4E2DC] text-xs font-mono text-[#4A4D53] flex items-center gap-1.5 transition cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs font-medium flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Report Ground Discrepancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filter Bar */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Docket #, Work ID, location, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] text-xs font-mono text-[#121316] placeholder:text-[#71717A] focus:outline-hidden focus:border-[#C85A32] transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] font-mono text-[#71717A] flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition shrink-0 cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#121316] text-white font-medium'
                    : 'bg-[#FAF8F5] hover:bg-[#F0EFEA] text-[#4A4D53] border border-[#E4E2DC]'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-[#E4E2DC]/60">
          <span className="text-[11px] font-mono text-[#71717A] shrink-0">Category:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#C85A32] text-white font-semibold'
                : 'bg-white hover:bg-[#F0EFEA] text-[#71717A] border border-[#E4E2DC]'
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition shrink-0 cursor-pointer ${
                selectedCategory === catKey
                  ? 'bg-[#C85A32] text-white font-semibold'
                  : 'bg-white hover:bg-[#F0EFEA] text-[#71717A] border border-[#E4E2DC]'
              }`}
            >
              {catMeta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Active Report Tracker + Reports Feed */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Selected Docket Live Lifecycle Stepper */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <h3 className="text-sm font-serif font-bold text-[#121316]">
                  Live Statutory Docket Stepper
                </h3>
              </div>
              {activeReport && (
                <span className="text-[10px] font-mono text-[#71717A]">
                  Docket #{activeReport.report_id}
                </span>
              )}
            </div>

            {activeReport ? (
              <div className="space-y-4">
                {/* 4-Step Statutory Progression */}
                <div className="space-y-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
                  <div className="text-[11px] font-mono text-[#71717A] font-semibold">
                    STATUTORY RESOLUTION PIPELINE:
                  </div>

                  {(() => {
                    const currentStep = resolveStatusStep(activeReport.status);
                    const steps = [
                      {
                        num: 1,
                        title: '1. Report Submitted',
                        desc: 'Ground observation logged with timestamp & evidence.',
                        done: currentStep >= 1,
                        active: currentStep === 1,
                      },
                      {
                        num: 2,
                        title: '2. District Authority Notified',
                        desc: 'Transferred to District Magistrate / Nodal Officer inbox.',
                        done: currentStep >= 2,
                        active: currentStep === 2,
                      },
                      {
                        num: 3,
                        title: '3. Field Site Inspection',
                        desc: 'Junior Engineer scheduled for on-site physical verification.',
                        done: currentStep >= 3,
                        active: currentStep === 3,
                      },
                      {
                        num: 4,
                        title: '4. Action Taken / Resolved',
                        desc: 'Show-cause notice issued, funds halted, or defect rectified.',
                        done: currentStep >= 4,
                        active: currentStep === 4,
                      },
                    ];

                    return (
                      <div className="space-y-3 pt-1">
                        {steps.map((step, idx) => (
                          <div key={step.num} className="flex items-start gap-3 relative">
                            {idx < steps.length - 1 && (
                              <div
                                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-3 ${
                                  step.done && steps[idx + 1].done ? 'bg-emerald-500' : 'bg-[#E4E2DC]'
                                }`}
                              />
                            )}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition z-10 ${
                                step.done
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-[#E4E2DC] text-[#71717A]'
                              }`}
                            >
                              {step.done ? <Check className="w-3.5 h-3.5" /> : step.num}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <div className="text-xs font-medium text-[#121316] flex items-center justify-between">
                                <span>{step.title}</span>
                                {step.active && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                    CURRENT STAGE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#71717A] leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Report Details Snapshot */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#71717A]">Category:</span>
                      <span className="font-semibold text-[#121316]">
                        {CATEGORY_LABELS[activeReport.discrepancy_category]?.label || activeReport.discrepancy_category}
                      </span>
                    </div>
                    {activeReport.work_id && (
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#71717A]">Linked Public Work:</span>
                        <Link
                          to={`/works/${activeReport.work_id}`}
                          className="font-bold text-[#C85A32] hover:underline flex items-center gap-1"
                        >
                          <span>Work #{activeReport.work_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#71717A]">Location:</span>
                      <span className="text-[#121316]">{activeReport.reported_location || 'Pune, Maharashtra'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#71717A]">Submission Date:</span>
                      <span className="text-[#121316]">
                        {new Date(activeReport.created_at || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Citizen Observation Text */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#71717A] font-semibold">
                      Citizen Ground Observation:
                    </div>
                    <p className="text-xs text-[#121316] italic leading-relaxed">
                      "{activeReport.description}"
                    </p>
                  </div>

                  {/* Photo Evidence Attached */}
                  {activeReport.photo_url && (
                    <div className="p-2 rounded-xl bg-white border border-[#E4E2DC] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] px-1">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#C85A32]" />
                          Photographic Evidence Attached
                        </span>
                        <button
                          onClick={() => setPreviewPhotoUrl(getFullPhotoUrl(activeReport.photo_url))}
                          className="text-[#C85A32] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Full
                        </button>
                      </div>
                      <img
                        src={getFullPhotoUrl(activeReport.photo_url)}
                        alt="Evidence"
                        className="w-full h-40 object-cover rounded-lg border border-[#E4E2DC] cursor-pointer hover:opacity-95 transition"
                        onClick={() => setPreviewPhotoUrl(getFullPhotoUrl(activeReport.photo_url))}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Authority Verification Actions */}
                  {canEdit() && (
                    <div className="p-3 rounded-xl bg-white border border-[#E4E2DC] space-y-2">
                      <div className="text-[10px] font-mono uppercase text-[#71717A] font-semibold">
                        Statutory Administrative Actions:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeReport.status === 'SUBMITTED' && (
                          <button
                            type="button"
                            disabled={actingOnReport}
                            onClick={handleTrackDispatchInspection}
                            className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium border border-blue-200 transition cursor-pointer flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Dispatch Inspection</span>
                          </button>
                        )}

                        {(activeReport.status === 'SUBMITTED' || activeReport.status === 'ACKNOWLEDGED' || activeReport.status === 'INSPECTION_DISPATCHED') && (
                          <button
                            type="button"
                            disabled={actingOnReport}
                            onClick={handleTrackEscalate}
                            className="px-3 py-1.5 rounded-full bg-[#C85A32] hover:bg-[#B34E28] text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Escalate to Review Case</span>
                          </button>
                        )}

                        {activeReport.status === 'INSPECTION_DISPATCHED' && (
                          <button
                            type="button"
                            disabled={actingOnReport}
                            onClick={handleTrackResolve}
                            className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Verified &amp; Close</span>
                          </button>
                        )}

                        {activeReport.status === 'ESCALATED_TO_CASE' && (
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-mono font-medium flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-purple-700" />
                            <span>Case Docket Active</span>
                          </span>
                        )}

                        {(activeReport.status === 'VERIFIED' || activeReport.status === 'RESOLVED') && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>On-Ground Verified &amp; Closed</span>
                          </span>
                        )}
                      </div>
                      {trackActionMsg && (
                        <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          {trackActionMsg}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
                <FileText className="w-8 h-8 text-[#71717A] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-mono text-[#121316]">No Docket Selected</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  Click any report on the right or search by Work ID to view its live status.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Public Community Reports Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[#121316] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C85A32]" />
              <span>Public Community Evidence Stream</span>
            </h2>
            <span className="text-xs font-mono text-[#71717A]">
              Showing {filteredReports.length} of {reports.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-white border border-[#E4E2DC] animate-pulse" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-[#E4E2DC] space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div>
                <p className="text-sm font-serif font-bold text-[#121316]">
                  No Reports Found Matching Criteria
                </p>
                <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or filter selections, or be the first to submit a ground verification for your locality.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit Ground Observation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {paginatedReports.map((report) => {
                const isSelected = activeReport?.report_id === report.report_id;
                const catMeta = CATEGORY_LABELS[report.discrepancy_category] || {
                  label: report.discrepancy_category || 'General Discrepancy',
                  color: 'bg-stone-100 text-stone-800 border-stone-200',
                };

                return (
                  <div
                    key={report.report_id}
                    onClick={() => setActiveReport(report)}
                    className={`rounded-2xl border p-4 bg-white transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'border-[#C85A32] shadow-sm bg-[#FAF8F5]'
                        : 'border-[#E4E2DC] hover:border-[#C85A32]/40 hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#121316]">
                            Docket #{report.report_id}
                          </span>
                          {report.work_id && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF0EB] text-[#C85A32] border border-[#E8C5B6]">
                              Work #{report.work_id}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${catMeta.color}`}
                          >
                            {catMeta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.reported_location || 'Pune, Maharashtra'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.created_at || Date.now()).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            report.status === 'RESOLVED' || report.status === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : report.status === 'UNDER_REVIEW' || report.status === 'INVESTIGATING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {report.status || 'SUBMITTED'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#4A4D53] leading-relaxed line-clamp-2">
                      "{report.description}"
                    </p>

                    {/* Footer Row: Photo Thumbnail + Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E4E2DC]/60">
                      {report.photo_url ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getFullPhotoUrl(report.photo_url)}
                            alt="Preview"
                            className="w-8 h-8 rounded object-cover border border-[#E4E2DC]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="text-[10px] font-mono text-[#71717A] flex items-center gap-1">
                            <Camera className="w-3 h-3 text-[#C85A32]" />
                            Ground Photo Evidence Attached
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-[#71717A]">
                          Reported by: {report.citizen_name || 'Anonymous Citizen'}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#C85A32]">
                        <span>Inspect Docket</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Pagination Controls */}
              {filteredReports.length > PAGE_SIZE && (
                <div className="pt-2 border-t border-[#E4E2DC]/60">
                  <Pagination
                    total={filteredReports.length}
                    limit={PAGE_SIZE}
                    offset={offset}
                    onPageChange={(newOffset) => setOffset(newOffset)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Ground Discrepancy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
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
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F0EFEA] text-[#71717A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#121316] mb-1">
                    Work ID (Optional — e.g. 303753)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Work ID if known from signboard or website..."
                    value={formData.work_id}
                    onChange={(e) => setFormData({ ...formData, work_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono text-[#121316] placeholder:text-[#71717A] focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#121316] mb-1">
                    Discrepancy Category *
                  </label>
                  <select
                    value={formData.discrepancy_category}
                    onChange={(e) => setFormData({ ...formData, discrepancy_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-sans text-[#121316] bg-white focus:outline-hidden focus:border-[#C85A32]"
                  >
                    <option value="GHOST_WORK">Ghost Asset / Non-Existent Work</option>
                    <option value="POOR_QUALITY">Substandard / Defective Construction Quality</option>
                    <option value="DELAYED_WORK">Abandoned / Prolonged Delay</option>
                    <option value="MISSING_BOARD">Missing Mandatory MPLADS Citizen Signboard</option>
                    <option value="FUND_MISUSE">Suspected Fund Diversion or Over-Invoicing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#121316] mb-1">
                    Ground Location / Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Near Primary School, Haveli, Pune, Maharashtra"
                    value={formData.reported_location}
                    onChange={(e) => setFormData({ ...formData, reported_location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-sans text-[#121316] focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#121316] mb-1">
                    Detailed Observation Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what you observed on ground (e.g. contractor left incomplete foundation 6 months ago, no signboard, cracked walls)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-sans text-[#121316] placeholder:text-[#71717A] focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                {/* Evidence Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-mono font-medium text-[#121316] mb-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Photographic Evidence (Optional, max 5 MB)</span>
                  </label>

                  {filePreview ? (
                    <div className="relative rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] p-2 flex items-center gap-3">
                      <img
                        src={filePreview}
                        alt="Evidence preview"
                        className="w-16 h-16 object-cover rounded-lg border border-[#E4E2DC]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-[#121316] truncate font-medium">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#71717A]">
                          {selectedFile && `${(selectedFile.size / 1024).toFixed(0)} KB`} &bull; Ready for upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className={`relative rounded-xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                        isDragging
                          ? 'border-[#C85A32] bg-[#FAF0EB]'
                          : 'border-[#E4E2DC] hover:border-[#C85A32]/60 bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-[#71717A] mx-auto mb-1" />
                      <p className="text-xs text-[#121316] font-medium">
                        Click or drag photo here
                      </p>
                      <p className="text-[10px] text-[#71717A] mt-0.5">
                        JPEG, PNG, or WebP up to 5 MB
                      </p>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-[11px] text-rose-600 mt-1 font-mono">{fileError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">
                      Citizen Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Anonymous"
                      value={formData.citizen_name}
                      onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E4E2DC] text-xs font-sans text-[#121316] focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#71717A] mb-1">
                      Contact / Mobile (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="For verification SMS"
                      value={formData.citizen_contact}
                      onChange={(e) => setFormData({ ...formData, citizen_contact: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E4E2DC] text-xs font-sans text-[#121316] focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E2DC]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#4A4D53] hover:bg-[#F0EFEA] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingFile}
                    className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs font-medium transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Submit Public Discrepancy</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full Photo Modal Preview */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[85vh] rounded-2xl bg-white p-2 border border-[#E4E2DC] shadow-2xl relative"
          >
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewPhotoUrl}
              alt="Full Evidence"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs font-mono text-[#71717A]">
              Photographic Evidence Registered on Statutory Ground Ledger
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
