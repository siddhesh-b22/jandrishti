from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# --- Health & Stats ---
class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
    timestamp: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthUserResponse(BaseModel):
    user_id: str
    display_name: str
    role: str
    jurisdiction: str
    jurisdiction_type: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    mp_id: Optional[str] = None
    is_admin: bool = False
    can_mutate_cases: bool = False

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse

class DemoAccountItem(BaseModel):
    username: str
    password: str
    role: str
    display_name: str
    jurisdiction: str
    jurisdiction_type: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    can_mutate_cases: bool = False

class HouseInfo(BaseModel):
    code: str
    name: str

class HouseBreakdown(BaseModel):
    total_mps: int
    total_allocated: float
    total_expenditure: float
    total_unspent: float
    utilization_pct: float
    recommended_works: int
    completed_works: int
    completion_rate_pct: float
    anomalies_count: int

class StatsResponse(BaseModel):
    total_mps: int
    total_allocated_amount: float
    total_expenditure: float
    total_unspent_amount: float
    national_utilization_pct: float
    total_recommended_works: int
    total_completed_works: int
    national_completion_rate_pct: float
    total_transactions: int
    total_vendors: int
    total_anomalies: int
    critical_anomalies: int
    high_anomalies: int
    medium_anomalies: int
    low_anomalies: int
    house_breakdown: Optional[Dict[str, HouseBreakdown]] = None

# --- Member of Parliament (MP) ---
class MPBase(BaseModel):
    internal_mp_id: str
    mp_name_raw: str
    mp_name_normalized: str
    constituency_raw: str
    constituency_normalized: str
    state_raw: str
    state_normalized: str
    house: str
    allocated_amount: float
    total_expenditure: float
    unspent_amount: float
    utilization_pct: float
    recommended_works_count: int
    completed_works_count: int
    completion_rate_pct: float
    transaction_count: int
    successful_payments_count: int
    pending_payments_count: int
    average_rating: Optional[float] = None
    total_recommended_amount: Optional[float] = None
    pending_works_count: Optional[int] = None
    in_progress_payments: Optional[float] = None
    payment_gap_pct: Optional[float] = None
    unpaid_balance: Optional[float] = None
    completed_works_value: Optional[float] = None
    official_system_id: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    photo_url: Optional[str] = None
    party: Optional[str] = None
    party_name_full: Optional[str] = None
    profession: Optional[str] = None
    delhi_address: Optional[str] = None
    permanent_address: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    sansad_mp_code: Optional[int] = None

class MPResponse(MPBase):
    source_file: str
    source_download_date: str
    pipeline_created_at: str

class MPDetailResponse(MPResponse):
    top_vendors: Optional[List[Dict[str, Any]]] = None
    anomalies: Optional[List[Dict[str, Any]]] = None

class MPListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[MPResponse]

# --- Physical Works ---
class WorkResponse(BaseModel):
    work_id: int
    internal_mp_id: str
    mp_name_normalized: str
    constituency_normalized: str
    state_normalized: str
    house: str
    category_normalized: str
    work_description_normalized: Optional[str] = None
    ida_normalized: str
    lifecycle_status: str
    recommended_amount: Optional[float] = None
    recommendation_date: Optional[str] = None
    recommendation_year: Optional[int] = None
    final_amount: Optional[float] = None
    completed_date: Optional[str] = None
    completion_year: Optional[int] = None
    duration_days: Optional[int] = None
    cost_variance_amount: Optional[float] = None
    cost_variance_pct: Optional[float] = None
    has_images: bool
    average_rating: Optional[float] = None
    # Unavailable fields declared NULL
    sanctioned_amount: Optional[float] = None
    sanction_date: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    village: Optional[str] = None
    block: Optional[str] = None
    gram_panchayat: Optional[str] = None
    work_contractor: Optional[str] = None
    source_files: str
    match_method: str
    match_confidence: float

class WorkDetailResponse(WorkResponse):
    mp_details: Optional[Dict[str, Any]] = None
    anomalies: Optional[List[Dict[str, Any]]] = None
    related_transactions: Optional[List[Dict[str, Any]]] = None
    implementing_agency_details: Optional[Dict[str, Any]] = None

class WorkListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[WorkResponse]

# --- Transactions ---
class TransactionResponse(BaseModel):
    internal_transaction_id: str
    internal_mp_id: str
    internal_vendor_id: str
    mp_name_normalized: str
    constituency_normalized: str
    state_normalized: str
    house: str
    vendor_name_normalized: str
    activity_description_normalized: str
    ida_normalized: str
    expenditure_amount: float
    expenditure_date: str
    expenditure_year: Optional[int] = None
    payment_status: str
    activity_amount_percentile: Optional[float] = None
    activity_amount_robust_zscore: Optional[float] = None
    transaction_to_mp_total_exp_pct: Optional[float] = None

class TransactionDetailResponse(TransactionResponse):
    anomalies: Optional[List[Dict[str, Any]]] = None

class TransactionListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[TransactionResponse]

# --- Vendors ---
class VendorResponse(BaseModel):
    internal_vendor_id: str
    vendor_name_raw: str
    vendor_name_normalized: str
    total_received_amount: float
    total_transaction_count: int
    unique_mps_served: int
    unique_states_served: int
    primary_state: Optional[str] = None
    primary_activity: Optional[str] = None
    primary_mp_id: Optional[str] = None
    primary_mp_name: Optional[str] = None
    single_mp_reliance_pct: float
    vendor_revenue_percentile: Optional[float] = None
    vendor_revenue_robust_zscore: Optional[float] = None
    average_ticket_size: Optional[float] = None

class VendorDetailResponse(VendorResponse):
    recent_transactions: Optional[List[Dict[str, Any]]] = None
    anomalies: Optional[List[Dict[str, Any]]] = None

class VendorListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[VendorResponse]

# --- Anomalies ---
class AnomalyResponse(BaseModel):
    anomaly_id: str
    entity_type: str
    entity_id: str
    anomaly_type: str
    anomaly_score: float
    severity: str
    reason: str
    supporting_metrics: Dict[str, Any]
    detection_method: str
    threshold_value: Optional[str] = None
    observed_value: Optional[str] = None
    percentile: Optional[float] = None
    robust_zscore: Optional[float] = None
    baseline_reference: Optional[str] = None
    generated_at: str

class AnomalyListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AnomalyResponse]

class StateSummaryItem(BaseModel):
    state: str
    total_mps: Optional[int] = 0
    total_allocated_amount: Optional[float] = 0.0
    total_expenditure: Optional[float] = 0.0
    total_unspent_amount: Optional[float] = 0.0
    state_utilization_pct: Optional[float] = 0.0
    total_recommended_works: Optional[int] = 0
    total_completed_works: Optional[int] = 0
    state_completion_rate_pct: Optional[float] = 0.0
    total_transactions: Optional[int] = 0
    total_successful_payments: Optional[int] = 0
    total_pending_payments: Optional[int] = 0
    anomalies_count: Optional[int] = 0

class DistrictItem(BaseModel):
    district_name: Optional[str] = "UNKNOWN"
    state_name: Optional[str] = "UNKNOWN"
    lgd_district_code: Optional[str] = None
    works_count: Optional[int] = 0


class ConstituencyItem(BaseModel):
    constituency: str
    state: str
    internal_mp_id: str
    mp_name: str
    allocated_amount: float
    total_expenditure: float
    utilization_pct: float
    recommended_works_count: int
    completed_works_count: int

class CategoryItem(BaseModel):
    category: str
    total_works: int
    total_recommended_amount: float
    total_final_amount: float
    completed_works_count: int

# --- Intelligence & AI/ML Analytics Schemas ---
class DuplicateWorkDetail(BaseModel):
    work_id: int
    title: Optional[str] = None
    mp_name: Optional[str] = None
    constituency: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    amount: float
    lifecycle_status: str
    year: Optional[int] = None
    ida: Optional[str] = None

