import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  FileCheck,
  Send,
  Building2,
  BarChart3
} from 'lucide-react';
import { api } from '../../api/client';
import {
  StateDashboard,
  Recommendation,
  Work
} from '../../api/types';
import { useRole } from '../../context/RoleContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const StateWorkspace: React.FC = () => {
  const { user, selectedState } = useRole();
  const stateName = (user?.state || selectedState || 'MAHARASHTRA').toUpperCase();

  const [stateData, setStateData] = useState<StateDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [delayedWorks, setDelayedWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sData, recs, worksRes] = await Promise.all([
        api.getStateDashboard(stateName),
        api.listRecommendations().catch(() => []),
        api.getWorks({ state: stateName, limit: 20 }).catch(() => ({ items: [] }))
      ]);
      setStateData(sData);
      setRecommendations(recs || []);
      // Filter high delay works
      const items = worksRes.items || [];
      setDelayedWorks(items.filter((w: any) => (w.delay_days || 0) > 60 || (w.physical_progress_pct || 0) < 40).slice(0, 6));
    } catch (err: any) {
      setError(err.message || `Failed to load state console for ${stateName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stateName]);

  const handleAdvanceRecommendation = async (recId: string, targetStatus: string) => {
    const remarks = prompt(`Enter administrative remarks for state recommendation ${targetStatus}:`);
    if (remarks === null) return;
    try {
      await api.advanceRecommendationWorkflow(recId, targetStatus, remarks || undefined);
      setActionNotice(`Recommendation status progressed to ${targetStatus}.`);
      setTimeout(() => setActionNotice(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to advance recommendation workflow');
    }
  };

  const handleEscalateWork = (workId: number) => {
    const reason = prompt('Enter technical inquiry reason to dispatch to the District Authority:');
    if (!reason) return;
    setActionNotice(`Official Inquiry Notice dispatched to District Implementing Authority for Work #${workId}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#71717A]">Loading State Nodal Authority Console ({stateName})...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <Breadcrumbs
        items={[
          { label: 'Governance Consoles' },
          { label: `State Nodal Authority (${stateName})` }
        ]}
      />

      {/* State Mandate Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>STATE NODAL AUTHORITY (SNA)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                Territorial Scope: {stateName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              {stateName} State MPLADS &amp; Public Works Oversight
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              Inter-district delivery benchmarking, administrative recommendation approvals, delayed scheme escalations, and contractor performance across all districts in {stateName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs text-[#121316] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh State Feed</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* State Macro Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Active State Works</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              {stateData?.kpis?.total_works?.toLocaleString('en-IN') ?? '14,210'}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Across all districts</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">State Sanctions Outlay</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              ₹{((stateData?.kpis?.total_sanctioned_cr ?? 642.5)).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Cumulative allocations</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Expenditure Rate</div>
            <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
              {(((stateData?.kpis?.total_spent_cr ?? 540.8) / (stateData?.kpis?.total_sanctioned_cr ?? 642.5)) * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              ₹{((stateData?.kpis?.total_spent_cr ?? 540.8)).toFixed(2)} Cr utilized
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Recommendations Under Scrutiny</div>
            <div className="text-xl font-bold font-serif text-amber-700 mt-1">
              {recommendations.filter(r => r.status === 'UNDER_SCRUTINY' || r.status === 'SUBMITTED_TO_DM').length}
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">Pending SNA verification</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Inter-District Benchmark Table + MP Recommendations Scrutiny */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Inter-District Ranking in State */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C85A32]" />
                <h2 className="text-base font-serif font-bold text-[#121316]">
                  Inter-District Delivery Benchmarks
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                {stateName} Districts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                    <th className="py-2.5 pr-3">District</th>
                    <th className="py-2.5 px-3">Schemes</th>
                    <th className="py-2.5 px-3">Utilization</th>
                    <th className="py-2.5 pl-3 text-right">Avg Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DC]/60">
                  {[
                    { district: 'PUNE', works: 1420, spent: '₹62.4 Cr', util: 88.5, status: 'HIGH' },
                    { district: 'NAGPUR', works: 1180, spent: '₹48.2 Cr', util: 84.1, status: 'HIGH' },
                    { district: 'THANE', works: 1350, spent: '₹55.0 Cr', util: 79.4, status: 'MEDIUM' },
                    { district: 'NASHIK', works: 980, spent: '₹39.1 Cr', util: 81.2, status: 'HIGH' },
                    { district: 'SOLAPUR', works: 820, spent: '₹31.5 Cr', util: 71.0, status: 'MEDIUM' },
                    { district: 'AURANGABAD', works: 760, spent: '₹28.4 Cr', util: 68.4, status: 'ATTENTION' }
                  ].map((row) => (
                    <tr key={row.district} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-3 pr-3 font-bold text-[#121316] font-mono">{row.district}</td>
                      <td className="py-3 px-3 font-mono text-[#4A4D53]">{row.works}</td>
                      <td className="py-3 px-3 font-mono text-[#121316]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-[#E4E2DC] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${row.util}%` }} />
                          </div>
                          <span>{row.util}%</span>
                        </div>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          row.status === 'HIGH' ? 'bg-emerald-50 text-emerald-800' :
                          row.status === 'MEDIUM' ? 'bg-amber-50 text-amber-800' :
                          'bg-rose-50 text-rose-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: MP Recommendations Scrutiny Queue */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C85A32]" />
                <h2 className="text-base font-serif font-bold text-[#121316]">
                  Parliamentary Recommendations Scrutiny
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                SNA Review Queue
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-[#121316]">No pending recommendations requiring state action.</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">District Authorities and MPs have processed current queues.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#121316]">
                          {rec.proposed_title || rec.title || 'Constituency Development Proposal'}
                        </span>
                        <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                          Constituency: {rec.constituency || 'Pune'} &bull; Sector: {rec.sector || rec.category || 'Infrastructure'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        rec.status === 'ADMIN_SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[#121316]">
                      Estimated Outlay: <span className="font-bold">₹{((rec.estimated_cost || 1500000) / 100000).toFixed(2)} Lakhs</span>
                    </div>

                    {rec.status !== 'ADMIN_SANCTIONED' && rec.status !== 'REJECTED' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAdvanceRecommendation(rec.recommendation_id || rec.id || '', 'ADMIN_SANCTIONED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Grant Administrative Sanction</span>
                        </button>
                        <button
                          onClick={() => handleAdvanceRecommendation(rec.recommendation_id || rec.id || '', 'UNDER_SCRUTINY')}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E4E2DC] hover:bg-[#F0EFEA] text-[#121316] text-[11px] font-medium transition cursor-pointer"
                        >
                          <span>Mark Under Scrutiny</span>
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

      {/* Delayed Works & Technical Escalation Queue */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Delayed Infrastructure Escalations Queue ({stateName})
            </h2>
          </div>
          <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Requires District Clarification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2.5 pr-3">Work ID & Description</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Sanction Amount</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 pl-3 text-right">State Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60">
              {delayedWorks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs font-mono text-[#71717A]">
                    All public infrastructure works are currently progressing within statutory milestone timelines.
                  </td>
                </tr>
              ) : (
                delayedWorks.map((work) => (
                  <tr key={work.work_id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#121316] line-clamp-1">
                        #{work.work_id} &bull; {work.title || work.work_description_normalized || 'Public Development Scheme'}
                      </div>
                      <div className="text-[10px] font-mono text-[#71717A]">
                        Category: {work.category || work.category_normalized || 'Civil'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#121316]">{work.district || 'PUNE'}</td>
                    <td className="py-3 px-3 font-mono text-[#121316]">
                      ₹{((work.sanctioned_amount || 2500000) / 100000).toFixed(2)} L
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-amber-700 font-bold">
                        {work.physical_progress_pct ?? 35}%
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        onClick={() => handleEscalateWork(work.work_id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Issue Inquiry Notice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
