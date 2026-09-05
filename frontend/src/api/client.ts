import {
  HealthResponse,
  StatsResponse,
  MP,
  MPDetail,
  Work,
  WorkDetail,
  Transaction,
  TransactionDetail,
  Vendor,
  VendorDetail,
  Anomaly,
  PaginatedResponse,
  StateSummary,
  Constituency,
  DistrictItem,
  WorkCategory,
  DuplicatePair,
  ProgressMismatch,
  DelayPrediction,
  WorkIntelligenceProfile,
  DataQualityReport,
  ReviewCase,
  AuditLog,
  SourceRegistryResponse,
  StatutoryRuleResponse,
  ImplementingAgencyListResponse,
  PaymentTimingSignalListResponse,
  GlobalSearchResponse,
  EntityMediaListResponse,
  EntityProfile,
  EntityTimelineResponse,
  DiscoveredSourceListResponse,
  HistoricalSnapshotListResponse,
  ChangeEventListResponse,
  ReconciliationListResponse,
  WorkRiskSummary,
  LgdDistrictListResponse,
  MpCrosswalkResponse,
  SnapshotSyncResponse,
  AreaTrackResponse,
  IngestValidateResponse,
  IngestConfirmResponse,
  RiskWeightsConfig,
  AlertItem,
  AlertListResponse,
  NationalDashboard,
  StateDashboard,
  DistrictDashboard,
  MpDashboard,
  AuthUser,
  DemoAccount,
  LoginPayload,
  LoginResult,
  RbacIdentity,
  Recommendation,
  CorrectionRequest,
  AuditInvestigationCase,
  CitizenReport,
  StatutoryAuditLog,
  TrendAnalytics,
} from './types';

export type {
  AuthUser,
  DemoAccount,
  LoginPayload,
  LoginResult,
  RbacIdentity,
  Recommendation,
  CorrectionRequest,
  AuditInvestigationCase,
  CitizenReport,
  StatutoryAuditLog,
};

const PRODUCTION_BACKEND_URL = 'https://jandrishti-production.up.railway.app';
const rawEnvUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const isLocalhostEnv = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.local')
);

// If in production browser (e.g. Vercel) and VITE_API_URL is unset or points to localhost,
// fall back automatically to the live Railway backend.
const RAW_BASE_URL = rawEnvUrl && (!rawEnvUrl.includes('localhost') && !rawEnvUrl.includes('127.0.0.1') || isLocalhostEnv)
  ? rawEnvUrl
  : (isLocalhostEnv ? 'http://127.0.0.1:8000' : PRODUCTION_BACKEND_URL);

const API_BASE = RAW_BASE_URL ? `${RAW_BASE_URL}/api` : '/api';