class DuplicatePairItem(BaseModel):
    pair_id: str
    similarity_score: float
    text_similarity: float
    cost_similarity: float
    status: str
    detection_method: Optional[str] = "LEXICAL_JACCARD_AND_COST_PROXIMITY"
    method_classification: Optional[str] = "NLP Token-Overlap & Budget Proximity"
    limitation: Optional[str] = "Evaluates token overlap and budget proximity; precise GPS coordinates are 100% unobserved in public data."
    work_a: DuplicateWorkDetail
    work_b: DuplicateWorkDetail
    reasons: List[str]
    recommended_action: str

class ProgressMismatchItem(BaseModel):
    work_id: int
    mp_name: Optional[str] = None
    constituency: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    lifecycle_status: str
    financial_progress_pct: float
    physical_progress_pct: float
    divergence_index: float
    recommended_amount: float
    expenditure_amount: float
    duration_days: int
    severity: str
    reason: str
    data_source: Optional[str] = "Imputed from administrative lifecycle records"
    method_classification: Optional[str] = "Rule-Based Milestone Divergence"
    limitation: Optional[str] = "Physical progress is mapped from administrative lifecycle stages; field sensor/engineer milestone telemetry is not reported in public MoSPI exports."
    recommended_action: str

class ProgressMismatchListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ProgressMismatchItem]

class DelayPredictionItem(BaseModel):
    work_id: int
    mp_name: Optional[str] = None
    constituency: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    lifecycle_status: str
    current_duration_days: int
    category_benchmark_days: int
    delay_probability: float
    schedule_deviation_ratio: float
    estimated_delay_days: int
    risk_level: str
    confidence_pct: Optional[float] = 72.0
    detection_method: Optional[str] = "STATISTICAL_BENCHMARK_DEVIATION"
    method_classification: Optional[str] = "Statistical / Actuarial Formula"
    limitation: Optional[str] = "Delay probability uses an actuarial sigmoid schedule deviation curve against regional category medians. Active works lack real-time milestone timestamps in source data."
    contributing_factors: List[str]
    recommended_action: str

class DelayPredictionListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[DelayPredictionItem]

class DataQualityResponse(BaseModel):
    overall_health_score: float
    status: str
    metrics: Dict[str, Any]
    field_observability_matrix: Optional[Dict[str, Any]] = None
    statutory_benchmarks: Optional[Dict[str, Any]] = None
    disclosed_limitations: Optional[List[str]] = None
    provenance: Dict[str, Any]

# --- Case Management & Audit Trail Schemas ---
class AuditLogItem(BaseModel):
    log_id: int
    case_id: str
    action: str
    performed_by: str
    role: str
    timestamp: str
    details: Optional[str] = ""
    previous_state: Optional[str] = ""
    new_state: Optional[str] = ""
    case_title: Optional[str] = None
    severity: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None

class ReviewCaseResponse(BaseModel):
    case_id: str
    entity_type: str
    entity_id: str
    title: str
    severity: str
    risk_score: float
    category: str
    status: str
    assigned_to: str
    assigned_role: str
    created_at: str
    updated_at: str
    resolution_notes: Optional[str] = ""
    audit_trail: Optional[List[Dict[str, Any]]] = None

class ReviewCaseListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ReviewCaseResponse]

class ReviewCaseCreate(BaseModel):
    entity_type: str
    entity_id: str
    title: str
    severity: str = "HIGH"
    risk_score: float = 75.0
    category: str = "MANUAL_REVIEW"
    assigned_to: Optional[str] = "Unassigned"
    assigned_role: Optional[str] = "DISTRICT_AUTHORITY"
    user: Optional[str] = "Authorized Official"
    role: Optional[str] = "DISTRICT_AUTHORITY"
    notes: Optional[str] = ""

class ReviewCaseUpdate(BaseModel):
    new_status: str
    user: Optional[str] = "Authorized Official"
    role: Optional[str] = "DISTRICT_AUTHORITY"
    notes: Optional[str] = ""
    assigned_to: Optional[str] = None

# ====================================================================
# Enrichment & Secondary Forensic Intelligence Schemas
# ====================================================================

