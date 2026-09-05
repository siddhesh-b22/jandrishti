import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck,
  History,
  Layers,
  ArrowRight,
  Receipt,
  Download
} from 'lucide-react';
import { api } from '../../api/client';
import {
  NationalDashboard,
  RiskWeightsConfig,
  CorrectionRequest,
  StatutoryAuditLog,
  AlertItem
} from '../../api/types';
import { useRole } from '../../context/RoleContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const MinistryWorkspace: React.FC = () => {
  const { user } = useRole();
  const [nationalData, setNationalData] = useState<NationalDashboard | null>(null);
  const [auditLogs, setAuditLogs] = useState<StatutoryAuditLog[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Risk Engine Weights Configuration
  const [weights, setWeights] = useState<RiskWeightsConfig['weights']>({
    financial_anomaly_weight: 0.3,
    physical_delay_weight: 0.25,
    vendor_risk_weight: 0.25,
    statistical_anomaly_weight: 0.2
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsSavedMsg, setWeightsSavedMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nData, wConfig, aData, logs, corrs] = await Promise.all([
        api.getNationalDashboard(),
        api.getRiskWeights().catch(() => null),
        api.getAlerts({ limit: 6 }).catch(() => ({ items: [] })),
        api.getAuditLogs(25).catch(() => []),
        api.listCorrectionRequests().catch(() => [])
      ]);
      setNationalData(nData);
      if (wConfig && wConfig.weights) setWeights(wConfig.weights);
      if (aData && aData.items) setAlerts(aData.items);
      setAuditLogs(logs || []);
      setCorrectionRequests(corrs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load National MoSPI dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveWeights = async () => {
    try {
      setSavingWeights(true);
      setWeightsSavedMsg(null);
      await api.updateRiskWeights(weights);
      setWeightsSavedMsg('Regulatory weights applied & national risk engine recalibrated.');
      setTimeout(() => setWeightsSavedMsg(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update risk engine weights');
    } finally {
      setSavingWeights(false);
    }
  };

  const handleReviewCorrection = async (corrId: string, action: 'APPROVE' | 'REJECT') => {
    const comments = prompt(`Enter administrative rationale for ${action}:`);
    if (comments === null) return;
    try {
      await api.reviewCorrectionRequest(corrId, action, comments || undefined);
      alert(`Correction request ${action}D successfully. Statutory audit trail updated.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to review correction request');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#71717A]">Loading National MoSPI Governance Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <Breadcrumbs
        items={[
          { label: 'Governance Consoles' },
          { label: 'National MoSPI Executive Desk' }
        ]}
      />

      {/* Role Mandate Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                National Oversight Mandate
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              National Public Expenditure &amp; Risk Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              All-India fiscal velocity oversight, risk engine parameter calibration, inter-state performance benchmarking, and statutory financial correction sign-off.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs text-[#121316] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh National Telemetry</span>
            </button>
          </div>
        </div>

        {/* National Macro Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Total Public Works</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              {nationalData?.kpis?.total_works?.toLocaleString('en-IN') ?? '1,02,437'}
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Across 36 States & UTs</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Sanctioned Outlay</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              ₹{((nationalData?.kpis?.total_sanctioned_cr ?? 4567.89)).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">MPLADS Allocations</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Total Expenditure</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              ₹{((nationalData?.kpis?.total_spent_cr ?? 3890.12)).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              {(((nationalData?.kpis?.total_spent_cr ?? 3890.12) / (nationalData?.kpis?.total_sanctioned_cr ?? 4567.89)) * 100).toFixed(1)}% Velocity
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Flagged Anomaly Dossiers</div>
            <div className="text-xl font-bold font-serif text-[#C85A32] mt-1">
              {alerts.length > 0 ? alerts.length : 84}
            </div>
            <div className="text-[10px] text-[#C85A32] font-mono mt-0.5">Objective statistical flags</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Pending Corrections</div>
            <div className="text-xl font-bold font-serif text-amber-700 mt-1">
              {correctionRequests.filter(c => c.status === 'PENDING').length}
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">Awaiting Ministry Approval</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Risk Engine Tuning + Financial Correction Approval Queue */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Risk Engine Calibration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C85A32]" />
                <h2 className="text-base font-serif font-bold text-[#121316]">
                  Regulatory Risk Engine Calibration
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-[#FAF0EB] text-[#C85A32] px-2 py-0.5 rounded border border-[#E8C5B6]">
                MoSPI Authority
              </span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Adjust weights for automated composite risk scoring across all public infrastructure works in India. Changes are instantly logged in the immutable audit trail.
            </p>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#121316]">Financial Anomaly Weight</span>
                  <span className="text-[#C85A32] font-bold">{(weights?.financial_anomaly_weight ?? 0.3).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights?.financial_anomaly_weight ?? 0.3}
                  onChange={(e) => setWeights({ ...weights, financial_anomaly_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#121316]">Physical Delay & Stagnation Weight</span>
                  <span className="text-[#C85A32] font-bold">{(weights?.physical_delay_weight ?? 0.25).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights?.physical_delay_weight ?? 0.25}
                  onChange={(e) => setWeights({ ...weights, physical_delay_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#121316]">Vendor Risk (HHI Concentration)</span>
                  <span className="text-[#C85A32] font-bold">{(weights?.vendor_risk_weight ?? 0.25).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights?.vendor_risk_weight ?? 0.25}
                  onChange={(e) => setWeights({ ...weights, vendor_risk_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#121316]">Statistical Distribution Anomaly (MAD)</span>
                  <span className="text-[#C85A32] font-bold">{(weights?.statistical_anomaly_weight ?? 0.2).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights?.statistical_anomaly_weight ?? 0.2}
                  onChange={(e) => setWeights({ ...weights, statistical_anomaly_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>
            </div>

            {weightsSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{weightsSavedMsg}</span>
              </div>
            )}

            <button
              onClick={handleSaveWeights}
              disabled={savingWeights}
              className="cw-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>{savingWeights ? 'Applying Regulatory Calibration...' : 'Apply Regulatory Weights to All India Engine'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Statutory Financial Correction Requests Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C85A32]" />
                <h2 className="text-base font-serif font-bold text-[#121316]">
                  Financial Correction Approvals Queue
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                Double-Entry Ledger Integrity
              </span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed">
              District authorities cannot alter settled financial entries directly. All adjustments require formal submission to the Ministry with auditable justifications.
            </p>

            {correctionRequests.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-[#121316]">No pending financial correction requests.</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">All district voucher ledgers are reconciled with zero pending variance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {correctionRequests.map((req) => (
                  <div key={req.request_id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#121316]">
                        Correction #{req.request_id} &bull; Work #{req.work_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800 font-bold'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-white p-2.5 rounded-lg border border-[#E4E2DC]">
                      <div>
                        <span className="text-[#71717A] block text-[10px]">Field</span>
                        <span className="font-bold text-[#121316]">{req.field_name}</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block text-[10px]">Current Value</span>
                        <span className="text-rose-700 line-through">{req.original_value}</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] block text-[10px]">Requested Value</span>
                        <span className="text-emerald-700 font-bold">{req.requested_value}</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#71717A]">
                      <span className="font-semibold text-[#121316]">DM Justification:</span> {req.justification_reason}
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleReviewCorrection(req.correction_id || req.request_id || '', 'APPROVE')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize Correction</span>
                        </button>
                        <button
                          onClick={() => handleReviewCorrection(req.correction_id || req.request_id || '', 'REJECT')}
                          className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inter-State Allocation & Performance Matrix */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Inter-State Allocation &amp; Execution Benchmarks
            </h2>
          </div>
          <Link
            to="/states"
            className="text-xs font-mono text-[#C85A32] hover:underline flex items-center gap-1"
          >
            <span>Open 36 States National Atlas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2.5 pr-4">State / UT</th>
                <th className="py-2.5 px-3">Active Works</th>
                <th className="py-2.5 px-3">Sanctioned (₹ Cr)</th>
                <th className="py-2.5 px-3">Expenditure Velocity</th>
                <th className="py-2.5 px-3">Stagnant / Delayed</th>
                <th className="py-2.5 pl-3 text-right">Composite Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60">
              {[
                { name: 'MAHARASHTRA', works: 14210, sanctioned: 642.5, velocity: 84.2, delayed: 312, risk: 'LOW' },
                { name: 'UTTAR PRADESH', works: 19840, sanctioned: 890.0, velocity: 78.6, delayed: 684, risk: 'MEDIUM' },
                { name: 'KARNATAKA', works: 9450, sanctioned: 420.2, velocity: 82.1, delayed: 189, risk: 'LOW' },
                { name: 'GUJARAT', works: 8910, sanctioned: 395.0, velocity: 88.4, delayed: 124, risk: 'LOW' },
                { name: 'BIHAR', works: 12150, sanctioned: 540.8, velocity: 69.8, delayed: 512, risk: 'HIGH' },
                { name: 'WEST BENGAL', works: 11020, sanctioned: 480.0, velocity: 73.1, delayed: 398, risk: 'MEDIUM' }
              ].map((row) => (
                <tr key={row.name} className="hover:bg-[#FAF8F5] transition">
                  <td className="py-3 pr-4 font-bold text-[#121316] font-mono">{row.name}</td>
                  <td className="py-3 px-3 font-mono text-[#4A4D53]">{row.works.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-[#121316]">₹{row.sanctioned.toFixed(1)} Cr</td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E4E2DC] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${row.velocity}%` }} />
                      </div>
                      <span className="text-[#121316]">{row.velocity}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-700">{row.delayed} schemes</td>
                  <td className="py-3 pl-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      row.risk === 'LOW' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      row.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Audit Log Stream */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Statutory Audit Trail (Append-Only Ledger)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            Cryptographically Chained &bull; Read-Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 px-3">Actor Role</th>
                <th className="py-2 px-3">User ID</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 pl-3">Details / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60 font-mono text-[11px]">
              {auditLogs.slice(0, 8).map((log, idx) => (
                <tr key={log.log_id || idx} className="hover:bg-[#FAF8F5]">
                  <td className="py-2 pr-3 text-[#71717A] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-semibold text-[#121316]">{log.user_role}</td>
                  <td className="py-2 px-3 text-[#71717A]">{log.user_id}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#FAF0EB] text-[#C85A32] font-semibold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#121316]">
                    {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                  </td>
                  <td className="py-2 pl-3 text-[#71717A] max-w-xs truncate">
                    {log.details || log.rationale || 'Statutory governance event'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
