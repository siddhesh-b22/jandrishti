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
  total_recommended_amount?: number;
  pending_works_count?: number;
  in_progress_payments?: number;
  payment_gap_pct?: number;
  unpaid_balance?: number;
  completed_works_value?: number;
  official_system_id?: string;
  email?: string;
  contact_number?: string;
  photo_url?: string;
  party?: string;
  party_name_full?: string;
  profession?: string;
  delhi_address?: string;
  permanent_address?: string;
  gender?: string;
  dob?: string;
  sansad_mp_code?: number;
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
  title?: string;
  category?: string;
  physical_progress_pct?: number;
  implementing_agency?: string;
  district?: string;
  expenditure_amount?: number;
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
  related_transactions?: Array<{
    internal_transaction_id: string;
    internal_vendor_id: string;
    vendor_name_normalized: string;
    activity_description_normalized: string;
    expenditure_amount: number;
    expenditure_date: string;
    payment_status: string;
  }>;
  implementing_agency_details?: {
    ida_name: string;
    state: string;
    completed_works_count?: number;
    total_expenditure?: number;
  } | null;
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
  anomalies_count?: number;
}

export interface DistrictItem {
  district_name: string;
  state_name: string;
  lgd_district_code?: string;
  works_count?: number;
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

// ====================================================================
// Advanced Intelligence & AI/ML Analytics Types
// ====================================================================

export interface DuplicateWorkItem {
  work_id: number;
  title: string | null;
  mp_name: string | null;
  constituency: string | null;
  state: string | null;
  category: string | null;
  amount: number;
  lifecycle_status: string;
  year: number | null;
  ida: string | null;
}

export interface DuplicatePair {
  pair_id: string;
  similarity_score: number;
  text_similarity: number;
  cost_similarity: number;
  status: string;
  detection_method?: string;
  method_classification?: string;
  limitation?: string;
  work_a: DuplicateWorkItem;
  work_b: DuplicateWorkItem;
  reasons: string[];
  recommended_action: string;
}

export interface ProgressMismatch {
  work_id: number;
  mp_name: string | null;
  constituency: string | null;
  state: string | null;
  category: string | null;
  title: string | null;
  lifecycle_status: string;
  financial_progress_pct: number;
  physical_progress_pct: number;
  divergence_index: number;
  recommended_amount: number;
  expenditure_amount: number;
  duration_days: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  data_source?: string;
  method_classification?: string;
  limitation?: string;
  recommended_action: string;
}

export interface DelayPrediction {
  work_id: number;
  mp_name: string | null;
  constituency: string | null;
  state: string | null;
  category: string | null;
  title: string | null;
  lifecycle_status: string;
  current_duration_days: number;
  category_benchmark_days: number;
  delay_probability: number;
  schedule_deviation_ratio: number;
  estimated_delay_days: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_pct?: number;
  detection_method?: string;
  method_classification?: string;
  limitation?: string;
  contributing_factors: string[];
  recommended_action: string;
}

export interface WorkIntelligenceProfile {
  work_id: number;
  title: string;
  mp_name: string;
  constituency: string;
  state: string;
  category: string;
  lifecycle_status: string;
  recommended_amount: number;
  final_amount: number;
  duration_days: number;
  progress: {
    physical_pct: number;
    financial_pct: number;
    divergence_index: number;
    mismatch_detected: boolean;
  };
  delay_prediction: {
    probability: number;
    category_median_days: number;
    schedule_deviation: number;
    status: 'ON_TRACK' | 'SCHEDULE_RISK' | 'CRITICALLY_DELAYED';
  };
  compliance: {
    score: number;
    status: 'COMPLIANT' | 'ATTENTION_REQUIRED' | 'NON_COMPLIANT';
    checks: Array<{
      name: string;
      status: 'PASS' | 'ATTENTION' | 'FAIL';
      details: string;
    }>;
  };
  risk_assessment: {
    overall_score: number;
    risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    factors: {
      timeline_risk: number;
      mismatch_risk: number;
      cost_deviation_risk: number;
      compliance_gap_risk: number;
    };
    explainable_reasons: string[];
  };
  anomalies: Anomaly[];
}

export interface DataQualityReport {
  overall_health_score: number;
  status: string;
  metrics: {
    total_works_audited: number;
    total_vouchers_audited: number;
    description_completeness_pct: number;
    amount_integrity_pct: number;
    timeline_chronology_pct: number;
    vendor_entity_linkage_pct: number;
    reconciliation_variance_inr: string;
    double_entry_verified: boolean;
  };
  field_observability_matrix?: {
    observed_fields: Array<{ field: string; status: string; source: string }>;
    unobserved_fields_in_public_export: Array<{ field: string; status: string; impact: string }>;
  };
  statutory_benchmarks?: {
    guideline_authority: string;
    governing_document: string;
    statutory_decision_window_days: number;
    statutory_completion_window_months: number;
    annual_entitlement_per_mp_cr: number;
    out_of_constituency_spending_limit_lakh: number;
    single_installment_rule: string;
  };
  disclosed_limitations?: string[];
  provenance: {
    data_snapshot_date: string;
    source_authorities: string[];
    storage_architecture: string;
  };
}

// ====================================================================
// Case Management & Audit Trail Types
// ====================================================================

export interface AuditLog {
  log_id: number;
  case_id: string;
  action: string;
  performed_by: string;
  role: string;
  timestamp: string;
  details?: string;
  previous_state?: string;
  new_state?: string;
  case_title?: string;
  severity?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface ReviewCase {
  case_id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  category: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'CLARIFICATION_REQUESTED' | 'DETAILED_REVIEW' | 'RESOLVED' | 'ESCALATED';
  assigned_to: string;
  assigned_role: string;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  audit_trail?: AuditLog[];
}

// ====================================================================
// Enrichment & Secondary Intelligence Types
// ====================================================================

export interface SourceRegistryItem {
  source_id: string;
  source_name: string;
  organization: string;
  url: string;
  data_type: string;
  update_frequency: string;
  trust_tier: string;
  status: string;
  license_or_access_note: string;
}

export interface SourceRegistryResponse {
  total: number;
  items: SourceRegistryItem[];
}

export interface StatutoryRuleItem {
  rule_id: string;
  rule_code: string;
  title: string;
  governing_document: string;
  clause_reference: string;
  statutory_threshold: string;
  description: string;
  enforcement_level: string;
}

export interface StatutoryRuleResponse {
  total: number;
  items: StatutoryRuleItem[];
}

export interface ImplementingAgency {
  agency_id: string;
  agency_name: string;
  state: string;
  total_works: number;
  completed_works: number;
  in_progress_works: number;
  completion_rate_pct: number;
  total_expenditure: number;
  total_transactions: number;
  unique_vendors: number;
  vendor_hhi: number;
  top_vendor_name: string | null;
  top_vendor_share_pct: number;
  avg_duration_days: number | null;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  generated_at: string;
}

export interface ImplementingAgencyListResponse {
  total: number;
  limit: number;
  offset: number;
  items: ImplementingAgency[];
}

export interface PaymentTimingSignal {
  signal_id: string;
  signal_type: 'MARCH_RUSH' | 'RAPID_BUNCHING' | 'REPEATED_AMOUNT';
  entity_type: 'MP' | 'AGENCY' | 'VENDOR' | 'TRANSACTION';
  entity_id: string;
  entity_name: string;
  state: string;
  metric_value: number;
  threshold_value: number;
  affected_amount: number;
  affected_vouchers: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  recommended_action: string;
  generated_at: string;
}

export interface PaymentTimingSignalListResponse {
  total: number;
  limit: number;
  offset: number;
  items: PaymentTimingSignal[];
}

// ====================================================================
// Deep Entity Intelligence & Search Types
// ====================================================================

export interface EntityMediaItem {
  media_id: string;
  entity_type: 'MP' | 'WORK' | 'AGENCY' | 'VENDOR';
  entity_id: string;
  media_type: 'OFFICIAL_PORTRAIT' | 'PROJECT_PHOTO' | 'ASSET_PHOTO';
  source_url: string;
  source_name: string;
  attribution: string;
  license_note: string;
  verification_status: 'OFFICIAL' | 'VERIFIED_PUBLIC' | 'UNVERIFIED';
  created_at: string;
}

export interface EntityMediaListResponse {
  total: number;
  items: EntityMediaItem[];
}

export interface EntityProfile {
  profile_id: string;
  entity_type: 'MP' | 'AGENCY' | 'VENDOR';
  entity_id: string;
  canonical_name: string;
  biography_summary?: string;
  official_website?: string;
  nodal_address?: string;
  contact_email?: string;
  party_affiliation?: string;
  term_label?: string;
  source_provenance: string;
  last_verified_at: string;
  media?: EntityMediaItem[];
}

export interface GlobalSearchResultItem {
  id: string;
  type: 'PEOPLE' | 'WORKS' | 'ENTITIES' | 'VOUCHERS' | 'CASES';
  title: string;
  subtitle: string;
  badge: string;
  target_url: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchGroup {
  category: 'PEOPLE' | 'WORKS' | 'ENTITIES' | 'VOUCHERS' | 'CASES';
  count: number;
  items: GlobalSearchResultItem[];
}

export interface GlobalSearchResponse {
  query: string;
  total_results: number;
  groups: {
    PEOPLE: GlobalSearchGroup;
    WORKS: GlobalSearchGroup;
    ENTITIES: GlobalSearchGroup;
    VOUCHERS: GlobalSearchGroup;
    CASES: GlobalSearchGroup;
  };
}

export interface TimelineMilestone {
  milestone_id: string;
  event_type: 'RECOMMENDATION' | 'SANCTION' | 'WORK_ORDER' | 'EXPENDITURE' | 'COMPLETION';
  date?: string;
  title: string;
  description: string;
  is_official: boolean;
  amount?: number;
  statutory_limit_days?: number;
  actual_duration_days?: number;
  status: string;
}

export interface EntityTimelineResponse {
  entity_type: string;
  entity_id: string;
  entity_name: string;
  milestones: TimelineMilestone[];
  statutory_summary?: Record<string, any>;
}

// --- Universal Data Discovery & Change Intelligence ---
export interface DiscoveredSourceItem {
  source_id: string;
  source_name: string;
  official_organization: string;
  tier: string;
  base_url: string;
  endpoint: string;
  http_method: string;
  authentication_required: boolean;
  public_access: boolean;
  data_format: string;
  supported_filters: string[];
  pagination: boolean;
  entity_coverage: string;
  refresh_frequency: string;
  last_checked: string;
  verification_status: string;
  reliability_level: string;
  terms_or_usage_notes: string;
}

export interface DiscoveredSourceListResponse {
  total_sources: number;
  health_summary: {
    total_registered_sources: number;
    tier_1_apis: number;
    tier_2_dashboards: number;
    tier_3_downloads: number;
    tier_4_reports: number;
    official_primary_count: number;
    public_access_rate_pct: number;
    provenance_standard: string;
  };
  sources: DiscoveredSourceItem[];
}

export interface HistoricalSnapshotItem {
  snapshot_id: string;
  source_id: string;
  snapshot_date: string;
  entity_type: string;
  record_count: number;
  checksum_sha256: string;
  notes?: string;
  created_at: string;
}

export interface HistoricalSnapshotListResponse {
  total: number;
  items: HistoricalSnapshotItem[];
}

export interface ChangeEventItem {
  event_id: string;
  snapshot_id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  change_type: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  change_magnitude?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  finding_summary: string;
  created_at: string;
}

export interface ChangeEventListResponse {
  total: number;
  limit: number;
  offset: number;
  items: ChangeEventItem[];
}

export interface ReconciliationRecordItem {
  reconciliation_id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  status: 'MATCHED' | 'DIFFERENT_VALUE' | 'MISSING_IN_EXISTING_DATA' | 'MISSING_IN_OFFICIAL_SOURCE' | 'REQUIRES_REVIEW';
  existing_value?: string;
  official_value?: string;
  variance_summary?: string;
  reconciled_at: string;
}

export interface ReconciliationListResponse {
  total: number;
  matched_count: number;
  review_count: number;
  gap_count: number;
  items: ReconciliationRecordItem[];
}

export interface WorkRiskSummary {
  work_id: number;
  requires_attention: boolean;
  overall_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  risk_score: number;
  headline_finding: string;
  contributing_signals: any[];
  change_events: any[];
  statutory_citations: string[];
  recommended_action: string;
}

export interface LgdDistrictItem {
  lgd_district_code: string;
  lgd_state_code: string;
  state_name: string;
  district_name: string;
  census2011_code?: string;
  created_at: string;
}

export interface LgdDistrictListResponse {
  total: number;
  limit: number;
  offset: number;
  items: LgdDistrictItem[];
}

export interface MpCrosswalkResponse {
  crosswalk_id: string;
  internal_mp_id: string;
  mospi_internal_id: string;
  official_caption: string;
  tenure_range?: string;
  state_id: number;
  house_code: number;
  verified_source: string;
  verified_at: string;
}

export interface SnapshotSyncResponse {
  success: boolean;
  snapshot_id: string;
  summary: Record<string, any>;
}

export interface AreaCategoryItem {
  category: string;
  work_count: number;
  total_amount: number;
  share_pct: number;
}

export interface AreaTrackResponse {
  state: string;
  constituency: string;
  lok_sabha_mp: MP | null;
  rajya_sabha_mps: MP[];
  kpi_summary: {
    total_works: number;
    completed_works: number;
    in_progress_works: number;
    sanctioned_works: number;
    pending_works: number;
    total_recommended_amount: number;
    completed_works_value: number;
    completion_rate_pct: number;
  };
  category_distribution: AreaCategoryItem[];
  implementing_agencies: Array<{ agency_name: string; work_count: number }>;
  recent_works: Array<{
    work_id: number;
    internal_mp_id: string;
    mp_name_normalized: string;
    category_normalized: string;
    work_description_normalized: string;
    recommended_amount: number;
    final_amount: number;
    lifecycle_status: string;
    recommendation_year: number;
    completion_year: number;
    implementing_agency_normalized: string;
  }>;
}

// ====================================================================
// NEW MPLADS PLATFORM TYPES (Ingestion, Alerts, Role Dashboards)
// ====================================================================

export interface ValidationIssue {
  row_index: number;
  project_id: string;
  field: string;
  severity: 'ERROR' | 'WARNING';
  error_type: string;
  message: string;
  observed_value: string;
}

export interface IngestValidateResponse {
  batch_id: string;
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  error_count: number;
  warning_count: number;
  can_import: boolean;
  issues: ValidationIssue[];
  preview_rows: Record<string, any>[];
}

export interface IngestConfirmResponse {
  batch_id: string;
  imported_count: number;
  alerts_created: number;
  average_risk_score: number;
  status: string;
  message: string;
}

export interface RiskWeightsConfig {
  weights: Record<string, number>;
  thresholds: Record<string, any>;
  disclaimer: string;
}

export interface AlertItem {
  alert_id: string;
  project_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alert_type: string;
  description: string;
  evidence: string;
  evidence_parsed: Record<string, any>;
  status: 'NEW' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  assigned_to?: string;
  assigned_role?: string;
  created_at: string;
  resolved_at?: string;
  reviewer_comment?: string;
  project_title?: string;
  title?: string;
  state?: string;
  district?: string;
  mp_name?: string;
  category?: string;
  audit_trail?: Array<{
    log_id: number;
    case_id: string;
    action: string;
    performed_by: string;
    role: string;
    timestamp: string;
    details: string;
    previous_state: string;
    new_state: string;
  }>;
}

export interface AlertListResponse {
  total: number;
  limit: number;
  offset: number;
  items: AlertItem[];
}

export interface NationalDashboard {
  scope: string;
  kpis: {
    total_projects: number;
    total_sanctioned_amount: number;
    total_expenditure: number;
    total_unspent_balance: number;
    national_utilization_pct: number;
    completed_projects: number;
    national_completion_rate_pct: number;
    delayed_projects: number;
    high_risk_projects: number;
    critical_alerts: number;
    total_alerts: number;
    total_works?: number;
    total_sanctioned_cr?: number;
    total_spent_cr?: number;
  };
  state_comparisons: Array<{
    state: string;
    total_mps: number;
    allocated_amount: number;
    total_expenditure: number;
    utilization_pct: number;
    completed_works: number;
    total_works: number;
  }>;
  district_rankings: Array<{
    district: string;
    state: string;
    mp_name: string;
    allocated_amount: number;
    total_expenditure: number;
    utilization_pct: number;
    completed_works_count: number;
    recommended_works_count: number;
  }>;
  category_distribution: Array<{
    category: string;
    works_count: number;
    total_cost: number;
    avg_duration_days: number;
  }>;
  expenditure_trends: Array<{
    month_period: string;
    voucher_count: number;
    monthly_expenditure: number;
  }>;
  alert_summary: {
    total_alerts: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
  };
}

export interface StateDashboard {
  scope: string;
  state: string;
  kpis?: any;
  summary: {
    total_mps: number;
    allocated_amount: number;
    total_expenditure: number;
    unspent_amount: number;
    utilization_pct: number;
    total_works: number;
    completed_works: number;
    completion_rate_pct: number;
    delayed_works: number;
  };
  districts: Array<{
    district: string;
    mp_name: string;
    allocated_amount: number;
    total_expenditure: number;
    unspent_amount: number;
    utilization_pct: number;
    completed_works_count: number;
    recommended_works_count: number;
    completion_rate_pct: number;
  }>;
  high_risk_projects: Array<{
    work_id: number;
    title: string;
    category: string;
    district: string;
    recommended_amount: number;
    final_amount: number;
    duration_days: number;
    lifecycle_status: string;
    severity: string;
    anomaly_reason: string;
    anomaly_score: number;
  }>;
  agency_trends: Array<{
    agency_name: string;
    works_count: number;
    completed_count: number;
    avg_duration: number;
    total_funds: number;
  }>;
  alerts: AlertItem[];
  alert_total: number;
}

export interface DistrictDashboard {
  scope: string;
  district: string;
  state: string;
  kpis?: any;
  mp_info: {
    mp_id: string;
    mp_name: string;
    allocated_amount: number;
    total_expenditure: number;
    unspent_amount: number;
    utilization_pct: number;
    recommended_works: number;
    completed_works: number;
  };
  works: Array<{
    work_id: number;
    title: string;
    category: string;
    lifecycle_status: string;
    recommended_amount: number;
    final_amount: number;
    duration_days: number;
    recommendation_date?: string;
    completed_date?: string;
    implementing_agency?: string;
  }>;
  total_works: number;
  delayed_works: Array<{
    work_id: number;
    title: string;
    category: string;
    duration_days: number;
    recommended_amount: number;
    implementing_agency?: string;
  }>;
  alerts: AlertItem[];
  alert_total: number;
}

export interface MpDashboard {
  scope: string;
  kpis?: any;
  mp_profile: {
    mp_id: string;
    mp_name: string;
    constituency: string;
    state: string;
    house: string;
    statutory_annual_quota_cr: number;
    allocated_amount: number;
    total_expenditure: number;
    unspent_balance: number;
    utilization_pct: number;
    recommended_works_count: number;
    completed_works_count: number;
    completion_rate_pct: number;
  };
  works: Array<{
    work_id: number;
    title: string;
    category: string;
    lifecycle_status: string;
    recommended_amount: number;
    final_amount: number;
    duration_days: number;
    recommendation_date?: string;
    completed_date?: string;
    implementing_agency?: string;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    total_amount: number;
  }>;
  alerts: AlertItem[];
  alert_total: number;
}

export interface TrendAnalytics {
  period: string;
  expenditure_timeline: Array<{ date_period: string; vouchers: number; expenditure: number }>;
  completion_timeline: Array<{ date_period: string; completed_count: number }>;
  anomaly_distribution: Array<{ severity: string; count: number }>;
  alert_lifecycle_distribution: Array<{ status: string; severity: string; count: number }>;
}

// ====================================================================
// Authentication & RBAC Types
// ====================================================================

export interface AuthUser {
  user_id: string;
  display_name: string;
  role: string;
  jurisdiction: string;
  jurisdiction_type: 'NATIONAL' | 'STATE' | 'DISTRICT' | 'CONSTITUENCY' | string;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  mp_id?: string | null;
  is_admin: boolean;
  can_mutate_cases: boolean;
}

export interface DemoAccount {
  username: string;
  password: string;
  role: string;
  display_name: string;
  jurisdiction: string;
  jurisdiction_type: string;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  can_mutate_cases: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// ====================================================================
// Statutory Governance & RBAC/ABAC Types
// ====================================================================

export interface RbacIdentity {
  authenticated: boolean;
  user_id: string;
  display_name: string;
  role: string;
  hierarchy_rank: number;
  jurisdiction: string;
  jurisdiction_type: string;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  mp_id?: string | null;
  can_mutate: boolean;
  permissions: Record<string, string[]>;
  drill_down_allowed: boolean;
}

export interface Recommendation {
  recommendation_id: string;
  id?: string;
  internal_mp_id: string;
  mp_id?: string;
  mp_name?: string;
  constituency: string;
  state: string;
  proposed_title: string;
  title?: string;
  sector: string;
  category?: string;
  estimated_cost: number;
  location_description?: string;
  location_details?: string;
  block?: string;
  gram_panchayat?: string;
  justification?: string;
  priority: string;
  workflow_status: 'DRAFT' | 'SUBMITTED' | 'DISTRICT_REVIEW' | 'RETURNED_FOR_CORRECTION' | 'STATE_REVIEW' | 'SANCTIONED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'REJECTED' | string;
  status?: string;
  sanctioned_work_id?: string;
  district_authority_remarks?: string;
  state_nodal_remarks?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CorrectionRequest {
  correction_id: string;
  request_id?: string;
  work_id?: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  previous_value: string;
  proposed_value: string;
  original_value?: string;
  requested_value?: string;
  reason: string;
  justification_reason?: string;
  requested_by: string;
  requested_by_role: string;
  jurisdiction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  reviewed_by?: string;
  review_comments?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AuditInvestigationCase {
  case_id: string;
  work_id?: string;
  transaction_id?: string;
  entity_type?: string;
  entity_id?: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'EVIDENCE_REQUIRED' | 'REVIEWED' | 'RESOLVED' | 'ESCALATED' | string;
  hypothesis: string;
  evidence: string;
  auditor_notes?: string;
  assigned_auditor: string;
  jurisdiction: string;
  created_at: string;
  updated_at: string;
}

export interface CitizenReport {
  report_id: string;
  work_id: string;
  state?: string;
  district?: string;
  constituency?: string;
  discrepancy_category: string;
  description: string;
  reported_location?: string;
  photo_url?: string;
  status: string;
  citizen_name?: string;
  citizen_contact?: string;
  assigned_authority?: string;
  created_at: string;
}

export interface StatutoryAuditLog {
  log_id: string;
  user_id: string;
  role: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  details?: string;
  rationale?: string;
  jurisdiction?: string;
  ip_address?: string;
  created_at: string;
}