class SourceRegistryItem(BaseModel):
    source_id: str
    source_name: str
    organization: str
    url: str
    data_type: str
    update_frequency: str
    trust_tier: str
    status: str
    license_or_access_note: str

class SourceRegistryListResponse(BaseModel):
    total: int
    items: List[SourceRegistryItem]

class StatutoryRuleItem(BaseModel):
    rule_id: str
    rule_code: str
    title: str
    governing_document: str
    clause_reference: str
    statutory_threshold: str
    description: str
    enforcement_level: str

class StatutoryRuleListResponse(BaseModel):
    total: int
    items: List[StatutoryRuleItem]

class ImplementingAgencyItem(BaseModel):
    agency_id: str
    agency_name: str
    state: str
    total_works: int
    completed_works: int
    in_progress_works: int
    completion_rate_pct: float
    total_expenditure: float
    total_transactions: int
    unique_vendors: int
    vendor_hhi: float
    top_vendor_name: Optional[str] = None
    top_vendor_share_pct: float
    avg_duration_days: Optional[float] = None
    risk_level: str
    generated_at: str

class ImplementingAgencyListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ImplementingAgencyItem]

class PaymentTimingSignalItem(BaseModel):
    signal_id: str
    signal_type: str
    entity_type: str
    entity_id: str
    entity_name: str
    state: str
    metric_value: float
    threshold_value: float
    affected_amount: float
    affected_vouchers: int
    severity: str
    reason: str
    recommended_action: str
    generated_at: str

class PaymentTimingSignalListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[PaymentTimingSignalItem]

# ====================================================================
# Deep Entity Intelligence & Multi-Entity Search Schemas
# ====================================================================

class EntityMediaItem(BaseModel):
    media_id: str
    entity_type: str
    entity_id: str
    media_type: str
    source_url: str
    source_name: str
    attribution: str
    license_note: str
    verification_status: str
    created_at: str

class EntityMediaListResponse(BaseModel):
    total: int
    items: List[EntityMediaItem]

class EntityProfileResponse(BaseModel):
    profile_id: str
    entity_type: str
    entity_id: str
    canonical_name: str
    biography_summary: Optional[str] = None
    official_website: Optional[str] = None
    nodal_address: Optional[str] = None
    contact_email: Optional[str] = None
    party_affiliation: Optional[str] = None
    term_label: Optional[str] = None
    source_provenance: str
    last_verified_at: str
    media: Optional[List[EntityMediaItem]] = None

class GlobalSearchResultItem(BaseModel):
    id: str
    type: str  # 'PEOPLE', 'WORKS', 'ENTITIES', 'VOUCHERS', 'CASES'
    title: str
    subtitle: str
    badge: str
    target_url: str
    metadata: Optional[Dict[str, Any]] = None

class GlobalSearchGroup(BaseModel):
    category: str
    count: int
    items: List[GlobalSearchResultItem]

class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    groups: Dict[str, GlobalSearchGroup]

class TimelineMilestone(BaseModel):
    milestone_id: str
    event_type: str
    date: Optional[str] = None
    title: str
    description: str
    is_official: bool = True
    amount: Optional[float] = None
    statutory_limit_days: Optional[int] = None
    actual_duration_days: Optional[int] = None
    status: str

class EntityTimelineResponse(BaseModel):
    entity_type: str
    entity_id: str
    entity_name: str
    milestones: List[TimelineMilestone]
    statutory_summary: Optional[Dict[str, Any]] = None

# --- Universal Data Discovery & Change Intelligence Schemas ---
class DiscoveredSourceItem(BaseModel):
    source_id: str
    source_name: str
    official_organization: str
    tier: str
    base_url: str
    endpoint: str
    http_method: str
    authentication_required: bool
    public_access: bool
    data_format: str
    supported_filters: List[str]
    pagination: bool
    entity_coverage: str
    refresh_frequency: str
    last_checked: str
    verification_status: str
    reliability_level: str
    terms_or_usage_notes: str
    sample_payload: Optional[str] = None
    required_headers: Optional[Dict[str, str]] = None

