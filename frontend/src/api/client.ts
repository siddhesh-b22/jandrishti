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
  WorkCategory
} from './types';

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = RAW_BASE_URL ? `${RAW_BASE_URL}/api` : '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
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
  getConstituencies: (params: { state?: string; limit?: number; offset?: number }) =>
    fetchJson<Constituency[]>(`${API_BASE}/constituencies${buildQuery(params)}`),
  getCategories: () => fetchJson<WorkCategory[]>(`${API_BASE}/categories`),
};
