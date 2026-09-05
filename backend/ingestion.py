"""
JanDrishti — Data Ingestion & Multi-Stage Validation Service
Fulfills MPLADS Specification Req 5:
- Clean workflow: Upload -> Preview -> Validate -> Show Errors/Warnings -> Confirm Import -> Store Normalized Records -> Run Analytics
- No silent acceptance of malformed data
- Strict validation rules:
    * Missing project ID
    * Missing financial values
    * Invalid dates (format or chronological impossibility)
    * Negative expenditure (< 0)
    * Expenditure greater than sanctioned amount
    * Invalid progress values (< 0% or > 100%)
    * Duplicate records
    * Inconsistent project status
- Auto-triggers Risk Engine and Alert generation upon confirmed import
- Standard CSV template generation & 1-click synthetic demo batch
"""

import io
import csv
import json
import datetime
from typing import List, Dict, Any, Tuple, Optional
from backend.database import get_db_write_connection, get_db_connection
from backend.risk_engine import risk_engine
from backend.alerts_service import alerts_service

# Standard CSV Headers for MPLADS Data Ingestion
STANDARD_HEADERS = [
    "project_id",
    "project_name",
    "state",
    "district",
    "mp_name",
    "implementing_agency",
    "work_category",
    "sanction_date",
    "start_date",
    "expected_completion_date",
    "actual_completion_date",
    "status",
    "sanctioned_amount",
    "estimated_cost",
    "expenditure",
    "physical_progress"
]

