// ====================================================================
// JanDrishti — TypeScript API Type Definitions (Synchronized with FastAPI)
// ====================================================================

export interface HealthResponse {
  status: string;
  database: string;
  version: string;
  timestamp: string;
}

export interface HouseInfo {
  code: string;
  name: string;
}

export interface HouseBreakdown {
  total_mps: number;
  total_allocated: number;
  total_expenditure: number;
  total_unspent: number;
  utilization_pct: number;
  recommended_works: number;
  completed_works: number;
  completion_rate_pct: number;
  anomalies_count: number;
}

export interface StatsResponse {
  total_mps: number;
  total_allocated_amount: number;
  total_expenditure: number;
  total_unspent_amount: number;
  national_utilization_pct: number;
  total_recommended_works: number;
  total_completed_works: number;
  national_completion_rate_pct: number;
  total_transactions: number;
  total_vendors: number;
  total_anomalies: number;
  critical_anomalies: number;
  high_anomalies: number;
  medium_anomalies: number;
  low_anomalies: number;
  house_breakdown?: {
    lok_sabha: HouseBreakdown;
    rajya_sabha: HouseBreakdown;
    combined: HouseBreakdown;
  };
}

export interface MP {
  internal_mp_id: string;
  mp_name_raw: string;
  mp_name_normalized: string;
  constituency_raw: string;
  constituency_normalized: string;
  state_raw: string;
  state_normalized: string;
  house: string;
  allocated_amount: number;
  total_expenditure: number;
  unspent_amount: number;
  utilization_pct: number;
  recommended_works_count: number;
  completed_works_count: number;
  completion_rate_pct: number;
  transaction_count: number;
  successful_payments_count: number;
  pending_payments_count: number;
  average_rating: number | null;
  source_file: string;
  source_download_date: string;
  pipeline_created_at: string;
}

export interface MPDetail extends MP {
  top_vendors?: Array<{
    internal_vendor_id: string;
    vendor_name: string;
    total_amount: number;
    txn_count: number;
  }>;
  anomalies?: AnomalySummary[];
}

export interface Work {
  work_id: number;
  internal_mp_id: string;
  mp_name_normalized: string;
  constituency_normalized: string;
  state_normalized: string;
  house: string;
  category_normalized: string;
  work_description_normalized: string | null;
  ida_normalized: string;
  lifecycle_status: string;
  recommended_amount: number | null;
  recommendation_date: string | null;
  recommendation_year: number | null;
  final_amount: number | null;
  completed_date: string | null;
  completion_year: number | null;
  duration_days: number | null;
  cost_variance_amount: number | null;
  cost_variance_pct: number | null;
  has_images: boolean;
  average_rating: number | null;
  sanctioned_amount: number | null;
  sanction_date: string | null;
  latitude: number | null;
  longitude: number | null;
  village: string | null;
  block: string | null;
  gram_panchayat: string | null;
  work_contractor: string | null;
  source_files: string;
  match_method: string;
  match_confidence: number;
}

export interface WorkDetail extends Work {
  mp_details?: {
    internal_mp_id: string;
    mp_name_normalized: string;
    constituency_normalized: string;
    state_normalized: string;
    allocated_amount: number;
    total_expenditure: number;
    utilization_pct: number;
  };
  anomalies?: AnomalySummary[];
}

export interface Transaction {
  internal_transaction_id: string;
  internal_mp_id: string;
  internal_vendor_id: string;
  mp_name_normalized: string;
  constituency_normalized: string;
  state_normalized: string;
  house: string;
  vendor_name_normalized: string;
  activity_description_normalized: string;
  ida_normalized: string;
  expenditure_amount: number;
  expenditure_date: string;
  expenditure_year: number | null;
  payment_status: string;
  activity_amount_percentile: number | null;
  activity_amount_robust_zscore: number | null;
  transaction_to_mp_total_exp_pct: number | null;
}

export interface TransactionDetail extends Transaction {
  anomalies?: AnomalySummary[];
}

export interface Vendor {
  internal_vendor_id: string;
  vendor_name_raw: string;
  vendor_name_normalized: string;
  total_received_amount: number;
  total_transaction_count: number;
  unique_mps_served: number;
  unique_states_served: number;
  primary_state: string | null;
  primary_activity: string | null;
  primary_mp_id: string | null;
  primary_mp_name: string | null;
  single_mp_reliance_pct: number;
  vendor_revenue_percentile: number | null;
  vendor_revenue_robust_zscore: number | null;
  average_ticket_size: number | null;
}

export interface VendorDetail extends Vendor {
  recent_transactions?: Array<{
    internal_transaction_id: string;
    mp_name_normalized: string;
    activity_description_normalized: string;
    expenditure_amount: number;
    expenditure_date: string;
    payment_status: string;
  }>;
  anomalies?: AnomalySummary[];
}

export interface AnomalySummary {
  anomaly_id: string;
  anomaly_type: string;
  anomaly_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  detection_method: string;
}

export interface Anomaly extends AnomalySummary {
  entity_type: 'WORK' | 'MP' | 'TRANSACTION' | 'VENDOR';
  entity_id: string;
  supporting_metrics: Record<string, any>;
  threshold_value: string | null;
  observed_value: string | null;
  percentile: number | null;
  robust_zscore: number | null;
  baseline_reference: string | null;
  generated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

export interface StateSummary {
  state: string;
  total_mps: number;
  total_allocated_amount: number;
  total_expenditure: number;
  total_unspent_amount: number;
  state_utilization_pct: number;
  total_recommended_works: number;
  total_completed_works: number;
  state_completion_rate_pct: number;
  total_transactions: number;
}

export interface Constituency {
  constituency: string;
  state: string;
  internal_mp_id: string;
  mp_name: string;
  allocated_amount: number;
  total_expenditure: number;
  utilization_pct: number;
  recommended_works_count: number;
  completed_works_count: number;
}

export interface WorkCategory {
  category: string;
  total_works: number;
  total_recommended_amount: number;
  total_final_amount: number;
  completed_works_count: number;
}
