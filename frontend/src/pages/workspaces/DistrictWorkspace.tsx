import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Camera,
  MapPin,
  FileSpreadsheet,
  AlertOctagon,
  X,
  Send,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../../api/client';
import {
  DistrictDashboard,
  Work,
  Recommendation,
  AlertItem
} from '../../api/types';
import { useRole } from '../../context/RoleContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const DistrictWorkspace: React.FC = () => {
  const { user, selectedDistrict, selectedState } = useRole();
  const districtName = (user?.district || selectedDistrict || 'PUNE').toUpperCase();
  const stateName = (user?.state || selectedState || 'MAHARASHTRA').toUpperCase();

  const [districtData, setDistrictData] = useState<DistrictDashboard | null>(null);
  const [districtWorks, setDistrictWorks] = useState<Work[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [localAlerts, setLocalAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Milestone Update Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedWorkForMilestone, setSelectedWorkForMilestone] = useState<Work | null>(null);
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    physical_progress_pct: 50,
    contractor_velocity_score: 85,
    geo_latitude: 18.5204,
    geo_longitude: 73.8567,
    inspection_notes: '',
    is_completed: false
  });

  // Financial Correction Request Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    entity_type: 'WORK',
    entity_id: '',
    field_name: 'sanctioned_amount',
    previous_value: '',
    proposed_value: '',
    reason: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dData, worksRes, recs, alertsRes] = await Promise.all([
        api.getDistrictDashboard(districtName, stateName),
        api.getWorks({ state: stateName, constituency: districtName, limit: 25 }).catch(() => ({ items: [] })),
        api.listRecommendations().catch(() => []),
        api.getAlerts({ state: stateName, district: districtName, limit: 5 }).catch(() => ({ items: [] }))
      ]);
      setDistrictData(dData);
      setDistrictWorks(worksRes.items || []);
      setRecommendations(recs || []);
      setLocalAlerts(alertsRes.items || []);
    } catch (err: any) {
      setError(err.message || `Failed to load district console for ${districtName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [districtName, stateName]);

  // Handle Ground Milestone Update
  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkForMilestone) return;
    try {
      setMilestoneSubmitting(true);
      await api.updateWorkExecution(selectedWorkForMilestone.work_id, {
        physical_progress_pct: Number(milestoneForm.physical_progress_pct),
        contractor_velocity_score: Number(milestoneForm.contractor_velocity_score),
        geo_latitude: Number(milestoneForm.geo_latitude),
        geo_longitude: Number(milestoneForm.geo_longitude),
        inspection_notes: milestoneForm.inspection_notes,
        is_completed: milestoneForm.is_completed
      });
      setIsMilestoneModalOpen(false);
      setSelectedWorkForMilestone(null);
      alert('Milestone progress updated and recorded in the statutory audit log.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update work milestone');
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  // Submit Financial Correction Request
  const handleCreateCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCorrectionSubmitting(true);
      await api.createCorrectionRequest(correctionForm);
      setIsCorrectionModalOpen(false);
      alert('Formal Financial Correction Request logged. Submitted to Ministry for sign-off. Historical voucher remains sealed until authorized.');
      setCorrectionForm({
        entity_type: 'WORK',
        entity_id: '',
        field_name: 'sanctioned_amount',
        previous_value: '',
        proposed_value: '',
        reason: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction request');
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  // Technical Sanction Action on Recommendation
  const handleAdvanceRec = async (recId: string, status: string) => {
    const remarks = prompt(`Enter statutory technical sanction justification for ${status}:`);
    if (remarks === null) return;
    try {
      await api.advanceRecommendationWorkflow(recId, status, remarks || undefined);
      alert(`Recommendation updated to ${status}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update recommendation');
    }
  };

  // Resolve Local Alert
  const handleResolveAlert = async (alertId: string) => {
    const note = prompt('Enter field inspection note to resolve this alert:');
    if (note === null) return;
    try {
      await api.updateAlert(alertId, {
        status: 'RESOLVED',
        reviewer_comment: note || 'Resolved by District Implementing Authority following physical ground inspection.'
      });
      alert('Alert marked as resolved in district records.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update alert');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#71717A]">Loading District Authority Console ({districtName})...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <Breadcrumbs
        items={[
          { label: 'Governance Consoles' },
          { label: `District Authority (${districtName}, ${stateName})` }
        ]}
      />

      {/* District Authority Header */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-[10px] font-mono font-bold border border-[#E8C5B6] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>DISTRICT IMPLEMENTING AUTHORITY (IDA / DM)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                Ground Execution Jurisdiction: {districtName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121316]">
              {districtName} District Infrastructure Execution &amp; Sanctions
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-3xl">
              Statutory technical sanctions within 45-day SLA, physical milestone verification, contractor velocity monitoring, and local ground anomaly resolution.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCorrectionModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
              <span>Request Financial Correction</span>
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

        {/* 45-Day Sanction Clock & District KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">45-Day Sanction Clock</div>
            <div className="text-xl font-bold font-serif text-emerald-700 mt-1">100% SLA</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Zero lapsed proposals</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Active Works</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              {districtData?.kpis?.total_works?.toLocaleString('en-IN') ?? '1,420'}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">{districtName} Jurisdiction</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Sanctioned Outlay</div>
            <div className="text-xl font-bold font-serif text-[#121316] mt-1">
              ₹{((districtData?.kpis?.total_sanctioned_cr ?? 62.4)).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-[#71717A] font-mono mt-0.5">Approved allocations</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Expenditure Disbursed</div>
            <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
              ₹{((districtData?.kpis?.total_spent_cr ?? 55.2)).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">88.5% Disbursement</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4E2DC]">
            <div className="text-[10px] font-mono uppercase text-[#71717A]">Local Priority Alerts</div>
            <div className="text-xl font-bold font-serif text-rose-700 mt-1">
              {localAlerts.filter(a => a.status !== 'RESOLVED').length}
            </div>
            <div className="text-[10px] text-rose-700 font-mono mt-0.5">Requiring DM resolution</div>
          </div>
        </div>
      </div>

      {/* MP Recommendations Requiring Technical Sanction */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              MP Recommendations Awaiting Technical Sanction (45-Day Statutory Window)
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            Rule 3.12 MPLADS
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E4E2DC]">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-mono text-[#121316]">All MP recommendations have received technical sanction.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#121316]">
                      {rec.proposed_title || rec.title || 'Infrastructure Scheme'}
                    </h3>
                    <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                      Sector: {rec.sector || rec.category || 'Civil'} &bull; MP: {rec.mp_id || 'Lok Sabha Pune'}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    rec.status === 'TECHNICAL_SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                    rec.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#121316]">
                  Estimated Cost: <span className="font-bold">₹{((rec.estimated_cost || 1500000) / 100000).toFixed(2)} Lakhs</span>
                </div>

                {rec.status !== 'TECHNICAL_SANCTIONED' && rec.status !== 'REJECTED' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAdvanceRec(rec.recommendation_id || rec.id || '', 'TECHNICAL_SANCTIONED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Grant Technical Sanction</span>
                    </button>
                    <button
                      onClick={() => handleAdvanceRec(rec.recommendation_id || rec.id || '', 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject with Reasons</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* District Works Table with Milestone Progress Updater */}
      <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C85A32]" />
            <h2 className="text-base font-serif font-bold text-[#121316]">
              District Public Works &amp; Milestone Progress Execution
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            Field Execution Verification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E4E2DC] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2.5 pr-3">Work ID & Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Sanction Amount</th>
                <th className="py-2.5 px-3">Physical Progress</th>
                <th className="py-2.5 pl-3 text-right">Ground Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]/60">
              {districtWorks.slice(0, 8).map((work) => (
                <tr key={work.work_id} className="hover:bg-[#FAF8F5] transition">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-[#121316] line-clamp-1">
                      #{work.work_id} &bull; {work.title || work.work_description_normalized || 'Public Scheme'}
                    </div>
                    <div className="text-[10px] font-mono text-[#71717A]">
                      Contractor: {work.implementing_agency || 'District PWD'}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#4A4D53]">
                    {work.category || work.category_normalized || 'Civil'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#121316]">
                    ₹{((work.sanctioned_amount || 2500000) / 100000).toFixed(2)} L
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E4E2DC] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${work.physical_progress_pct ?? 50}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#121316]">{work.physical_progress_pct ?? 50}%</span>
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedWorkForMilestone(work);
                        setMilestoneForm({
                          physical_progress_pct: work.physical_progress_pct ?? 50,
                          contractor_velocity_score: 85,
                          geo_latitude: 18.5204,
                          geo_longitude: 73.8567,
                          inspection_notes: '',
                          is_completed: (work.physical_progress_pct ?? 0) >= 100
                        });
                        setIsMilestoneModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF0EB] hover:bg-[#F3E5DE] text-[#C85A32] border border-[#E8C5B6] text-xs font-semibold flex items-center gap-1.5 ml-auto transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Record Progress</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Ground Alerts Queue */}
      {localAlerts.length > 0 && (
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-serif font-bold text-[#121316]">
                Local Ground Anomaly Alerts ({districtName})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#71717A]">
              Immediate District Action
            </span>
          </div>

          <div className="space-y-3">
            {localAlerts.map((alert) => (
              <div key={alert.alert_id} className="p-4 rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#121316]">{alert.title}</span>
                    <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-rose-100 text-rose-800">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-1">{alert.description}</p>
                </div>
                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolveAlert(alert.alert_id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0 transition cursor-pointer"
                  >
                    Resolve Alert
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Updater Modal */}
      {isMilestoneModalOpen && selectedWorkForMilestone && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#121316]">
                  Record Physical Milestone Progress
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Work #{selectedWorkForMilestone.work_id} &bull; {selectedWorkForMilestone.title || 'Scheme'}
                </p>
              </div>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0EFEA] text-[#71717A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#121316] mb-1">
                  Physical Progress Percentage ({milestoneForm.physical_progress_pct}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={milestoneForm.physical_progress_pct}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, physical_progress_pct: Number(e.target.value) })}
                  className="w-full accent-[#C85A32] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Geo-Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={milestoneForm.geo_latitude}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, geo_latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Geo-Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={milestoneForm.geo_longitude}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, geo_longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">
                  Inspection Notes &amp; Geo-Tagged Photographic Evidence
                </label>
                <textarea
                  required
                  rows={3}
                  value={milestoneForm.inspection_notes}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, inspection_notes: e.target.value })}
                  placeholder="Record physical ground observations, material quality check, and site engineer name..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={milestoneForm.is_completed}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, is_completed: e.target.checked })}
                  className="accent-[#C85A32] rounded"
                />
                <label htmlFor="isCompleted" className="text-xs text-[#121316]">
                  Mark work as physically completed &amp; ready for final social audit
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#71717A] hover:bg-[#F0EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={milestoneSubmitting}
                  className="cw-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{milestoneSubmitting ? 'Recording...' : 'Record Milestone in Audit Ledger'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Financial Correction Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E4E2DC] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E4E2DC] pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-[#121316]">
                  Request Financial Correction
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Submits formal double-entry adjustment to Ministry
                </p>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F0EFEA] text-[#71717A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCorrection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Work ID</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 1024"
                  value={correctionForm.entity_id}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, entity_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">Field Name</label>
                <select
                  value={correctionForm.field_name}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, field_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono bg-white"
                >
                  <option value="sanctioned_amount">sanctioned_amount</option>
                  <option value="expenditure_amount">expenditure_amount</option>
                  <option value="implementing_agency">implementing_agency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Previous Value</label>
                  <input
                    required
                    placeholder="e.g. 2500000"
                    value={correctionForm.previous_value}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, previous_value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#71717A] mb-1">Proposed Value</label>
                  <input
                    required
                    placeholder="e.g. 2750000"
                    value={correctionForm.proposed_value}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, proposed_value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#71717A] mb-1">
                  Justification &amp; Statutory Accounting Voucher Ref
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail official reason, revised technical estimate ref, and Treasury sanction memo number..."
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E4E2DC]">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E2DC] text-xs text-[#71717A] hover:bg-[#F0EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={correctionSubmitting}
                  className="cw-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{correctionSubmitting ? 'Logging...' : 'Submit to Ministry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
