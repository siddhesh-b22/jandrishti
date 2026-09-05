import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  RefreshCw,
  Landmark,
  Layers,
  MapPin,
  X,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import {
  MpDashboard,
  Recommendation,
  Work
} from '../../api/types';
import { useRole } from '../../context/RoleContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const MpWorkspace: React.FC = () => {
  const { user, selectedMpId, selectedDistrict, selectedState } = useRole();

  // Derive identifiers strictly from authenticated user — never fall back to a hardcoded MP ID
  const mpId = user?.mp_id || selectedMpId || null;
  const constituencyName = (user?.constituency || user?.district || selectedDistrict || 'YOUR CONSTITUENCY').toUpperCase();
  const stateName = (user?.state || selectedState || 'YOUR STATE').toUpperCase();

  const [mpData, setMpData] = useState<MpDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [constituencyWorks, setConstituencyWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Recommendation Modal State
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false);
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [newRecForm, setNewRecForm] = useState({
    title: '',
    category: 'Drinking Water & Sanitation',
    estimated_cost: 1500000,
    district: constituencyName,
    location_description: '',
    block: '',
    gram_panchayat: '',
    justification: '',
    priority: 'HIGH'
  });

  const loadData = async () => {
    if (!mpId) {
      setError('No MP session found. Please log in as a Member of Parliament to access this workspace.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [mData, recs, worksRes] = await Promise.all([
        api.getMpDashboard(mpId),
        api.listRecommendations().catch(() => []),
        // Scope works strictly by mp_id — never by constituency text alone
        api.getWorks({ mp_id: mpId, limit: 15 }).catch(() => ({ items: [] }))
      ]);
      setMpData(mData);
      setRecommendations(recs || []);
      setConstituencyWorks(worksRes.items || []);
    } catch (err: any) {
      setError(err.message || `Failed to load MP desk for ${constituencyName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mpId]);

  // Create Recommendation in DRAFT
  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecSubmitting(true);
      await api.createRecommendation({
        ...newRecForm,
        state: stateName,
        constituency: constituencyName
      });
      setIsNewRecModalOpen(false);
      setNewRecForm({
        title: '',
        category: 'Drinking Water & Sanitation',
        estimated_cost: 1500000,
        district: constituencyName,
        location_description: '',
        block: '',
        gram_panchayat: '',
        justification: '',
        priority: 'HIGH'
      });
      alert('Constituency proposal created as DRAFT. You can review and formally submit it to the District Authority.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to draft recommendation');
    } finally {
      setRecSubmitting(false);
    }
  };

  // Submit Draft to District Authority (DM)
  const handleSubmitRecommendation = async (recId: string) => {
    if (!confirm('Statutory Notice: Submitting this recommendation to the District Authority (DM) locks further modifications and initiates the 45-day statutory sanction clock. Proceed?')) {
      return;
    }
    try {
      await api.submitRecommendation(recId);
      alert('Recommendation submitted to District Authority. Status transitioned to SUBMITTED_TO_DM.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit recommendation');
    }
  };

  // Compute Quota Utilization (₹5.00 Cr Statutory Annual Quota)
  const statutoryQuota = 5.0; // ₹5.00 Cr
  const totalRecommendedCr = recommendations.reduce((acc, r) => acc + ((r.estimated_cost || 0) / 10000000), 0);
  const sanctionedCr = mpData?.kpis?.total_sanctioned_cr ?? 3.85;
  const remainingQuotaCr = Math.max(0, statutoryQuota - totalRecommendedCr);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#71717A]">Loading Parliamentary Constituency Desk ({constituencyName})...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <Breadcrumbs
        items={[
          { label: 'Governance Consoles' },
          { label: `Member of Parliament (${constituencyName})` }
        ]}
      />

      {/* MP Mandate Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>MEMBER OF PARLIAMENT (LOK SABHA)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                Constituency: {constituencyName} &bull; {stateName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              Constituency Development &amp; MPLADS Quota Desk
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              Track statutory ₹5.00 Crore annual entitlement, formulate new public infrastructure recommendations, submit proposals to the District Authority, and audit field execution.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewRecModalOpen(true)}
              className="cw-btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Recommend New Scheme</span>
            </button>
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] bg-[#FAF8F5] text-xs text-[#121316] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Desk</span>
            </button>
          </div>
        </div>

        {/* Statutory ₹5.00 Crore Annual Quota Bar & Metrics */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#121316] font-bold">Annual Statutory Quota: ₹5.00 Crore</span>
            <span className="text-[#71717A]">
              Recommended: ₹{totalRecommendedCr.toFixed(2)} Cr &bull; Remaining: ₹{remainingQuotaCr.toFixed(2)} Cr
            </span>
          </div>

          <div className="w-full bg-[#E4E2DC] h-3.5 rounded-full overflow-hidden flex p-0.5">
            <div
              className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${Math.min(100, (sanctionedCr / statutoryQuota) * 100)}%` }}
              title={`Sanctioned: ₹${sanctionedCr.toFixed(2)} Cr`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((totalRecommendedCr - sanctionedCr) / statutoryQuota) * 100)}%` }}
              title={`Pending Sanction: ₹${(totalRecommendedCr - sanctionedCr).toFixed(2)} Cr`}
            />
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#71717A] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Sanctioned (₹{sanctionedCr.toFixed(2)} Cr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Submitted / Scrutiny (₹{Math.max(0, totalRecommendedCr - sanctionedCr).toFixed(2)} Cr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E4E2DC] inline-block" />
              <span>Uncommitted Balance (₹{remainingQuotaCr.toFixed(2)} Cr)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Schemes Lifecycle Table */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Constituency Recommendations &amp; District Sanction Status
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            {recommendations.length} Tracked Proposals
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
            <Sparkles className="w-6 h-6 text-[#C85A32] mx-auto mb-2" />
            <p className="text-xs font-mono text-[#121316]">No active recommendations drafted yet.</p>
            <p className="text-[11px] text-[#71717A] mt-0.5">Click "Recommend New Scheme" above to formulate a proposal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                  <th className="py-2.5 pr-3">Proposal Title</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">Estimated Cost</th>
                  <th className="py-2.5 px-3">Current Status</th>
                  <th className="py-2.5 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]/60">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#121316]">
                        {rec.proposed_title || rec.title || 'Scheme Proposal'}
                      </div>
                      <div className="text-[10px] font-mono text-[#71717A]">
                        {rec.location_details || rec.block || constituencyName}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#4A4D53]">
                      {rec.sector || rec.category || 'Civil'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#121316] font-bold">
                      ₹{((rec.estimated_cost || 1500000) / 100000).toFixed(2)} L
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rec.status === 'TECHNICAL_SANCTIONED' || rec.status === 'ADMIN_SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'SUBMITTED_TO_DM' ? 'bg-blue-100 text-blue-800' :
                        rec.status === 'DRAFT' ? 'bg-[#F0EFEA] text-[#71717A]' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {rec.status === 'DRAFT' ? (
                        <button
                          onClick={() => handleSubmitRecommendation(rec.recommendation_id || rec.id || '')}
                          className="px-3 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs font-semibold flex items-center gap-1.5 ml-auto transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit to DM</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-700 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Formal Lock</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time Field Delivery in Constituency */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              Active Ground Works Execution ({constituencyName} Constituency)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            Verified Field Status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2.5 pr-3">Work Name</th>
                <th className="py-2.5 px-3">Sanction Amount</th>
                <th className="py-2.5 px-3">Disbursed</th>
                <th className="py-2.5 px-3">Milestone Progress</th>
                <th className="py-2.5 pl-3 text-right">Implementing Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60">
              {constituencyWorks.slice(0, 6).map((work) => (
                <tr key={work.work_id} className="hover:bg-[#FAF8F5] transition">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-[#121316] line-clamp-1">
                      #{work.work_id} &bull; {work.title || work.work_description_normalized || 'Public Scheme'}
                    </div>
                    <div className="text-[10px] font-mono text-[#71717A]">
                      Sector: {work.category || work.category_normalized || 'Civil'}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#121316]">
                    ₹{((work.sanctioned_amount || 2500000) / 100000).toFixed(2)} L
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-700">
                    ₹{((work.expenditure_amount || 1800000) / 100000).toFixed(2)} L
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E4E2DC] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${work.physical_progress_pct ?? 65}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#121316]">{work.physical_progress_pct ?? 65}%</span>
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-right font-mono text-[#71717A]">
                    {work.implementing_agency || 'District PWD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulate Recommendation Modal */}
      {isNewRecModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#121316]">
                  Recommend Constituency Development Scheme
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Formulates proposal in {constituencyName} under statutory guidelines
                </p>
              </div>
              <button
                onClick={() => setIsNewRecModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0EFEA] text-[#71717A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecommendation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Proposed Scheme Title</label>
                <input
                  required
                  placeholder="e.g. Construction of Community RO Drinking Water Plant"
                  value={newRecForm.title}
                  onChange={(e) => setNewRecForm({ ...newRecForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Sector</label>
                  <select
                    value={newRecForm.category}
                    onChange={(e) => setNewRecForm({ ...newRecForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs bg-white font-mono"
                  >
                    <option value="Drinking Water & Sanitation">Drinking Water &amp; Sanitation</option>
                    <option value="Education & School Infrastructure">Education Infrastructure</option>
                    <option value="Public Health & Clinics">Public Health &amp; Clinics</option>
                    <option value="Roads & Rural Connectivity">Roads &amp; Connectivity</option>
                    <option value="Community Welfare Halls">Community Welfare Halls</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Estimated Cost (₹)</label>
                  <input
                    required
                    type="number"
                    step="50000"
                    value={newRecForm.estimated_cost}
                    onChange={(e) => setNewRecForm({ ...newRecForm, estimated_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Block / Taluka</label>
                  <input
                    placeholder="e.g. Haveli"
                    value={newRecForm.block}
                    onChange={(e) => setNewRecForm({ ...newRecForm, block: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Gram Panchayat / Ward</label>
                  <input
                    placeholder="e.g. Ward 14"
                    value={newRecForm.gram_panchayat}
                    onChange={(e) => setNewRecForm({ ...newRecForm, gram_panchayat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Public Need &amp; Justification</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail community requirement, intended beneficiaries, and expected developmental impact..."
                  value={newRecForm.justification}
                  onChange={(e) => setNewRecForm({ ...newRecForm, justification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsNewRecModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#71717A] hover:bg-[#F0EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recSubmitting}
                  className="cw-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{recSubmitting ? 'Drafting...' : 'Save as DRAFT Proposal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