class DiscoveredSourceListResponse(BaseModel):
    total_sources: int
    health_summary: Dict[str, Any]
    sources: List[DiscoveredSourceItem]

class HistoricalSnapshotItem(BaseModel):
    snapshot_id: str
    source_id: str
    snapshot_date: str
    entity_type: str
    record_count: int
    checksum_sha256: str
    notes: Optional[str] = None
    created_at: str

class HistoricalSnapshotListResponse(BaseModel):
    total: int
    items: List[HistoricalSnapshotItem]

class ChangeEventItem(BaseModel):
    event_id: str
    snapshot_id: str
    entity_type: str
    entity_id: str
    entity_name: str
    change_type: str
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    change_magnitude: Optional[float] = None
    severity: str
    finding_summary: str
    created_at: str

class ChangeEventListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ChangeEventItem]

class ReconciliationRecordItem(BaseModel):
    reconciliation_id: str
    entity_type: str
    entity_id: str
    entity_name: str
    status: str
    existing_value: Optional[str] = None
    official_value: Optional[str] = None
    variance_summary: Optional[str] = None
    reconciled_at: str

class ReconciliationListResponse(BaseModel):
    total: int
    matched_count: int
    review_count: int
    gap_count: int
    items: List[ReconciliationRecordItem]

class WorkRiskSummary(BaseModel):
    work_id: int
    requires_attention: bool
    overall_risk_level: str  # 'CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL'
    risk_score: float
    headline_finding: str
    contributing_signals: List[Dict[str, Any]]
    change_events: List[Dict[str, Any]]
    statutory_citations: List[str]
    recommended_action: str

class LgdDistrictItem(BaseModel):
    lgd_district_code: str
    lgd_state_code: str
    state_name: str
    district_name: str
    census2011_code: Optional[str] = None
    created_at: str

class LgdDistrictListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[LgdDistrictItem]

class MpCrosswalkResponse(BaseModel):
    crosswalk_id: str
    internal_mp_id: str
    mospi_internal_id: str
    official_caption: str
    tenure_range: Optional[str] = None
    state_id: int
    house_code: int
    verified_source: str
    verified_at: str

class SnapshotSyncResponse(BaseModel):
    success: bool
    snapshot_id: str
    summary: Dict[str, Any]

# --- INGESTION & VALIDATION SCHEMAS ---
class ValidationIssue(BaseModel):
    row_index: int
    project_id: str
    field: str
    severity: str  # 'ERROR', 'WARNING'
    error_type: str
    message: str
    observed_value: str

class IngestValidateResponse(BaseModel):
    batch_id: str
    total_rows: int
    valid_count: int
    invalid_count: int
    error_count: int
    warning_count: int
    can_import: bool
    issues: List[ValidationIssue]
    preview_rows: List[Dict[str, Any]]

class IngestConfirmRequest(BaseModel):
    batch_id: str

class IngestConfirmResponse(BaseModel):
    batch_id: str
    imported_count: int
    alerts_created: int
    average_risk_score: float
    status: str
    message: str

# --- RISK ENGINE CONFIGURATION SCHEMAS ---
class RiskWeightsConfig(BaseModel):
    weights: Dict[str, float]
    thresholds: Dict[str, Any]
    disclaimer: str

class RiskWeightsUpdateRequest(BaseModel):
    weights: Optional[Dict[str, float]] = None
    thresholds: Optional[Dict[str, Any]] = None

# --- ALERT SYSTEM SCHEMAS ---
class AlertItem(BaseModel):
    alert_id: str
    project_id: str
    severity: str
    alert_type: str
    description: str
    evidence: str
    evidence_parsed: Dict[str, Any] = {}
    status: str
    assigned_to: Optional[str] = None
    assigned_role: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None
    reviewer_comment: Optional[str] = None
    project_title: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    mp_name: Optional[str] = None
    category: Optional[str] = None
    audit_trail: Optional[List[Dict[str, Any]]] = None

class AlertListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AlertItem]

class AlertUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_role: Optional[str] = None
    reviewer_comment: Optional[str] = None

