import json
import sqlite3
import hashlib
import datetime
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.database import get_db
from backend.auth import (
    optional_authenticated_user,
    require_case_management_role,
    AuthenticatedUser
)
from backend.schemas import (
    AnomalyResponse,
    AnomalyListResponse,
    DuplicatePairItem,
    DuplicatePairListResponse,
    ProgressMismatchListResponse,
    DelayPredictionListResponse,
    DataQualityResponse,
    StatutoryRuleListResponse,
    ImplementingAgencyListResponse,
    PaymentTimingSignalListResponse,
    GlobalSearchResponse,
    WorkRiskSummary,
    RiskWeightsConfig,
    RiskWeightsUpdateRequest,
    AIReviewLabelRequest,
)
from backend.intelligence import intelligence_service
from backend.risk_engine import risk_engine

router = APIRouter(tags=["AI & Forensic Intelligence"])

# ---------------------------------------------------------
# ANOMALY FLAGS & AUDIT INTELLIGENCE
# ---------------------------------------------------------

@router.get("/api/anomalies", response_model=AnomalyListResponse)
def list_anomalies(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    state: Optional[str] = Query(None, description="Filter anomalies by state"),
    district: Optional[str] = Query(None, description="Filter anomalies by district"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (WORK, MP, TRANSACTION, VENDOR)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    anomaly_type: Optional[str] = Query(None, description="Filter by anomaly type"),
    entity_id: Optional[str] = Query(None, description="Filter by specific entity ID"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum anomaly score"),
    max_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Maximum anomaly score"),
    sort_by: str = Query("anomaly_score", description="Sort by anomaly_score or generated_at"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve explainable anomaly flags with full mathematical traceability."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    # Role-based state scoping (exclude MP, Citizen, Analyst, and Ministry from forced override so they can view national scope)
    target_state = state.strip().upper() if (state and state.strip()) else (
        user.state.upper() if (user and user.state and user.jurisdiction_type not in ("NATIONAL", "PUBLIC") and user.role not in ("CITIZEN", "ANALYST", "MINISTRY_ADMIN", "MINISTRY_OFFICIAL", "MP")) else None
    )
    if target_state:
        where_clauses.append("""(
            entity_id IN (SELECT internal_mp_id FROM mps WHERE state_normalized = ?)
            OR entity_id IN (SELECT CAST(work_id AS TEXT) FROM works WHERE state_normalized = ?)
            OR entity_id IN (SELECT internal_transaction_id FROM transactions WHERE state_normalized = ?)
            OR entity_id IN (SELECT internal_vendor_id FROM vendors WHERE primary_state = ?)
            OR reason LIKE ?
        )""")
        params.extend([target_state, target_state, target_state, target_state, f"%{target_state}%"])

    target_district = district.strip().upper() if (district and district.strip()) else (
        user.district.upper() if (user and user.district and user.role == "DISTRICT_AUTHORITY") else None
    )
    if target_district:
        where_clauses.append("""(
            entity_id IN (SELECT CAST(work_id AS TEXT) FROM works WHERE ida_normalized LIKE ? OR constituency_normalized LIKE ?)
            OR entity_id IN (SELECT internal_mp_id FROM mps WHERE constituency_normalized LIKE ?)
            OR reason LIKE ?
        )""")
        d_p = f"%{target_district}%"
        params.extend([d_p, d_p, d_p, d_p])
    
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clauses.append("(anomaly_id LIKE 'ANOM_RS_%' OR entity_id LIKE 'INTERNAL_RS_MP_%')")
        elif h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clauses.append("(anomaly_id NOT LIKE 'ANOM_RS_%' AND entity_id NOT LIKE 'INTERNAL_RS_MP_%')")
            
    if entity_type and entity_type.strip():
        where_clauses.append("entity_type = ?")
        params.append(entity_type.strip().upper())
    if severity and severity.strip():
        where_clauses.append("severity = ?")
        params.append(severity.strip().upper())
    if anomaly_type and anomaly_type.strip():
        where_clauses.append("anomaly_type = ?")
        params.append(anomaly_type.strip())
    if entity_id and entity_id.strip():
        where_clauses.append("entity_id = ?")
        params.append(entity_id.strip())
    if min_score is not None:
        where_clauses.append("anomaly_score >= ?")
        params.append(min_score)
    if max_score is not None:
        where_clauses.append("anomaly_score <= ?")
        params.append(max_score)
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM anomalies WHERE {where_sql};", params)
    count_row = cursor.fetchone()
    total_count = count_row[0] if count_row else 0
    
    valid_sorts = {
        "anomaly_score": "anomaly_score",
        "generated_at": "generated_at"
    }
    order_col = valid_sorts.get(sort_by.strip() if sort_by else "anomaly_score", "anomaly_score")
    order_dir = "ASC" if (sort_order and sort_order.strip().lower() == "asc") else "DESC"
    
    query = f"""
        SELECT * FROM anomalies 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    cursor.execute(query, params + [limit, offset])
    
    rows = []
    for r in cursor.fetchall():
        d = dict(r)
        raw_metrics = d.get("supporting_metrics")
        if isinstance(raw_metrics, str):
            try:
                d["supporting_metrics"] = json.loads(raw_metrics)
            except Exception:
                d["supporting_metrics"] = {}
        elif not isinstance(raw_metrics, dict):
            d["supporting_metrics"] = {}
        rows.append(d)
        
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@router.get("/api/anomalies/{anomaly_id}", response_model=AnomalyResponse)
def get_anomaly_detail(anomaly_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve full traceability record for a specific anomaly ID."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM anomalies WHERE anomaly_id = ?;", [anomaly_id.strip()])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anomaly '{anomaly_id}' not found.")
    
    d = dict(row)
    try:
        d["supporting_metrics"] = json.loads(d["supporting_metrics"])
    except Exception:
        d["supporting_metrics"] = {}
    return d

# ---------------------------------------------------------
# CORE AI ALGORITHMS
# ---------------------------------------------------------

@router.get("/api/intelligence/duplicates", response_model=DuplicatePairListResponse)
def get_duplicate_works(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM)"),
    limit: int = Query(25, ge=1, le=200),
    offset: int = Query(0, ge=0),
    min_similarity: float = Query(0.60, ge=0.4, le=1.0)
):
    """Detects potential duplicate and overlapping works across geographical clusters."""
    return intelligence_service.detect_duplicates(
        state=state,
        district=district,
        category=category,
        severity=severity,
        limit=limit,
        offset=offset,
        min_similarity=min_similarity
    )

@router.get("/api/intelligence/progress-mismatch", response_model=ProgressMismatchListResponse)
def get_progress_mismatches(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    severity: Optional[str] = Query(None, description="Filter by exact severity (CRITICAL, HIGH, MEDIUM)"),
    min_severity: Optional[str] = Query(None, description="Filter by min severity (CRITICAL, HIGH, MEDIUM)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Identifies severe divergences between financial utilization and physical progress."""
    return intelligence_service.get_progress_mismatches(
        state=state,
        district=district,
        severity=severity,
        min_severity=min_severity,
        limit=limit,
        offset=offset
    )

@router.get("/api/intelligence/delay-predictions", response_model=DelayPredictionListResponse)
def get_delay_predictions(
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Computes empirical delay probabilities and schedule completion forecasts."""
    return intelligence_service.get_delay_predictions(
        category=category,
        state=state,
        district=district,
        severity=severity,
        limit=limit,
        offset=offset
    )

@router.get("/api/intelligence/works/{work_id}/profile")
def get_work_intelligence_profile(work_id: int):
    """Generates 360-degree comprehensive intelligence dossier for an individual project."""
    profile = intelligence_service.get_work_intelligence_profile(work_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Work #{work_id} not found")
    return profile

@router.get("/api/intelligence/data-quality", response_model=DataQualityResponse)
@router.get("/api/data-quality", response_model=DataQualityResponse, include_in_schema=False)
def get_data_quality_metrics():
    """Evaluates dataset integrity, field completeness, voucher linkage, and zero-variance proofs."""
    return intelligence_service.get_data_quality_metrics()

@router.get("/api/intelligence/agencies", response_model=ImplementingAgencyListResponse)
def list_implementing_agencies(
    state: Optional[str] = Query(None, description="Filter by state"),
    min_works: Optional[int] = Query(None, ge=1, description="Minimum works count"),
    min_exp: Optional[float] = Query(None, ge=0, description="Minimum expenditure in INR"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (CRITICAL, HIGH, MEDIUM, LOW)"),
    search: Optional[str] = Query(None, description="Search agency name"),
    sort_by: str = Query("total_expenditure", description="Sort field"),
    sort_order: str = Query("desc", description="Sort direction (asc, desc)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve forensic performance metrics for Implementing District Authorities including vendor HHI."""
    return intelligence_service.get_implementing_agencies(
        state=state,
        min_works=min_works,
        min_exp=min_exp,
        risk_level=risk_level,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )

@router.get("/api/intelligence/payment-timing", response_model=PaymentTimingSignalListResponse)
def list_payment_timing_signals(
    signal_type: Optional[str] = Query(None, description="Filter by signal type (MARCH_RUSH, RAPID_BUNCHING, REPEATED_AMOUNT)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve itemized payment timing anomalies including March rush and rapid bunching."""
    return intelligence_service.get_payment_timing_signals(
        signal_type=signal_type,
        severity=severity,
        state=state,
        limit=limit,
        offset=offset
    )

@router.get("/api/rules", response_model=StatutoryRuleListResponse)
def get_statutory_rules():
    """Retrieve official statutory compliance rules from MPLADS Guidelines 2023."""
    return intelligence_service.get_statutory_rules()

@router.get("/api/search", response_model=GlobalSearchResponse)
def global_search(
    q: str = Query("", description="Universal search term across people, works, entities, vouchers, cases"),
    limit: int = Query(5, ge=1, le=20, description="Max results per entity group")
):
    """Universal multi-entity search returning categorized groups."""
    return intelligence_service.global_search(query=q, limit_per_group=limit)

@router.get("/api/works/{work_id}/risk-summary", response_model=WorkRiskSummary)
def get_work_risk_summary(work_id: int):
    """Synthesize multiple signals on a single project into an aggregated risk summary dossier."""
    return intelligence_service.get_work_risk_summary(work_id=work_id)

# ---------------------------------------------------------
# RISK ENGINE & WEIGHTS CONFIGURATION
# ---------------------------------------------------------

@router.get("/api/config/risk-weights", response_model=RiskWeightsConfig)
def get_risk_weights():
    """Retrieve transparent risk scoring weights, statistical thresholds, and analytical disclaimers."""
    cfg = risk_engine.get_config()
    w = dict(cfg.get("weights", {}))
    w.setdefault("financial_anomaly_weight", w.get("cost_deviation", 0.3))
    w.setdefault("physical_delay_weight", w.get("delay_risk", 0.25))
    w.setdefault("vendor_risk_weight", w.get("ml_isolation_forest", 0.25))
    w.setdefault("statistical_anomaly_weight", w.get("statistical_anomaly", 0.2))
    cfg["weights"] = w
    return cfg

@router.post("/api/config/risk-weights", response_model=RiskWeightsConfig)
def update_risk_weights(
    req: RiskWeightsUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Update risk calculation weights and thresholds (Ministry Admin only)."""
    if current_user.role != "MINISTRY_ADMIN" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Statutory Violation: Only Ministry / MoSPI Administrator can tune policy risk scoring weights."
        )
    risk_engine.update_config(new_weights=req.weights, new_thresholds=req.thresholds)
    return get_risk_weights()

@router.post("/api/works/{work_id}/assess-risk")
def assess_work_risk_on_demand(
    work_id: int,
    db: sqlite3.Connection = Depends(get_db)
):
    """Execute on-demand transparent risk assessment with multi-layer Explainable AI breakdown."""
    row = db.execute("SELECT * FROM works WHERE work_id = ?", (work_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Work #{work_id} not found")
    
    project_dict = dict(row)
    project_dict["project_id"] = row["work_id"]
    project_dict["project_name"] = row["work_description_normalized"]
    project_dict["sanctioned_amount"] = row["recommended_amount"]
    project_dict["expenditure"] = row["final_amount"]
    project_dict["physical_progress"] = 100.0 if row["lifecycle_status"] == "COMPLETED" else 45.0

    assessment = risk_engine.assess_project_risk(project_dict)
    feature_version = "ai-features-v1"
    try:
        with open("data/features/ai_feature_snapshot.json", "r", encoding="utf-8") as handle:
            feature_version = json.load(handle).get("version", feature_version)
    except FileNotFoundError:
        pass
    created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assessment_id = "ASSESS_" + hashlib.sha256(
        f"WORK:{work_id}:{created_at}".encode("utf-8")
    ).hexdigest()[:20]
    evidence = assessment.get("explainable_reasons", [])
    signals = {
        "score_breakdown": assessment.get("score_breakdown", {}),
        "weights_used": assessment.get("weights_used", {}),
    }
    limitations = [
        "This is an analytical risk-prioritization signal, not proof of fraud.",
        "Detailed source records are snapshot-backed unless marked live by source lineage.",
        "Physical verification and human review are required before action.",
    ]
    db.execute(
        """INSERT INTO ai_assessments
        (assessment_id, entity_type, entity_id, model_name, model_version,
         feature_snapshot_version, risk_score, confidence, signals_json,
         evidence_json, limitations_json, review_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            assessment_id, "WORK", str(work_id), "JanDrishti Risk Ensemble",
            "risk-engine-v2", feature_version, assessment["risk_score"],
            round(min(1.0, max(0.0, len(evidence) / 5)), 3),
            json.dumps(signals), json.dumps(evidence), json.dumps(limitations),
            "PENDING", created_at,
        ),
    )
    db.commit()
    assessment["governance"] = {
        "assessment_id": assessment_id,
        "model_name": "JanDrishti Risk Ensemble",
        "model_version": "risk-engine-v2",
        "feature_snapshot_version": feature_version,
        "review_status": "PENDING",
        "confidence": round(min(1.0, max(0.0, len(evidence) / 5)), 3),
        "limitations": limitations,
    }
    return assessment


@router.get("/api/ai/assessments/{assessment_id}")
def get_ai_assessment(
    assessment_id: str,
    db: sqlite3.Connection = Depends(get_db),
):
    """Return the immutable explainability and review metadata for an assessment."""
    row = db.execute(
        "SELECT * FROM ai_assessments WHERE assessment_id = ?",
        (assessment_id.strip(),),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="AI assessment not found")
    result = dict(row)
    for field in ("signals_json", "evidence_json", "limitations_json"):
        result[field.removesuffix("_json")] = json.loads(result.pop(field))
    return result


@router.post("/api/ai/review-labels")
def create_ai_review_label(
    request: AIReviewLabelRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role),
    db: sqlite3.Connection = Depends(get_db),
):
    """Record an expert review label; labels are not accepted from public readers."""
    label = request.label.strip().upper()
    allowed = {"CONFIRMED_RISK", "NO_ISSUE", "NEEDS_MORE_EVIDENCE"}
    if label not in allowed:
        raise HTTPException(status_code=400, detail=f"Label must be one of: {', '.join(sorted(allowed))}")
    anomaly = db.execute("SELECT anomaly_id FROM anomalies WHERE anomaly_id = ?", (request.anomaly_id.strip(),)).fetchone()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    label_id = "LABEL_" + hashlib.sha256(
        f"{request.anomaly_id}:{current_user.user_id}:{now}".encode("utf-8")
    ).hexdigest()[:20]
    db.execute(
        """INSERT INTO ai_review_labels
        (label_id, anomaly_id, label, reviewer_id, reviewer_role, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (label_id, request.anomaly_id.strip(), label, current_user.user_id, current_user.role, request.notes, now),
    )
    db.commit()
    return {"label_id": label_id, "anomaly_id": request.anomaly_id, "label": label, "reviewer_id": current_user.user_id, "created_at": now}


@router.get("/api/ai/review-labels")
def list_ai_review_labels(
    limit: int = Query(100, ge=1, le=500),
    db: sqlite3.Connection = Depends(get_db),
):
    rows = db.execute(
        "SELECT * FROM ai_review_labels ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    return {"items": [dict(row) for row in rows], "total": len(rows)}