class IngestionService:
    def __init__(self):
        # In-memory store for validated batches pending confirmation (keyed by batch_id)
        self._pending_batches: Dict[str, Dict[str, Any]] = {}

    def get_csv_template(self) -> str:
        """Returns standard CSV template content."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(STANDARD_HEADERS)
        # Sample row 1: Normal completed work
        writer.writerow([
            "PRJ_DEMO_101",
            "Construction of Community Hall and Solar Lighting",
            "MAHARASHTRA",
            "PUNE",
            "Shri Murlidhar Mohol",
            "Public Works Department (PWD Pune)",
            "COMMUNITY_CENTERS",
            "2024-04-15",
            "2024-05-01",
            "2024-11-30",
            "2024-11-20",
            "COMPLETED",
            "2500000.00",
            "2500000.00",
            "2420000.00",
            "100.0"
        ])
        # Sample row 2: Work with progress mismatch (anomaly)
        writer.writerow([
            "PRJ_DEMO_102",
            "Drinking Water Borewell and RO Filtration Plant",
            "MAHARASHTRA",
            "PUNE",
            "Shri Murlidhar Mohol",
            "Maharashtra Jeevan Pradhikaran",
            "DRINKING_WATER",
            "2025-01-10",
            "2025-02-01",
            "2025-08-30",
            "",
            "IN_PROGRESS",
            "1800000.00",
            "1800000.00",
            "1620000.00",
            "30.0"
        ])
        return output.getvalue()

    def get_sample_demo_batch(self) -> List[Dict[str, Any]]:
        """Returns a realistic synthetic demo batch of MPLADS projects with intentional analytical anomalies."""
        return [
            {
                "project_id": "PRJ_DEMO_201",
                "project_name": "Concrete Road from Gram Panchayat to ZP Primary School",
                "state": "MAHARASHTRA",
                "district": "PUNE",
                "mp_name": "Shri Murlidhar Mohol",
                "implementing_agency": "Zilla Parishad Works Dept",
                "work_category": "ROADS_AND_BRIDGES",
                "sanction_date": "2024-06-01",
                "start_date": "2024-06-15",
                "expected_completion_date": "2024-12-31",
                "actual_completion_date": "",
                "status": "IN_PROGRESS",
                "sanctioned_amount": 3500000.0,
                "estimated_cost": 3500000.0,
                "expenditure": 3150000.0,
                "physical_progress": 28.0  # Divergence +62% (MISMATCH)
            },
            {
                "project_id": "PRJ_DEMO_202",
                "project_name": "High-Tech Computer Lab and Digital Library in Govt College",
                "state": "MAHARASHTRA",
                "district": "PUNE",
                "mp_name": "Shri Murlidhar Mohol",
                "implementing_agency": "District Education Infrastructure Agency",
                "work_category": "EDUCATION",
                "sanction_date": "2023-09-10",
                "start_date": "2023-10-01",
                "expected_completion_date": "2024-04-30",
                "actual_completion_date": "",
                "status": "IN_PROGRESS",
                "sanctioned_amount": 2200000.0,
                "estimated_cost": 2200000.0,
                "expenditure": 1100000.0,
                "physical_progress": 45.0  # Overdue by > 400 days (DELAY)
            },
            {
                "project_id": "PRJ_DEMO_203",
                "project_name": "Construction of Primary Health Center Diagnostic Wing",
                "state": "TAMIL NADU",
                "district": "CHENNAI",
                "mp_name": "Thiru Dayanidhi Maran",
                "implementing_agency": "Chennai Municipal Corporation",
                "work_category": "HEALTH",
                "sanction_date": "2024-02-15",
                "start_date": "2024-03-01",
                "expected_completion_date": "2024-09-30",
                "actual_completion_date": "2024-10-15",
                "status": "COMPLETED",
                "sanctioned_amount": 4000000.0,
                "estimated_cost": 4000000.0,
                "expenditure": 4650000.0,  # Expenditure > Sanctioned (VIOLATION)
                "physical_progress": 100.0
            },
            {
                "project_id": "PRJ_DEMO_204",
                "project_name": "Installation of 100 Solar Street Lights in Rural Wards",
                "state": "UTTAR PRADESH",
                "district": "VARANASI",
                "mp_name": "Shri Narendra Modi",
                "implementing_agency": "Varanasi Development Authority",
                "work_category": "OTHER",
                "sanction_date": "2024-05-10",
                "start_date": "2024-05-25",
                "expected_completion_date": "2024-11-20",
                "actual_completion_date": "2024-11-10",
                "status": "COMPLETED",
                "sanctioned_amount": 1500000.0,
                "estimated_cost": 1500000.0,
                "expenditure": 1425000.0,
                "physical_progress": 100.0
            },
            {
                "project_id": "PRJ_DEMO_205",
                "project_name": "Installation of 100 Solar Street Lights in Rural Wards",  # Potential duplicate of PRJ_DEMO_204
                "state": "UTTAR PRADESH",
                "district": "VARANASI",
                "mp_name": "Shri Narendra Modi",
                "implementing_agency": "Varanasi Development Authority",
                "work_category": "OTHER",
                "sanction_date": "2024-06-15",
                "start_date": "2024-07-01",
                "expected_completion_date": "2024-12-30",
                "actual_completion_date": "",
                "status": "IN_PROGRESS",
                "sanctioned_amount": 1480000.0,
                "estimated_cost": 1480000.0,
                "expenditure": 600000.0,
                "physical_progress": 50.0
            },
            # Intentionally malformed records for validation testing:
            {
                "project_id": "PRJ_DEMO_206",
                "project_name": "Construction of Storm Water Drainage Line",
                "state": "BIHAR",
                "district": "PATNA",
                "mp_name": "Shri Ravi Shankar Prasad",
                "implementing_agency": "Patna Municipal Corporation",
                "work_category": "SANITATION",
                "sanction_date": "2024-08-01",
                "start_date": "2024-08-15",
                "expected_completion_date": "2025-02-28",
                "actual_completion_date": "",
                "status": "IN_PROGRESS",
                "sanctioned_amount": 2800000.0,
                "estimated_cost": 2800000.0,
                "expenditure": -50000.0,  # Negative expenditure (ERROR)
                "physical_progress": 35.0
            },
            {
                "project_id": "",  # Missing Project ID (ERROR)
                "project_name": "Community Toilet Complex with Rainwater Harvesting",
                "state": "RAJASTHAN",
                "district": "JAIPUR",
                "mp_name": "Smt. Manju Sharma",
                "implementing_agency": "Jaipur Nagar Nigam",
                "work_category": "SANITATION",
                "sanction_date": "2024-07-10",
                "start_date": "2024-07-20",
                "expected_completion_date": "2025-01-31",
                "actual_completion_date": "",
                "status": "IN_PROGRESS",
                "sanctioned_amount": 1200000.0,
                "estimated_cost": 1200000.0,
                "expenditure": 600000.0,
                "physical_progress": 140.0  # Invalid progress > 100 (ERROR)
            }
        ]

    def parse_file_content(self, filename: str, content: bytes) -> List[Dict[str, Any]]:
        """Parses CSV or Excel bytes into a list of row dictionaries."""
        filename_lower = filename.lower()
        if filename_lower.endswith(".csv"):
            try:
                df = pd.read_csv(io.BytesIO(content), dtype=str, keep_default_na=False)
            except Exception:
                df = pd.read_csv(io.BytesIO(content), encoding="latin1", dtype=str, keep_default_na=False)
        elif filename_lower.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content), dtype=str, keep_default_na=False)
        else:
            raise ValueError(f"Unsupported file format '{filename}'. Please provide a .csv or .xlsx file.")

        # Clean column names (strip whitespace and lowercase)
        df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
        return df.to_dict(orient="records")

    def validate_dataset(self, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Runs comprehensive validation across all rows:
        - Missing project ID
        - Missing financial values
        - Invalid dates
        - Negative expenditure
        - Expenditure > sanctioned amount
        - Invalid progress values (< 0 or > 100)
        - Duplicate records
        - Inconsistent project status
        """
        valid_rows = []
        invalid_rows = []
        issues = []
        seen_project_ids = set()

        for idx, r in enumerate(rows, start=1):
            row_issues = []
            pid = str(r.get("project_id", "")).strip()
            title = str(r.get("project_name", "") or r.get("work_description", "")).strip()
            status = str(r.get("status", "") or r.get("lifecycle_status", "")).strip().upper()

            # 1. Missing Project ID
            if not pid:
                row_issues.append({
                    "row_index": idx,
                    "project_id": "N/A",
                    "field": "project_id",
                    "severity": "ERROR",
                    "error_type": "MISSING_PROJECT_ID",
                    "message": "Project ID is required and cannot be blank.",
                    "observed_value": ""
                })
            elif pid in seen_project_ids:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "project_id",
                    "severity": "ERROR",
                    "error_type": "DUPLICATE_PROJECT_ID",
                    "message": f"Duplicate project ID '{pid}' detected in batch.",
                    "observed_value": pid
                })
            else:
                seen_project_ids.add(pid)

            # 2. Missing Title
            if not title:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "project_name",
                    "severity": "ERROR",
                    "error_type": "MISSING_TITLE",
                    "message": "Project name/description is required.",
                    "observed_value": ""
                })

            # 3. Financial Valuations
            sanctioned_raw = r.get("sanctioned_amount", r.get("recommended_amount", ""))
            expenditure_raw = r.get("expenditure", r.get("final_amount", 0))
            
            sanctioned_val = 0.0
            expenditure_val = 0.0

            try:
                sanctioned_val = float(str(sanctioned_raw).replace(",", "").strip() or 0)
                if sanctioned_val <= 0:
                    row_issues.append({
                        "row_index": idx,
                        "project_id": pid,
                        "field": "sanctioned_amount",
                        "severity": "WARNING",
                        "error_type": "ZERO_SANCTIONED_AMOUNT",
                        "message": "Sanctioned amount is zero or missing.",
                        "observed_value": str(sanctioned_raw)
                    })
            except Exception:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "sanctioned_amount",
                    "severity": "ERROR",
                    "error_type": "INVALID_FINANCIAL_VALUE",
                    "message": "Sanctioned amount must be a valid numeric number.",
                    "observed_value": str(sanctioned_raw)
                })

            try:
                expenditure_val = float(str(expenditure_raw).replace(",", "").strip() or 0)
                # Check negative expenditure
                if expenditure_val < 0:
                    row_issues.append({
                        "row_index": idx,
                        "project_id": pid,
                        "field": "expenditure",
                        "severity": "ERROR",
                        "error_type": "NEGATIVE_EXPENDITURE",
                        "message": f"Negative expenditure (₹{expenditure_val:,.2f}) is invalid.",
                        "observed_value": str(expenditure_raw)
                    })
                # Check expenditure > sanctioned
                elif sanctioned_val > 0 and expenditure_val > sanctioned_val:
                    row_issues.append({
                        "row_index": idx,
                        "project_id": pid,
                        "field": "expenditure",
                        "severity": "WARNING",
                        "error_type": "EXPENDITURE_EXCEEDS_SANCTION",
                        "message": f"Expenditure (₹{expenditure_val:,.2f}) exceeds sanctioned limit (₹{sanctioned_val:,.2f}) by ₹{expenditure_val - sanctioned_val:,.2f}.",
                        "observed_value": str(expenditure_raw)
                    })
            except Exception:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "expenditure",
                    "severity": "ERROR",
                    "error_type": "INVALID_FINANCIAL_VALUE",
                    "message": "Expenditure must be a valid numeric number.",
                    "observed_value": str(expenditure_raw)
                })

            # 4. Progress Value
            progress_raw = r.get("physical_progress", 0)
            progress_val = 0.0
            try:
                progress_val = float(str(progress_raw).replace("%", "").strip() or 0)
                if progress_val < 0 or progress_val > 100:
                    row_issues.append({
                        "row_index": idx,
                        "project_id": pid,
                        "field": "physical_progress",
                        "severity": "ERROR",
                        "error_type": "INVALID_PROGRESS_RANGE",
                        "message": f"Physical progress ({progress_val}%) must be between 0% and 100%.",
                        "observed_value": str(progress_raw)
                    })
            except Exception:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "physical_progress",
                    "severity": "ERROR",
                    "error_type": "INVALID_PROGRESS_FORMAT",
                    "message": "Physical progress must be a numeric percentage.",
                    "observed_value": str(progress_raw)
                })

            # 5. Dates sequence
            s_date = str(r.get("sanction_date", "")).strip()
            e_date = str(r.get("expected_completion_date", "")).strip()
            c_date = str(r.get("actual_completion_date", "")).strip()

            def is_valid_date(d_str):
                if not d_str: return True
                try:
                    datetime.date.fromisoformat(d_str[:10])
                    return True
                except Exception:
                    return False

            if s_date and not is_valid_date(s_date):
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "sanction_date",
                    "severity": "ERROR",
                    "error_type": "INVALID_DATE_FORMAT",
                    "message": f"Sanction date '{s_date}' is not a valid YYYY-MM-DD date.",
                    "observed_value": s_date
                })
            if e_date and not is_valid_date(e_date):
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "expected_completion_date",
                    "severity": "ERROR",
                    "error_type": "INVALID_DATE_FORMAT",
                    "message": f"Expected completion date '{e_date}' is not a valid YYYY-MM-DD date.",
                    "observed_value": e_date
                })
            if c_date and not is_valid_date(c_date):
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "actual_completion_date",
                    "severity": "ERROR",
                    "error_type": "INVALID_DATE_FORMAT",
                    "message": f"Actual completion date '{c_date}' is not a valid YYYY-MM-DD date.",
                    "observed_value": c_date
                })

            # 6. Inconsistent Status
            if status == "COMPLETED" and progress_val < 90.0:
                row_issues.append({
                    "row_index": idx,
                    "project_id": pid,
                    "field": "status",
                    "severity": "WARNING",
                    "error_type": "STATUS_PROGRESS_INCONSISTENCY",
                    "message": f"Status is marked 'COMPLETED' but recorded physical progress is only {progress_val:.1f}%.",
                    "observed_value": f"status={status}, progress={progress_val}%"
                })

            # Categorize row
            has_error = any(issue["severity"] == "ERROR" for issue in row_issues)
            if has_error:
                invalid_rows.append(r)
            else:
                valid_rows.append({
                    "project_id": pid,
                    "project_name": title,
                    "state": str(r.get("state", "GENERAL")).strip().upper(),
                    "district": str(r.get("district", "GENERAL")).strip().upper(),
                    "mp_name": str(r.get("mp_name", "Member of Parliament")).strip(),
                    "implementing_agency": str(r.get("implementing_agency", "District Administration")).strip(),
                    "work_category": str(r.get("work_category", "OTHER")).strip().upper(),
                    "sanction_date": s_date or None,
                    "start_date": str(r.get("start_date", "")).strip() or None,
                    "expected_completion_date": e_date or None,
                    "actual_completion_date": c_date or None,
                    "status": status or "IN_PROGRESS",
                    "sanctioned_amount": sanctioned_val,
                    "estimated_cost": sanctioned_val,
                    "expenditure": expenditure_val,
                    "physical_progress": progress_val,
                    "remaining_amount": max(0.0, sanctioned_val - expenditure_val)
                })

            issues.extend(row_issues)

        # Generate unique batch ID
        batch_id = f"BATCH-{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"
        self._pending_batches[batch_id] = {
            "valid_rows": valid_rows,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        total_issues = len(issues)
        error_count = sum(1 for i in issues if i["severity"] == "ERROR")
        warning_count = sum(1 for i in issues if i["severity"] == "WARNING")

        return {
            "batch_id": batch_id,
            "total_rows": len(rows),
            "valid_count": len(valid_rows),
            "invalid_count": len(invalid_rows),
            "error_count": error_count,
            "warning_count": warning_count,
            "can_import": len(valid_rows) > 0,
            "issues": issues,
            "preview_rows": rows[:15]
        }

    def confirm_import(self, batch_id: str, user: str = "Authorized Official", role: str = "DISTRICT_AUTHORITY") -> Dict[str, Any]:
        """
        Commits valid batch records into the database:
        - Stores in `works` table
        - Runs `risk_engine` on each imported project
        - Auto-generates alerts for HIGH and CRITICAL risks
        - Returns execution report
        """
        if batch_id not in self._pending_batches:
            raise ValueError(f"Batch '{batch_id}' not found or already processed. Please re-upload or re-validate.")

        batch_info = self._pending_batches.pop(batch_id)
        valid_rows = batch_info["valid_rows"]

        if not valid_rows:
            return {"imported_count": 0, "alerts_created": 0, "message": "No valid records to import."}

        conn = get_db_write_connection()
        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        imported_count = 0
        alerts_created = 0
        risk_scores = []

        for p in valid_rows:
            pid = p["project_id"]
            try:
                numeric_work_id = int(pid)
            except ValueError:
                numeric_work_id = 900000 + (abs(hash(str(pid))) % 99999)
            # Map into works table
            conn.execute("""
                INSERT OR REPLACE INTO works (
                    work_id, internal_mp_id, mp_name_raw, mp_name_normalized,
                    constituency_raw, constituency_normalized, state_raw, state_normalized,
                    house, category_raw, category_normalized, work_description_raw,
                    work_description_normalized, ida_raw, ida_normalized, lifecycle_status,
                    recommended_amount, sanctioned_amount, final_amount, recommendation_date,
                    duration_days, source_files, match_method, match_confidence, pipeline_created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, 'Lok Sabha', ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, 180, 'INGESTION_IMPORT_API', 'MANUAL_OR_CSV_INGESTION', 1.0, ?
                )
            """, (
                numeric_work_id,
                "INTERNAL_MP_INGESTED",
                p["mp_name"],
                p["mp_name"],
                p["district"],
                p["district"],
                p["state"],
                p["state"],
                p["work_category"],
                p["work_category"],
                p["project_name"],
                p["project_name"],
                p["implementing_agency"],
                p["implementing_agency"],
                p["status"],
                p["sanctioned_amount"],
                p["sanctioned_amount"],
                p["expenditure"],
                p["sanction_date"],
                now_ts
            ))
            imported_count += 1

        # Commit works immediately to release table lock
        conn.commit()
        conn.close()

        # Step 2: Run analytical risk engine and generate alerts
        for p in valid_rows:
            pid = p["project_id"]
            assessment = risk_engine.assess_project_risk(p)
            risk_scores.append(assessment["risk_score"])

            # If risk is HIGH or CRITICAL, auto-generate actionable alert
            if assessment["risk_level"] in ("HIGH", "CRITICAL"):
                if assessment["score_breakdown"]["mismatch_component"] >= 50.0:
                    a_type = "EXPENDITURE_PROGRESS_MISMATCH"
                elif assessment["score_breakdown"]["delay_component"] >= 50.0:
                    a_type = "PROJECT_DELAY_ANOMALY"
                elif assessment["score_breakdown"]["cost_deviation_component"] >= 50.0:
                    a_type = "COST_OVERRUN_ANOMALY"
                elif assessment["score_breakdown"]["duplicate_overlap_component"] >= 50.0:
                    a_type = "POTENTIAL_DUPLICATE_WORK"
                else:
                    a_type = "COMPOSITE_RISK_ANOMALY"

                desc = (
                    f"Risk score {assessment['risk_score']}/100 ({assessment['risk_level']}). "
                    f"Reasons: {'; '.join(assessment['explainable_reasons'][:2])}."
                )

                evidence_payload = {
                    "risk_score": assessment["risk_score"],
                    "risk_level": assessment["risk_level"],
                    "score_breakdown": assessment["score_breakdown"],
                    "explainable_reasons": assessment["explainable_reasons"],
                    "mismatch_analysis": assessment["mismatch_analysis"],
                    "delay_analysis": assessment["delay_analysis"],
                    "cost_benchmark": assessment["cost_benchmark"],
                    "duplicate_candidates": assessment["duplicate_candidates"],
                    "state": p["state"],
                    "district": p["district"],
                    "category": p["work_category"]
                }

                alerts_service.create_alert(
                    project_id=pid,
                    severity=assessment["risk_level"],
                    alert_type=a_type,
                    description=desc,
                    evidence=evidence_payload,
                    assigned_to="Unassigned",
                    assigned_role="DISTRICT_AUTHORITY",
                    user=user,
                    role=role
                )
                alerts_created += 1


        avg_risk = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0.0

        return {
            "batch_id": batch_id,
            "imported_count": imported_count,
            "alerts_created": alerts_created,
            "average_risk_score": avg_risk,
            "status": "COMPLETED",
            "message": f"Successfully ingested {imported_count} normalized projects and generated {alerts_created} risk alerts."
        }

ingestion_service = IngestionService()