function getAuthHeaders(): Record<string, string> {
  try {
    const savedToken = localStorage.getItem('jandrishti_token');
    const role = localStorage.getItem('jandrishti_user_role') || 'CITIZEN';
    const tokenMap: Record<string, string> = {
      MINISTRY_ADMIN: 'jd-demo-ministry-2026',
      MINISTRY_OFFICIAL: 'jd-demo-ministry-2026',
      STATE_NODAL_AUTHORITY: 'jd-demo-state-2026',
      STATE_AUTHORITY: 'jd-demo-state-2026',
      DISTRICT_AUTHORITY: 'jd-demo-district-2026',
      MP: 'jd-demo-mp-2026',
      AUDITOR: 'jd-demo-auditor-2026',
      ANALYST: 'jd-demo-analyst-2026',
      CITIZEN: 'jd-demo-citizen-2026',
    };
    const token = savedToken || tokenMap[role] || 'jd-demo-citizen-2026';
    return {
      'Authorization': `Bearer ${token}`,
      'X-Demo-Role': role,
    };
  } catch {
    return {
      'Authorization': 'Bearer jd-demo-district-2026',
      'X-Demo-Role': 'DISTRICT_AUTHORITY',
    };
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const mergedHeaders: Record<string, string> = {
    ...authHeaders,
    ...((options?.headers as Record<string, string>) || {}),
  };
  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const err = await response.json();
      if (err.detail) errorDetail = err.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('application/json')) {
    throw new Error(`API returned non-JSON response (${contentType.split(';')[0]}). The service may be initializing.`);
  }
  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const api = {
  getHealth: () => fetchJson<HealthResponse>(`${API_BASE}/health`),
  getHouses: () => fetchJson<Array<{ code: string; name: string }>>(`${API_BASE}/houses`),
  getStats: (params?: { house?: string }) => fetchJson<StatsResponse>(`${API_BASE}/stats${params ? buildQuery(params) : ''}`),

  // MPs
  getMps: (params: {
    house?: string;
    state?: string;
    constituency?: string;
    search?: string;
    min_utilization?: number;
    max_utilization?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => fetchJson<PaginatedResponse<MP>>(`${API_BASE}/mps${buildQuery(params)}`),

  getMpDetail: (mpId: string) => fetchJson<MPDetail>(`${API_BASE}/mps/${encodeURIComponent(mpId)}`),

  // Works
  getWorks: (params: {
    house?: string;
    state?: string;
    district?: string;
    constituency?: string;
    mp_id?: string;
    category?: string;
    lifecycle_status?: string;
    recommendation_year?: number;
    completion_year?: number;
    min_amount?: number;
    max_amount?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => fetchJson<PaginatedResponse<Work>>(`${API_BASE}/works${buildQuery(params)}`),

  getWorkDetail: (workId: number | string) => fetchJson<WorkDetail>(`${API_BASE}/works/${workId}`),

  // Transactions
  getTransactions: (params: {
    house?: string;
    mp_id?: string;
    vendor_id?: string;
    state?: string;
    payment_status?: string;
    min_amount?: number;
    max_amount?: number;
    year?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => fetchJson<PaginatedResponse<Transaction>>(`${API_BASE}/transactions${buildQuery(params)}`),

  getTransactionDetail: (txnId: string) => fetchJson<TransactionDetail>(`${API_BASE}/transactions/${encodeURIComponent(txnId)}`),

  // Vendors
  getVendors: (params: {
    house?: string;
    state?: string;
    min_revenue?: number;
    max_revenue?: number;
    min_reliance_pct?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => fetchJson<PaginatedResponse<Vendor>>(`${API_BASE}/vendors${buildQuery(params)}`),

  getVendorDetail: (vendorId: string) => fetchJson<VendorDetail>(`${API_BASE}/vendors/${encodeURIComponent(vendorId)}`),

  // Anomalies
  getAnomalies: (params: {
    house?: string;
    state?: string;
    entity_type?: string;
    severity?: string;
    anomaly_type?: string;
    entity_id?: string;
    min_score?: number;
    max_score?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => fetchJson<PaginatedResponse<Anomaly>>(`${API_BASE}/anomalies${buildQuery(params)}`),

  getAnomalyDetail: (anomalyId: string) => fetchJson<Anomaly>(`${API_BASE}/anomalies/${encodeURIComponent(anomalyId)}`),

  // Dimensions
  getStates: (params?: { house?: string }) => fetchJson<StateSummary[]>(`${API_BASE}/states${params ? buildQuery(params) : ''}`),
  getDistricts: (params?: { state?: string }) =>
    fetchJson<DistrictItem[]>(`${API_BASE}/districts${params ? buildQuery(params) : ''}`),
  getConstituencies: (params: { state?: string; limit?: number; offset?: number }) =>
    fetchJson<Constituency[]>(`${API_BASE}/constituencies${buildQuery(params)}`),
  getCategories: () => fetchJson<WorkCategory[]>(`${API_BASE}/categories`),

  // Advanced Intelligence
  getDuplicates: (params?: { state?: string; category?: string; limit?: number; min_similarity?: number }) =>
    fetchJson<DuplicatePair[]>(`${API_BASE}/intelligence/duplicates${params ? buildQuery(params) : ''}`),

  getProgressMismatches: (params?: { state?: string; min_severity?: string; limit?: number; offset?: number }) =>
    fetchJson<PaginatedResponse<ProgressMismatch>>(`${API_BASE}/intelligence/progress-mismatch${params ? buildQuery(params) : ''}`),

  getDelayPredictions: (params?: { state?: string; category?: string; limit?: number; offset?: number }) =>
    fetchJson<PaginatedResponse<DelayPrediction>>(`${API_BASE}/intelligence/delay-predictions${params ? buildQuery(params) : ''}`),

  getWorkProfile: (workId: number) =>
    fetchJson<WorkIntelligenceProfile>(`${API_BASE}/intelligence/works/${workId}/profile`),

  getDataQuality: () =>
    fetchJson<DataQualityReport>(`${API_BASE}/intelligence/data-quality`),

  // Case Management & Audit Trail
  getCases: (params?: { status?: string; severity?: string; category?: string; role?: string; limit?: number; offset?: number }) =>
    fetchJson<PaginatedResponse<ReviewCase>>(`${API_BASE}/cases${params ? buildQuery(params) : ''}`),

  getCaseDetail: (caseId: string) =>
    fetchJson<ReviewCase>(`${API_BASE}/cases/${encodeURIComponent(caseId)}`),

  createCase: (payload: {
    entity_type: string;
    entity_id: string;
    title: string;
    severity?: string;
    risk_score?: number;
    category?: string;
    assigned_to?: string;
    assigned_role?: string;
    user?: string;
    role?: string;
    notes?: string;
  }) => fetchJson<ReviewCase>(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  updateCaseStatus: (caseId: string, payload: {
    new_status: string;
    user?: string;
    role?: string;
    notes?: string;
    assigned_to?: string;
  }) => fetchJson<ReviewCase>(`${API_BASE}/cases/${encodeURIComponent(caseId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  getAuditTrail: (limit: number = 50) =>
    fetchJson<AuditLog[]>(`${API_BASE}/cases/audit-trail?limit=${limit}`),

  // Enrichment & Secondary Forensic Intelligence
  getSources: () =>
    fetchJson<SourceRegistryResponse>(`${API_BASE}/sources`),

  getRules: () =>
    fetchJson<StatutoryRuleResponse>(`${API_BASE}/rules`),

  getAgencies: (params?: {
    state?: string;
    min_works?: number;
    min_exp?: number;
    risk_level?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  }) => fetchJson<ImplementingAgencyListResponse>(
    `${API_BASE}/intelligence/agencies${params ? buildQuery(params) : ''}`
  ),

  getPaymentTimingSignals: (params?: {
    signal_type?: string;
    severity?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }) => fetchJson<PaymentTimingSignalListResponse>(
    `${API_BASE}/intelligence/payment-timing${params ? buildQuery(params) : ''}`
  ),

  // Deep Entity Intelligence & Search
  globalSearch: (q: string, limit: number = 5) =>
    fetchJson<GlobalSearchResponse>(`${API_BASE}/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  getEntityMedia: (entityType: string, entityId: string) =>
    fetchJson<EntityMediaListResponse>(`${API_BASE}/media/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`),

  getEntityProfile: (entityType: string, entityId: string) =>
    fetchJson<EntityProfile>(`${API_BASE}/profiles/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`),

  getMpTimeline: (mpId: string) =>
    fetchJson<EntityTimelineResponse>(`${API_BASE}/mps/${encodeURIComponent(mpId)}/timeline`),

  getWorkTimeline: (workId: number | string) =>
    fetchJson<EntityTimelineResponse>(`${API_BASE}/works/${encodeURIComponent(workId)}/timeline`),

  // Universal Data Discovery & Change Intelligence
  getDiscoveredSources: (params?: { tier?: string; reliability?: string }) =>
    fetchJson<DiscoveredSourceListResponse>(`${API_BASE}/sources/discovered${params ? buildQuery(params) : ''}`),

  getHistoricalSnapshots: () =>
    fetchJson<HistoricalSnapshotListResponse>(`${API_BASE}/snapshots`),

  getChangeEvents: (params?: { entity_id?: string; change_type?: string; severity?: string; limit?: number; offset?: number }) =>
    fetchJson<ChangeEventListResponse>(`${API_BASE}/changes${params ? buildQuery(params) : ''}`),

  getReconciliationRecords: () =>
    fetchJson<ReconciliationListResponse>(`${API_BASE}/reconciliation`),

  getWorkRiskSummary: (workId: number | string) =>
    fetchJson<WorkRiskSummary>(`${API_BASE}/works/${encodeURIComponent(workId)}/risk-summary`),

  getLgdDistricts: (params?: { state?: string; limit?: number; offset?: number }) =>
    fetchJson<LgdDistrictListResponse>(`${API_BASE}/lgd/districts${params ? buildQuery(params) : ''}`),

  getMpCrosswalk: (mpId: string) =>
    fetchJson<MpCrosswalkResponse>(`${API_BASE}/mps/${encodeURIComponent(mpId)}/crosswalk`),

  syncLiveSnapshot: () =>
    fetchJson<SnapshotSyncResponse>(`${API_BASE}/snapshots/sync`, { method: 'POST' }),

  getAreaTrack: (state: string, constituency: string) =>
    fetchJson<AreaTrackResponse>(`${API_BASE}/area/track?state=${encodeURIComponent(state)}&constituency=${encodeURIComponent(constituency)}`),

  // Ingestion & Validation Studio
  downloadTemplateUrl: `${API_BASE}/ingest/template`,

  uploadDatasetFile: async (file: File): Promise<IngestValidateResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const authHeaders = getAuthHeaders();
    const res = await fetch(`${API_BASE}/ingest/upload`, {
      method: 'POST',
      headers: {
        ...authHeaders
      },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  validateDatasetJson: (rows: Record<string, any>[]) =>
    fetchJson<IngestValidateResponse>(`${API_BASE}/ingest/validate-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    }),

  loadSampleDemoBatch: () =>
    fetchJson<IngestValidateResponse>(`${API_BASE}/ingest/sample-demo`, {
      method: 'POST'
    }),

  confirmDatasetImport: (batchId: string) =>
    fetchJson<IngestConfirmResponse>(`${API_BASE}/ingest/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_id: batchId })
    }),

  // Risk Engine Configuration
  getRiskWeights: () =>
    fetchJson<RiskWeightsConfig>(`${API_BASE}/config/risk-weights`),

  updateRiskWeights: (weights?: Record<string, number>, thresholds?: Record<string, any>) =>
    fetchJson<RiskWeightsConfig>(`${API_BASE}/config/risk-weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights, thresholds })
    }),

  assessWorkRiskOnDemand: (workId: number | string) =>
    fetchJson<any>(`${API_BASE}/works/${encodeURIComponent(workId)}/assess-risk`, {
      method: 'POST'
    }),

  // Alert System
  getAlerts: (params?: {
    state?: string;
    district?: string;
    mp_id?: string;
    agency?: string;
    project_id?: string;
    severity?: string;
    alert_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) => fetchJson<AlertListResponse>(`${API_BASE}/alerts${params ? buildQuery(params) : ''}`),

  getAlertDetail: (alertId: string) =>
    fetchJson<AlertItem>(`${API_BASE}/alerts/${encodeURIComponent(alertId)}`),

  updateAlert: (alertId: string, payload: {
    status?: string;
    assigned_to?: string;
    assigned_role?: string;
    reviewer_comment?: string;
  }) => fetchJson<AlertItem>(`${API_BASE}/alerts/${encodeURIComponent(alertId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  getAlertsSummary: (params?: { state?: string; district?: string }) =>
    fetchJson<{
      total_alerts: number;
      by_severity: Record<string, number>;
      by_status: Record<string, number>;
      by_type: Record<string, number>;
    }>(`${API_BASE}/alerts/summary${params ? buildQuery(params) : ''}`),

  // Role-Tailored Dashboards
  getNationalDashboard: () =>
    fetchJson<NationalDashboard>(`${API_BASE}/dashboards/national`),

  getStateDashboard: (stateName: string) =>
    fetchJson<StateDashboard>(`${API_BASE}/dashboards/state/${encodeURIComponent(stateName)}`),

  getDistrictDashboard: (districtName: string, stateName?: string) =>
    fetchJson<DistrictDashboard>(
      `${API_BASE}/dashboards/district/${encodeURIComponent(districtName)}${stateName ? `?state=${encodeURIComponent(stateName)}` : ''}`
    ),

  getMpDashboard: (mpId: string) =>
    fetchJson<MpDashboard>(`${API_BASE}/dashboards/mp/${encodeURIComponent(mpId)}`),

  getTrendAnalytics: (period: string = 'monthly') =>
    fetchJson<TrendAnalytics>(`${API_BASE}/dashboards/trends?period=${encodeURIComponent(period)}`),

  // Authentication & Demo Accounts
  getDemoAccounts: () =>
    fetchJson<DemoAccount[]>(`${API_BASE}/auth/demo-accounts`),

  login: (payload: LoginPayload) =>
    fetchJson<LoginResult>(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    fetchJson<AuthUser>(`${API_BASE}/auth/me`),

  getSupabaseStatus: () =>
    fetchJson<any>(`${API_BASE}/supabase/status`),

  // Statutory Governance & RBAC/ABAC Methods
  getRbacIdentity: () =>
    fetchJson<RbacIdentity>(`${API_BASE}/rbac/me`),

  listRecommendations: (params?: { status?: string; limit?: number; offset?: number }) =>
    fetchJson<Recommendation[]>(`${API_BASE}/recommendations${params ? buildQuery(params) : ''}`),

  createRecommendation: (data: Partial<Recommendation>) =>
    fetchJson<Recommendation>(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateRecommendation: (id: string, data: Partial<Recommendation>) =>
    fetchJson<Recommendation>(`${API_BASE}/recommendations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  submitRecommendation: (id: string) =>
    fetchJson<Recommendation>(`${API_BASE}/recommendations/${id}/submit`, {
      method: 'POST'
    }),

  advanceRecommendationWorkflow: (id: string, target_status: string, remarks?: string) =>
    fetchJson<Recommendation>(`${API_BASE}/recommendations/${id}/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_status, remarks })
    }),

  updateWorkExecution: (workId: number, data: any) =>
    fetchJson<Work>(`${API_BASE}/works/${workId}/execution`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  listCorrectionRequests: () =>
    fetchJson<CorrectionRequest[]>(`${API_BASE}/financial/correction-requests`),

  createCorrectionRequest: (data: any) =>
    fetchJson<CorrectionRequest>(`${API_BASE}/financial/correction-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  reviewCorrectionRequest: (id: string, action: string, comments?: string) =>
    fetchJson<CorrectionRequest>(`${API_BASE}/financial/correction-requests/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comments })
    }),

  listAuditInvestigations: () =>
    fetchJson<AuditInvestigationCase[]>(`${API_BASE}/audit-investigations`),

  createAuditInvestigation: (data: any) =>
    fetchJson<AuditInvestigationCase>(`${API_BASE}/audit-investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateAuditInvestigation: (id: string, data: any) =>
    fetchJson<AuditInvestigationCase>(`${API_BASE}/audit-investigations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  submitCitizenReport: (data: any) =>
    fetchJson<CitizenReport>(`${API_BASE}/citizen-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  listCitizenReports: () =>
    fetchJson<CitizenReport[]>(`${API_BASE}/citizen-reports`),

  getAuditLogs: (limit: number = 50, entityType?: string) =>
    fetchJson<StatutoryAuditLog[]>(`${API_BASE}/audit-logs?limit=${limit}${entityType ? `&entity_type=${entityType}` : ''}`),
};





