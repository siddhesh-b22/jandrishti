"""
JanDrishti — Role-Tailored Dashboards & Multi-House Aggregations
Fulfills MPLADS Specification Req 14 & Req 15:
- National / MoSPI Dashboard
- State Nodal Authority Dashboard
- District Authority Dashboard
- Member of Parliament (MP) Dashboard
- Time-Series Trend Analysis (Expenditure, Completion, Delays, Risk Levels, Alerts)
"""

import os
import sqlite3
import logging
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection
from backend.alerts_service import alerts_service

logger = logging.getLogger("jandrishti.dashboards")

def _get_sqlite_fallback_conn():
    db_path = os.path.join(os.path.dirname(__file__), "..", "database", "mplads.db")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn
    return None

class DashboardService:
    def _execute_national(self, conn) -> Dict[str, Any]:
        # 1. Macro KPIs
        total_works = conn.execute("SELECT COUNT(*) FROM works").fetchone()[0]
        comp_works = conn.execute("SELECT COUNT(*) FROM works WHERE lifecycle_status = 'COMPLETED'").fetchone()[0]
        delayed_works = conn.execute("SELECT COUNT(*) FROM works WHERE duration_days > 240 AND lifecycle_status != 'COMPLETED'").fetchone()[0]

        mp_sums = conn.execute("""
            SELECT SUM(allocated_amount) as total_sanctioned,
                   SUM(total_expenditure) as total_expenditure,
                   SUM(unspent_amount) as total_unspent,
                   ROUND(CAST((SUM(total_expenditure) / NULLIF(SUM(allocated_amount), 0)) * 100.0 AS NUMERIC), 2) as national_utilization
            FROM mps
        """).fetchone()

        # 2. Risk & Alerts
        alert_summary = alerts_service.get_alert_summary()
        critical_alerts_count = alert_summary["by_severity"].get("CRITICAL", 0)
        high_risk_works_count = conn.execute("""
            SELECT COUNT(DISTINCT entity_id) FROM anomalies WHERE entity_type = 'WORK' AND severity IN ('CRITICAL', 'HIGH')
        """).fetchone()[0]

        # 3. State-by-State Comparison (Top 12)
        state_rows = conn.execute("""
            SELECT state_normalized as state,
                   COUNT(DISTINCT internal_mp_id) as total_mps,
                   SUM(allocated_amount) as allocated_amount,
                   SUM(total_expenditure) as total_expenditure,
                   ROUND(CAST((SUM(total_expenditure) / NULLIF(SUM(allocated_amount), 0)) * 100.0 AS NUMERIC), 1) as utilization_pct,
                   SUM(completed_works_count) as completed_works,
                   SUM(recommended_works_count) as total_works
            FROM mps
            GROUP BY state_normalized
            ORDER BY total_expenditure DESC
            LIMIT 12
        """).fetchall()

        # 4. District Ranking (Derived from MP Master)
        district_rows = conn.execute("""
            SELECT constituency_normalized as district,
                   state_normalized as state,
                   mp_name_normalized as mp_name,
                   allocated_amount,
                   total_expenditure,
                   utilization_pct,
                   completed_works_count,
                   recommended_works_count
            FROM mps
            ORDER BY total_expenditure DESC
            LIMIT 10
        """).fetchall()

        # 5. Category Distribution
        cat_rows = conn.execute("""
            SELECT category_normalized as category,
                   COUNT(*) as works_count,
                   SUM(COALESCE(final_amount, recommended_amount, 0)) as total_cost,
                   ROUND(CAST(AVG(duration_days) AS NUMERIC), 0) as avg_duration_days
            FROM works
            WHERE category_normalized IS NOT NULL
            GROUP BY category_normalized
            ORDER BY works_count DESC
        """).fetchall()

        # 6. Monthly Expenditure Velocity (Aggregated from Transactions)
        trend_rows = conn.execute("""
            SELECT strftime('%Y-%m', expenditure_date) as month_period,
                   COUNT(*) as voucher_count,
                   SUM(expenditure_amount) as monthly_expenditure
            FROM transactions
            WHERE expenditure_date IS NOT NULL AND expenditure_date >= '2024-01-01'
            GROUP BY month_period
            ORDER BY month_period ASC
            LIMIT 24
        """).fetchall()

        return {
            "scope": "NATIONAL_MOSPI",
            "kpis": {
                "total_projects": total_works,
                "total_sanctioned_amount": float(mp_sums["total_sanctioned"] or 0),
                "total_expenditure": float(mp_sums["total_expenditure"] or 0),
                "total_unspent_balance": float(mp_sums["total_unspent"] or 0),
                "national_utilization_pct": float(mp_sums["national_utilization"] or 0),
                "completed_projects": comp_works,
                "national_completion_rate_pct": round((comp_works / total_works) * 100.0, 1) if total_works > 0 else 0.0,
                "delayed_projects": delayed_works,
                "high_risk_projects": high_risk_works_count,
                "critical_alerts": critical_alerts_count,
                "total_alerts": alert_summary["total_alerts"]
            },
            "state_comparisons": [dict(r) for r in state_rows],
            "district_rankings": [dict(r) for r in district_rows],
            "category_distribution": [dict(r) for r in cat_rows],
            "expenditure_trends": [dict(r) for r in trend_rows],
            "alert_summary": alert_summary
        }

    def get_national_dashboard(self) -> Dict[str, Any]:
        try:
            conn = get_db_connection()
            try:
                return self._execute_national(conn)
            finally:
                conn.close()
        except Exception as exc:
            logger.warning("Primary DB failed for national dashboard (%s), using SQLite fallback", exc)
            fallback = _get_sqlite_fallback_conn()
            if fallback:
                try:
                    return self._execute_national(fallback)
                finally:
                    fallback.close()
            raise exc

    def _execute_state(self, conn, state_name: str) -> Dict[str, Any]:
        state_clean = state_name.strip().upper()

        # 1. State Macro Totals
        mp_sums = conn.execute("""
            SELECT COUNT(*) as total_mps,
                   SUM(allocated_amount) as allocated_amount,
                   SUM(total_expenditure) as total_expenditure,
                   SUM(unspent_amount) as unspent_amount,
                   ROUND(CAST((SUM(total_expenditure) / NULLIF(SUM(allocated_amount), 0)) * 100.0 AS NUMERIC), 2) as utilization_pct,
                   SUM(recommended_works_count) as total_works,
                   SUM(completed_works_count) as completed_works
            FROM mps
            WHERE state_normalized = ?
        """, (state_clean,)).fetchone()

        if not mp_sums or not mp_sums["total_mps"]:
            # Fallback to general state if name not matched
            state_clean = "MAHARASHTRA"
            mp_sums = conn.execute("""
                SELECT COUNT(*) as total_mps,
                       SUM(allocated_amount) as allocated_amount,
                       SUM(total_expenditure) as total_expenditure,
                       SUM(unspent_amount) as unspent_amount,
                       ROUND(CAST((SUM(total_expenditure) / NULLIF(SUM(allocated_amount), 0)) * 100.0 AS NUMERIC), 2) as utilization_pct,
                       SUM(recommended_works_count) as total_works,
                       SUM(completed_works_count) as completed_works
                FROM mps
                WHERE state_normalized = ?
            """, (state_clean,)).fetchone()

        # 2. Districts in this State
        districts = conn.execute("""
            SELECT constituency_normalized as district,
                   mp_name_normalized as mp_name,
                   allocated_amount,
                   total_expenditure,
                   unspent_amount,
                   utilization_pct,
                   completed_works_count,
                   recommended_works_count,
                   ROUND(CAST((CAST(completed_works_count AS REAL) / NULLIF(recommended_works_count, 0)) * 100.0 AS NUMERIC), 1) as completion_rate_pct
            FROM mps
            WHERE state_normalized = ?
            ORDER BY total_expenditure DESC
        """, (state_clean,)).fetchall()

        # 3. High Risk Projects in State
        high_risk_rows = conn.execute("""
            SELECT w.work_id, w.work_description_normalized as title, w.category_normalized as category,
                   w.constituency_normalized as district, w.recommended_amount, w.final_amount,
                   w.duration_days, w.lifecycle_status, a.severity, a.reason as anomaly_reason,
                   a.anomaly_score
            FROM works w
            JOIN anomalies a ON CAST(w.work_id AS TEXT) = a.entity_id AND a.entity_type = 'WORK'
            WHERE w.state_normalized = ? AND a.severity IN ('CRITICAL', 'HIGH')
            ORDER BY a.anomaly_score DESC
            LIMIT 15
        """, (state_clean,)).fetchall()

        # 4. Implementing Agency Performance in State
        agency_rows = conn.execute("""
            SELECT ida_normalized as agency_name,
                   COUNT(*) as works_count,
                   SUM(CASE WHEN lifecycle_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
                   ROUND(CAST(AVG(duration_days) AS NUMERIC), 0) as avg_duration,
                   SUM(COALESCE(final_amount, recommended_amount, 0)) as total_funds
            FROM works
            WHERE state_normalized = ? AND ida_normalized IS NOT NULL
            GROUP BY ida_normalized
            ORDER BY works_count DESC
            LIMIT 8
        """, (state_clean,)).fetchall()

        # 5. Delays in State
        delayed_works = conn.execute("""
            SELECT COUNT(*) FROM works
            WHERE state_normalized = ? AND duration_days > 240 AND lifecycle_status != 'COMPLETED'
        """, (state_clean,)).fetchone()[0]

        # 6. State Alerts
        state_alerts = alerts_service.list_alerts(state=state_clean, limit=15)

        return {
            "scope": "STATE_NODAL_AUTHORITY",
            "state": state_clean,
            "summary": {
                "total_mps": mp_sums["total_mps"],
                "allocated_amount": float(mp_sums["allocated_amount"] or 0),
                "total_expenditure": float(mp_sums["total_expenditure"] or 0),
                "unspent_amount": float(mp_sums["unspent_amount"] or 0),
                "utilization_pct": float(mp_sums["utilization_pct"] or 0),
                "total_works": mp_sums["total_works"],
                "completed_works": mp_sums["completed_works"],
                "completion_rate_pct": round((mp_sums["completed_works"] / mp_sums["total_works"]) * 100.0, 1) if mp_sums["total_works"] else 0.0,
                "delayed_works": delayed_works
            },
            "districts": [dict(r) for r in districts],
            "high_risk_projects": [dict(r) for r in high_risk_rows],
            "agency_trends": [dict(r) for r in agency_rows],
            "alerts": state_alerts["items"],
            "alert_total": state_alerts["total"]
        }

    def get_state_dashboard(self, state_name: str) -> Dict[str, Any]:
        try:
            conn = get_db_connection()
            try:
                return self._execute_state(conn, state_name)
            finally:
                conn.close()
        except Exception as exc:
            logger.warning("Primary DB failed for state dashboard (%s), using SQLite fallback", exc)
            fallback = _get_sqlite_fallback_conn()
            if fallback:
                try:
                    return self._execute_state(fallback, state_name)
                finally:
                    fallback.close()
            raise exc

    def get_district_dashboard(self, district_name: str, state_name: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        dist_clean = district_name.strip().upper()

        # Lookup MP / District record
        query = "SELECT * FROM mps WHERE constituency_normalized = ?"
        params = [dist_clean]
        if state_name:
            query += " AND state_normalized = ?"
            params.append(state_name.strip().upper())

        mp_row = conn.execute(query, params).fetchone()
        if not mp_row:
            # Fallback to Pune
            dist_clean = "PUNE"
            mp_row = conn.execute("SELECT * FROM mps WHERE constituency_normalized = 'PUNE'").fetchone()

        state_clean = mp_row["state_normalized"]

        # Works in this District
        works_rows = conn.execute("""
            SELECT work_id, work_description_normalized as title, category_normalized as category,
                   lifecycle_status, recommended_amount, final_amount, duration_days,
                   recommendation_date, completed_date, ida_normalized as implementing_agency
            FROM works
            WHERE constituency_normalized = ? AND state_normalized = ?
            ORDER BY recommended_amount DESC
            LIMIT 50
        """, (dist_clean, state_clean)).fetchall()

        # Delayed works in District
        delayed_rows = conn.execute("""
            SELECT work_id, work_description_normalized as title, category_normalized as category,
                   duration_days, recommended_amount, ida_normalized as implementing_agency
            FROM works
            WHERE constituency_normalized = ? AND state_normalized = ? AND duration_days > 200 AND lifecycle_status != 'COMPLETED'
            ORDER BY duration_days DESC
            LIMIT 15
        """, (dist_clean, state_clean)).fetchall()

        # District Alerts
        district_alerts = alerts_service.list_alerts(district=dist_clean, limit=20)

        conn.close()

        return {
            "scope": "DISTRICT_AUTHORITY",
            "district": dist_clean,
            "state": state_clean,
            "mp_info": {
                "mp_id": mp_row["internal_mp_id"],
                "mp_name": mp_row["mp_name_normalized"],
                "allocated_amount": mp_row["allocated_amount"],
                "total_expenditure": mp_row["total_expenditure"],
                "unspent_amount": mp_row["unspent_amount"],
                "utilization_pct": mp_row["utilization_pct"],
                "recommended_works": mp_row["recommended_works_count"],
                "completed_works": mp_row["completed_works_count"]
            },
            "works": [dict(r) for r in works_rows],
            "total_works": len(works_rows),
            "delayed_works": [dict(r) for r in delayed_rows],
            "alerts": district_alerts["items"],
            "alert_total": district_alerts["total"]
        }

    def get_mp_dashboard(self, mp_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        mp_row = conn.execute("SELECT * FROM mps WHERE internal_mp_id = ?", (mp_id,)).fetchone()
        if not mp_row:
            # Fallback to Pune MP
            mp_row = conn.execute("SELECT * FROM mps WHERE constituency_normalized = 'PUNE' LIMIT 1").fetchone()

        mp_id_clean = mp_row["internal_mp_id"]

        # Works recommended by this MP
        works_rows = conn.execute("""
            SELECT work_id, work_description_normalized as title, category_normalized as category,
                   lifecycle_status, recommended_amount, final_amount, duration_days,
                   recommendation_date, completed_date, ida_normalized as implementing_agency
            FROM works
            WHERE internal_mp_id = ?
            ORDER BY recommended_amount DESC
            LIMIT 40
        """, (mp_id_clean,)).fetchall()

        # Category utilization for this MP
        cat_rows = conn.execute("""
            SELECT category_normalized as category,
                   COUNT(*) as count,
                   SUM(COALESCE(final_amount, recommended_amount, 0)) as total_amount
            FROM works
            WHERE internal_mp_id = ?
            GROUP BY category_normalized
            ORDER BY count DESC
        """, (mp_id_clean,)).fetchall()

        # Alerts in this MP's works
        mp_alerts = alerts_service.list_alerts(mp_id=mp_id_clean, limit=15)

        conn.close()

        return {
            "scope": "MEMBER_OF_PARLIAMENT",
            "mp_profile": {
                "mp_id": mp_row["internal_mp_id"],
                "mp_name": mp_row["mp_name_normalized"],
                "constituency": mp_row["constituency_normalized"],
                "state": mp_row["state_normalized"],
                "house": mp_row["house"],
                "statutory_annual_quota_cr": 5.0,
                "allocated_amount": mp_row["allocated_amount"],
                "total_expenditure": mp_row["total_expenditure"],
                "unspent_balance": mp_row["unspent_amount"],
                "utilization_pct": mp_row["utilization_pct"],
                "recommended_works_count": mp_row["recommended_works_count"],
                "completed_works_count": mp_row["completed_works_count"],
                "completion_rate_pct": mp_row["completion_rate_pct"]
            },
            "works": [dict(r) for r in works_rows],
            "category_breakdown": [dict(r) for r in cat_rows],
            "alerts": mp_alerts["items"],
            "alert_total": mp_alerts["total"]
        }

    def get_trend_analytics(self, period: str = "monthly") -> Dict[str, Any]:
        conn = get_db_connection()

        # 1. Expenditure Trend Over Time
        exp_rows = conn.execute("""
            SELECT strftime('%Y-%m', expenditure_date) as date_period,
                   COUNT(*) as vouchers,
                   SUM(expenditure_amount) as expenditure
            FROM transactions
            WHERE expenditure_date IS NOT NULL AND expenditure_date >= '2023-01-01'
            GROUP BY date_period
            ORDER BY date_period ASC
        """).fetchall()

        # 2. Works Completion Timeline
        comp_rows = conn.execute("""
            SELECT strftime('%Y-%m', completed_date) as date_period,
                   COUNT(*) as completed_count
            FROM works
            WHERE completed_date IS NOT NULL AND completed_date >= '2023-01-01'
            GROUP BY date_period
            ORDER BY date_period ASC
        """).fetchall()

        # 3. Anomaly Severity Distribution
        anom_rows = conn.execute("""
            SELECT severity, COUNT(*) as count
            FROM anomalies
            GROUP BY severity
        """).fetchall()

        # 4. Alerts Status Distribution
        alert_rows = conn.execute("""
            SELECT status, severity, COUNT(*) as count
            FROM alerts
            GROUP BY status, severity
        """).fetchall()

        conn.close()

        return {
            "period": period,
            "expenditure_timeline": [dict(r) for r in exp_rows],
            "completion_timeline": [dict(r) for r in comp_rows],
            "anomaly_distribution": [dict(r) for r in anom_rows],
            "alert_lifecycle_distribution": [dict(r) for r in alert_rows]
        }

dashboard_service = DashboardService()
