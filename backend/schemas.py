from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# --- Health & Stats ---
class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
    timestamp: str

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
    total_mps: int
    total_allocated_amount: float
    total_expenditure: float
    total_unspent_amount: float
    state_utilization_pct: Optional[float] = 0.0
    total_recommended_works: int
    total_completed_works: int
    state_completion_rate_pct: Optional[float] = 0.0
    total_transactions: int

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
    confidence_pct: float
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

