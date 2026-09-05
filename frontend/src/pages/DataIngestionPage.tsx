import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Download,
  RefreshCw,
  Check,
  Sparkles,
  ShieldAlert,
  Layers,
  FileText,
  Clock,
  ChevronRight,
  Database,
  Search,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { IngestValidateResponse, IngestConfirmResponse, ValidationIssue } from '../api/types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const DataIngestionPage: React.FC = () => {
  // Step state: 1 = Upload, 2 = Preview & Validation, 3 = Confirmation / Done
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // File & parsing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<IngestValidateResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter for validation issues
  const [issueFilter, setIssueFilter] = useState<'ALL' | 'ERROR' | 'WARNING'>('ALL');

  // Confirmation state
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmResult, setConfirmResult] = useState<IngestConfirmResponse | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      validateFile(file);
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      validateFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Validate uploaded file
  const validateFile = async (file: File) => {
    try {
      setIsValidating(true);
      setValidationError(null);
      const res = await api.uploadDatasetFile(file);
      setValidationResult(res);
      setCurrentStep(2);
    } catch (err: any) {
      setValidationError(err.message || 'Validation request failed. Please check the file format.');
    } finally {
      setIsValidating(false);
    }
  };

  // 1-Click Load Synthetic Demo Batch
  const handleLoadDemoBatch = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);
      setSelectedFile(new File([''], 'mplads_synthetic_demo_batch_2026.csv', { type: 'text/csv' }));
      const res = await api.loadSampleDemoBatch();
      setValidationResult(res);
      setCurrentStep(2);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to generate synthetic demo batch.');
    } finally {
      setIsValidating(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    window.open('/api/ingest/template.csv', '_blank');
  };

  // Confirm import
  const handleConfirmImport = async () => {
    if (!validationResult) return;
    try {
      setIsConfirming(true);
      setConfirmError(null);
      const res = await api.confirmDatasetImport(validationResult.batch_id);
      setConfirmResult(res);
      setCurrentStep(3);
    } catch (err: any) {
      setConfirmError(err.message || 'Failed to complete ingestion and risk calculation.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Reset wizard
  const handleReset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setValidationError(null);
    setConfirmResult(null);
    setConfirmError(null);
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredIssues = (validationResult?.issues || []).filter((issue: ValidationIssue) => {
    if (issueFilter === 'ALL') return true;
    return issue.severity === issueFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Intelligence Center', to: '/anomalies' },
          { label: 'Data Ingestion & Risk Pipeline' },
        ]}
      />

      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E2DC] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="cw-badge-section">
                AUTOMATED INTAKE PIPELINE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F0EFEA] text-[#71717A] text-[10px] font-mono border border-[#E4E2DC]">
                PRE-INGESTION VALIDATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316] tracking-tight">
              Data Ingestion &amp; Automated Risk Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl leading-relaxed">
              Upload MPLADS works and expenditure records in CSV or Excel format. The system performs 8 statutory validation checks, flags data anomalies, computes composite risk scores (0–100), and auto-generates human-in-the-loop review alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="cw-btn-secondary text-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Download CSV Template</span>
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleReset}
                className="cw-btn-secondary text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#71717A]" />
                <span>New Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Progression Indicator */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { step: 1, title: '1. Select / Generate Data', desc: 'Upload CSV/Excel or synthetic batch' },
            { step: 2, title: '2. Validate & Preview', desc: '8 integrity rules & anomaly scan' },
            { step: 3, title: '3. Risk Scoring & Import', desc: 'Normalize, compute scores & alerts' },
          ].map(s => {
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <div
                key={s.step}
                className={`p-3.5 rounded-xl border transition ${
                  isActive
                    ? 'border-[#C85A32] bg-[#FAF0EB] shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 text-[#121316]'
                    : 'border-[#E4E2DC] bg-[#FAF8F5] text-[#71717A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-[#C85A32] text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-[#2563EB]' : 'text-slate-800'}`}>
                    {s.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-8 font-light hidden sm:block">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Non-Accusatory Human-in-the-Loop Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Statutory Decision-Support Principle:</strong> The AI ingestion engine identifies potential data gaps, fiscal deviations, and outliers to aid supervisory officials. Flagged records require human administrative verification and do <strong>NOT</strong> constitute proof of fraudulent activity.
          </p>
        </div>
      </div>

      {/* STEP 1: Upload / Load Data */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Box */}
            <div className="lg:col-span-2 rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#2563EB] bg-white p-8 transition group flex flex-col items-center justify-center text-center relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                disabled={isValidating}
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition flex items-center justify-center mb-4 shadow-sm">
                {isValidating ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-base font-bold text-[#08102B]">
                {isValidating ? 'Running Statutory Validation Engine...' : 'Drag and Drop Work Records or Browse'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports standard MPLADS CSV files or Microsoft Excel spreadsheets (.xlsx, .xls). Max recommended batch: 5,000 records.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
                  .csv
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
                  .xlsx
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono">
                  .xls
                </span>
              </div>
            </div>

            {/* Synthetic Batch Demo Card */}
            <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-900 to-[#08102B] text-white p-6 sm:p-7 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-400/30">
                    Instant Evaluation
                  </span>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  One-Click Synthetic Demo Batch
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Evaluate the entire pipeline instantly without preparing a CSV. Generates 15 realistic MPLADS works spanning Maharashtra, Karnataka, and UP, including deliberate negative expenditure, budget overruns, schedule delays, and clean projects.
                </p>
                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>8 High-Impact Analytical Scenarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pre-configured Ground Truth Inconsistencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-time Risk Scoring &amp; Alert Generation</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoadDemoBatch}
                disabled={isValidating}
                className="mt-6 w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating &amp; Validating...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Load Synthetic Demo Batch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Validation Engine & Preview */}
      {currentStep === 2 && validationResult && (
        <div className="space-y-6">
          {/* Validation Status Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Rows Scanned</span>
              <div className="text-2xl font-black text-[#08102B] mt-1">
                {validationResult.total_rows}
              </div>
              <span className="text-[11px] text-slate-500">Batch #{validationResult.batch_id}</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-mono text-emerald-700 block uppercase">Valid Records</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {validationResult.valid_count}
              </div>
              <span className="text-[11px] text-emerald-600">Passed all 8 integrity checks</span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-mono text-rose-700 block uppercase">Blocking Errors</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {validationResult.error_count}
              </div>
              <span className="text-[11px] text-rose-600">Must be reconciled or filtered</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-mono text-amber-700 block uppercase">Audit Warnings</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {validationResult.warning_count}
              </div>
              <span className="text-[11px] text-amber-600">Potential anomaly indicators</span>
            </div>
          </div>

          {/* Validation Issues Breakdown */}
          {validationResult.issues.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#08102B]">
                    Validation Report &amp; Rule Violations ({validationResult.issues.length})
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['ALL', 'ERROR', 'WARNING'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setIssueFilter(f)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        issueFilter === f
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {filteredIssues.map((issue: ValidationIssue, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3 text-xs">
                    {issue.severity === 'ERROR' ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          Row {issue.row_index !== null && issue.row_index !== undefined ? issue.row_index : 'General'}:
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                          {issue.error_type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Field: {issue.field || 'N/A'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 font-light">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#08102B]">
                  Incoming Dataset Preview ({validationResult.preview_rows.length} Rows)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing sample rows
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="p-2.5">Work ID</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">State / District</th>
                    <th className="p-2.5 text-right">Sanctioned (₹)</th>
                    <th className="p-2.5 text-right">Expenditure (₹)</th>
                    <th className="p-2.5 text-center">Progress</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-manrope">
                  {validationResult.preview_rows.map((row: any, idx: number) => {
                    const sanc = Number(row.sanctioned_amount || 0);
                    const exp = Number(row.cumulative_expenditure || 0);
                    const prog = Number(row.physical_progress_pct || 0);
                    const isOver = exp > sanc && sanc > 0;
                    const isNegative = exp < 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-slate-600 font-bold">{row.work_id}</td>
                        <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate" title={row.title}>
                          {row.title}
                        </td>
                        <td className="p-2.5 text-slate-600">{row.category || 'General'}</td>
                        <td className="p-2.5 text-slate-600">
                          {row.state} / {row.district}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-800">
                          ₹{(sanc / 100000).toFixed(2)}L
                        </td>
                        <td className={`p-2.5 text-right font-mono font-bold ${isNegative ? 'text-rose-600' : isOver ? 'text-amber-600' : 'text-slate-800'}`}>
                          ₹{(exp / 100000).toFixed(2)}L
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                            prog >= 100
                              ? 'bg-emerald-50 text-emerald-700'
                              : prog > 50
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {prog}%
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {row.work_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Ready to Ingest {validationResult.valid_count} Records
                </p>
                <p className="text-[11px] text-slate-500 font-light">
                  Upon confirmation, the 3-layer anomaly engine will evaluate robust Z-scores, timeline lags, and IsolationForest weights.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isConfirming || !validationResult.can_import}
                className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Normalizing &amp; Scoring Risk...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Run Risk Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {confirmError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{confirmError}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Ingestion & Risk Scoring Complete */}
      {currentStep === 3 && confirmResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Success Banner */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">
                  Pipeline Execution Successful
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {confirmResult.message}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-900 font-light max-w-3xl">
              All records have been normalized and committed to the database. The multi-tiered risk engine assessed financial ratios, schedule delay predictions, cost benchmarks, and unsupervised anomaly vectors.
            </p>

            {/* Results Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Records Ingested</span>
                <div className="text-2xl font-black text-[#08102B] mt-1">
                  {confirmResult.imported_count}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs">
                <span className="text-[10px] font-mono text-blue-600 uppercase">Batch Identifier</span>
                <div className="text-sm font-black text-[#2563EB] mt-1 font-mono truncate" title={confirmResult.batch_id}>
                  {confirmResult.batch_id}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-mono text-amber-700 uppercase">Alerts Created</span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {confirmResult.alerts_created}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-mono text-rose-700 uppercase">Avg Risk Score</span>
                <div className="text-2xl font-black text-rose-700 mt-1 font-mono">
                  {confirmResult.average_risk_score.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/cases"
              className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-[#2563EB] hover:shadow-md transition group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#08102B] group-hover:text-[#2563EB] transition">
                  Review Generated Alerts
                </h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Inspect the newly created alerts in the Cases &amp; Governance Hub with full lifecycle transitions (Acknowledge, Assign, Resolve).
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Open Alerts Hub</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/dashboards"
              className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-[#2563EB] hover:shadow-md transition group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#08102B] group-hover:text-[#2563EB] transition">
                  Role-Tailored Dashboards
                </h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  View National MoSPI macro KPIs, State Nodal district comparisons, or District Authority project execution velocity.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Open Dashboards</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/works"
              className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-[#2563EB] hover:shadow-md transition group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#08102B] group-hover:text-[#2563EB] transition">
                  Public Works Explorer
                </h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Search, filter, and inspect newly ingested records, physical vs financial progress divergence, and contractor details.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>Explore Works</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};
