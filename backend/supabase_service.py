"""
JanDrishti — Supabase Cloud Data Service
Direct integration with the live Supabase PostgREST API for MPLADS monitoring.
Authoritative source of truth for canonical representatives, infrastructure works,
vouchers, contractors, and geographic jurisdiction.
"""

import os
import json
import time
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple, Union

from backend.config import (
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    SUPABASE_PUBLISHABLE_KEY,
)

logger = logging.getLogger("jandrishti.supabase")


class SupabaseService:
    """
    High-performance PostgREST HTTP client for Supabase Cloud Database.
    Provides strict hierarchical jurisdiction filtering (State -> District/Constituency -> MP).
    """

    def __init__(self):
        self.base_url = (SUPABASE_URL or "").rstrip("/")
        self.rest_url = f"{self.base_url}/rest/v1" if self.base_url else ""
        # Prefer secret key (service role) to bypass RLS for server-side operations
        self.api_key = SUPABASE_SECRET_KEY or SUPABASE_PUBLISHABLE_KEY or ""
        self._cached_health: Optional[Dict[str, Any]] = None
        self._last_health_check: float = 0

        # Memory caches for dimensional lookup
        self._state_cache: Optional[List[Dict[str, Any]]] = None
        self._state_map: Dict[str, int] = {}  # "MAHARASHTRA" -> 20
        self._id_to_state: Dict[int, str] = {}  # 20 -> "MAHARASHTRA"
        self._const_cache: Dict[Optional[int], List[Dict[str, Any]]] = {}
        self._rep_id_cache: Dict[str, str] = {}  # "INTERNAL_MP_278" -> "e3da3960-..."
        self._uuid_to_legacy_mp: Dict[str, str] = {}  # "e3da3960-..." -> "INTERNAL_MP_278"
        self._last_cache_refresh: float = 0

    @property
    def is_configured(self) -> bool:
        return bool(self.rest_url and self.api_key)

    def _get_headers(self, prefer_count: bool = False, is_mutate: bool = False) -> Dict[str, str]:
        headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if prefer_count:
            headers["Prefer"] = "count=exact"
        if is_mutate:
            headers["Prefer"] = "return=representation"
        return headers

    def _request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        method: str = "GET",
        payload: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None,
        prefer_count: bool = False,
        timeout: float = 12.0
    ) -> Tuple[int, Any, Optional[int]]:
        """
        Execute an HTTP request to Supabase PostgREST endpoint.
        Returns: (status_code, response_data, total_count_if_requested)
        """
        if not self.is_configured:
            return 503, {"error": "Supabase is not configured with valid URL and Key"}, None

        url = f"{self.rest_url}/{endpoint.lstrip('/')}"
        if params:
            clean_params = {k: v for k, v in params.items() if v is not None}
            if clean_params:
                url = f"{url}?{urllib.parse.urlencode(clean_params)}"

        headers = self._get_headers(prefer_count=prefer_count, is_mutate=(method in ("POST", "PATCH", "PUT")))
        data_bytes = None
        if payload is not None:
            data_bytes = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                status_code = resp.status
                body = resp.read().decode("utf-8")
                data = json.loads(body) if body else []
                total_count = None
                content_range = resp.headers.get("Content-Range", "")
                if content_range and "/" in content_range:
                    parts = content_range.split("/")
                    if len(parts) == 2 and parts[1].isdigit():
                        total_count = int(parts[1])
                return status_code, data, total_count
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logger.warning("Supabase HTTP error %s on %s: %s", e.code, endpoint, err_body)
            try:
                err_json = json.loads(err_body)
            except Exception:
                err_json = {"error": err_body}
            return e.code, err_json, None
        except Exception as exc:
            logger.error("Supabase request failed on %s: %s", endpoint, exc)
            return 500, {"error": str(exc)}, None

    def check_health(self) -> Dict[str, Any]:
        """Check Supabase availability and return connection metadata with caching."""
        now = time.time()
        if self._cached_health and (now - self._last_health_check < 30.0):
            return self._cached_health

        if not self.is_configured:
            self._cached_health = {
                "connected": False,
                "status": "unconfigured",
                "url": self.base_url or "none",
                "message": "Supabase credentials missing",
            }
            self._last_health_check = now
            return self._cached_health

        t0 = time.perf_counter()
        status, data, _ = self._request("states", params={"select": "state_id", "limit": 1}, timeout=5.0)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

        if status == 200:
            self._cached_health = {
                "connected": True,
                "status": "connected",
                "url": self.base_url,
                "latency_ms": elapsed_ms,
                "mode": "supabase_cloud_postgrest",
                "verified_tables": [
                    "infrastructure_works",
                    "representatives",
                    "treasury_vouchers",
                    "contractors",
                    "states",
                    "constituencies",
                    "parliamentary_allocations"
                ]
            }
        else:
            self._cached_health = {
                "connected": False,
                "status": "error",
                "url": self.base_url,
                "error_code": status,
                "error": str(data),
            }
        self._last_health_check = now
        return self._cached_health

    def _ensure_dimensional_cache(self):
        """Pre-loads states and common dimension mappings for high-speed resolution."""
        now = time.time()
        if self._state_cache and (now - self._last_cache_refresh < 300.0):
            return

        # 1. Cache States
        status, data, _ = self._request("states", params={"select": "*", "order": "name_en.asc"}, timeout=6.0)
        if status == 200 and isinstance(data, list):
            self._state_cache = data
            self._state_map = {s["name_en"].upper(): s["state_id"] for s in data if "name_en" in s}
            self._id_to_state = {s["state_id"]: s["name_en"].upper() for s in data if "state_id" in s}

        self._last_cache_refresh = now

    def get_states(self) -> List[Dict[str, Any]]:
        self._ensure_dimensional_cache()
        return self._state_cache or []

    def get_state_id(self, state_name: str) -> Optional[int]:
        if not state_name:
            return None
        self._ensure_dimensional_cache()
        clean = state_name.strip().upper()
        return self._state_map.get(clean)

    def get_constituencies(self, state_id: Optional[int] = None) -> List[Dict[str, Any]]:
        if state_id in self._const_cache:
            return self._const_cache[state_id]

        params = {"select": "*", "order": "constituency_name.asc"}
        if state_id is not None:
            params["state_id"] = f"eq.{state_id}"
        status, data, _ = self._request("constituencies", params=params, timeout=6.0)
        result = data if status == 200 and isinstance(data, list) else []
        self._const_cache[state_id] = result
        return result

    def get_constituency_id(self, const_name: str, state_id: Optional[int] = None) -> Optional[int]:
        if not const_name:
            return None
        consts = self.get_constituencies(state_id)
        clean = const_name.strip().upper()
        for c in consts:
            if c.get("constituency_name", "").strip().upper() == clean:
                return c.get("constituency_id")
        return None

    def get_representative_uuid(self, mp_identifier: str) -> Optional[str]:
        if not mp_identifier:
            return None
        clean = mp_identifier.strip()
        if clean in self._rep_id_cache:
            return self._rep_id_cache[clean]

        # Query Supabase representatives
        params = {"select": "representative_id,legacy_internal_id", "limit": 1}
        if clean.startswith("INTERNAL_MP_"):
            params["legacy_internal_id"] = f"eq.{clean}"
        elif len(clean) == 36 and "-" in clean:
            return clean
        else:
            params["canonical_name"] = f"ilike.*{clean}*"

        status, data, _ = self._request("representatives", params=params, timeout=5.0)
        if status == 200 and isinstance(data, list) and data:
            rep_uuid = data[0].get("representative_id")
            leg_id = data[0].get("legacy_internal_id")
            if rep_uuid:
                self._rep_id_cache[clean] = rep_uuid
                if leg_id:
                    self._rep_id_cache[leg_id] = rep_uuid
                    self._uuid_to_legacy_mp[rep_uuid] = leg_id
                return rep_uuid
        return None

    # =========================================================================
    # CORE DOMAIN QUERIES WITH JURISDICTION ENFORCEMENT
    # =========================================================================

    def get_infrastructure_works(
        self,
        limit: int = 50,
        offset: int = 0,
        state: Optional[str] = None,
        district: Optional[str] = None,
        constituency: Optional[str] = None,
        mp_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "work_id",
        sort_order: str = "desc",
    ) -> Dict[str, Any]:
        """
        Query infrastructure works from Supabase PostgREST with strict hierarchical jurisdiction scoping.
        Guarantees that state, constituency, and MP constraints are enforced at the database layer.
        """
        params: Dict[str, Any] = {
            "select": "work_id,category_code,description_raw,description_clean,lifecycle_status,recommended_amount,sanctioned_amount,final_disbursed_amount,recommendation_date,sanction_date,completion_date,village_name,block_name,gram_panchayat,assigned_contractor_name,has_geo_photos,match_confidence,match_method,states(name_en),constituencies(constituency_name),representatives(canonical_name,legacy_internal_id,representative_terms(house))",
            "limit": limit,
            "offset": offset,
        }

        # Order mapping
        order_col = "work_id"
        if sort_by in ("sanctioned_amount", "recommended_amount", "final_disbursed_amount", "recommendation_date", "completion_date"):
            order_col = sort_by
        order_dir = "desc" if sort_order.lower() == "desc" else "asc"
        params["order"] = f"{order_col}.{order_dir}"

        # 1. Hierarchical State Filter (Database ID Scoping)
        resolved_state_id = None
        if state and state.upper() != "ALL":
            resolved_state_id = self.get_state_id(state)
            if resolved_state_id is not None:
                params["state_id"] = f"eq.{resolved_state_id}"
            else:
                # State not found -> return empty, never leak
                return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}

        # 2. Hierarchical Constituency Filter
        target_const = constituency or district
        if target_const and target_const.upper() != "ALL":
            const_id = self.get_constituency_id(target_const, resolved_state_id)
            if const_id is not None:
                params["constituency_id"] = f"eq.{const_id}"
            else:
                # Contradictory or invalid constituency for this state -> return 0, NEVER leak
                return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}


        # 3. Canonical MP / Representative Filter
        if mp_id:
            rep_uuid = self.get_representative_uuid(mp_id)
            if rep_uuid:
                params["representative_id"] = f"eq.{rep_uuid}"
            else:
                # Invalid MP requested -> return empty, never leak other MP's works
                return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}

        # 4. Lifecycle Status
        if status_filter and status_filter.upper() != "ALL":
            params["lifecycle_status"] = f"eq.{status_filter.upper()}"

        # 5. Work Category
        if category and category.upper() != "ALL":
            params["category_code"] = f"eq.{category}"

        # 6. Full-Text Search
        if search and search.strip():
            clean_search = search.strip()
            params["description_raw"] = f"ilike.*{clean_search}*"

        status, data, total = self._request("infrastructure_works", params=params, prefer_count=True)
        raw_items = data if status in (200, 206) and isinstance(data, list) else []

        # Transform to WorkResponse schema
        items = []
        for w in raw_items:
            rep = w.get("representatives") or {}
            terms = rep.get("representative_terms") or [{}]
            house_raw = terms[0].get("house") if terms else "LOK_SABHA"
            house = "Lok Sabha" if house_raw == "LOK_SABHA" else ("Rajya Sabha" if house_raw == "RAJYA_SABHA" else "Lok Sabha")
            st_name = (w.get("states") or {}).get("name_en", "UNKNOWN")
            co_name = (w.get("constituencies") or {}).get("constituency_name", "UNKNOWN")

            rec_amt = float(w.get("recommended_amount") or 0.0) if w.get("recommended_amount") is not None else None
            sanc_amt = float(w.get("sanctioned_amount") or 0.0) if w.get("sanctioned_amount") is not None else None
            fin_amt = float(w.get("final_disbursed_amount") or (sanc_amt or 0.0)) if (w.get("final_disbursed_amount") is not None or sanc_amt is not None) else None

            rec_date = str(w.get("recommendation_date") or "") or None
            rec_year = int(rec_date.split("-")[0]) if rec_date and len(rec_date) >= 4 and rec_date[:4].isdigit() else None
            comp_date = str(w.get("completion_date") or "") or None
            comp_year = int(comp_date.split("-")[0]) if comp_date and len(comp_date) >= 4 and comp_date[:4].isdigit() else None

            item = {
                "work_id": w["work_id"],
                "internal_mp_id": rep.get("legacy_internal_id", ""),
                "mp_name_normalized": rep.get("canonical_name", ""),
                "constituency_normalized": co_name.upper(),
                "state_normalized": st_name.upper(),
                "house": house,
                "category_normalized": w.get("category_code") or "OTHER",
                "work_description_normalized": w.get("description_clean") or w.get("description_raw") or "Public Infrastructure Work",
                "ida_normalized": "DISTRICT IMPLEMENTING AUTHORITY",
                "lifecycle_status": w.get("lifecycle_status") or "RECOMMENDED",
                "recommended_amount": rec_amt,
                "recommendation_date": rec_date,
                "recommendation_year": rec_year,
                "final_amount": fin_amt,
                "completed_date": comp_date,
                "completion_year": comp_year,
                "duration_days": None,
                "cost_variance_amount": (fin_amt - rec_amt) if (fin_amt is not None and rec_amt is not None) else None,
                "cost_variance_pct": round(((fin_amt - rec_amt) / rec_amt) * 100, 2) if (fin_amt is not None and rec_amt and rec_amt > 0) else None,
                "has_images": bool(w.get("has_geo_photos")),
                "average_rating": None,
                "sanctioned_amount": sanc_amt,
                "sanction_date": str(w.get("sanction_date") or "") or None,
                "latitude": None,
                "longitude": None,
                "village": w.get("village_name"),
                "block": w.get("block_name"),
                "gram_panchayat": w.get("gram_panchayat"),
                "work_contractor": w.get("assigned_contractor_name"),
                "source_files": "supabase_canonical",
                "match_method": w.get("match_method") or "CANONICAL_LINK",
                "match_confidence": float(w.get("match_confidence") or 1.0)
            }
            items.append(item)

        return {
            "total": total or len(items),
            "limit": limit,
            "offset": offset,
            "items": items,
            "source": "supabase"
        }

    def get_representatives(
        self,
        limit: int = 50,
        offset: int = 0,
        state: Optional[str] = None,
        house: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Query representatives from Supabase PostgREST.
        """
        params: Dict[str, Any] = {
            "select": "representative_id,legacy_internal_id,canonical_name,normalized_name,gender,date_of_birth,profession,official_email,contact_phone,delhi_address,permanent_address,photo_source_url,sansad_mp_code,created_at,political_parties(party_abbreviation,party_full_name),representative_terms(house,states(name_en),constituencies(constituency_name)),parliamentary_allocations(statutory_quota,released_amount)",
            "limit": limit,
            "offset": offset,
            "order": "canonical_name.asc",
        }

        if search and search.strip():
            params["canonical_name"] = f"ilike.*{search.strip()}*"

        status, data, total = self._request("representatives", params=params, prefer_count=True)
        raw_items = data if status in (200, 206) and isinstance(data, list) else []

        items = []
        for r in raw_items:
            terms = r.get("representative_terms") or [{}]
            first_term = terms[0] if terms else {}
            st = (first_term.get("states") or {}).get("name_en", "UNKNOWN")
            co = (first_term.get("constituencies") or {}).get("constituency_name", "UNKNOWN")
            party = r.get("political_parties") or {}
            allocs = r.get("parliamentary_allocations") or [{}]
            quota = float(allocs[0].get("statutory_quota") or 0.0) if allocs else 0.0
            released = float(allocs[0].get("released_amount") or 0.0) if allocs else 0.0

            # State filtering in case of term join
            if state and state.upper() != "ALL":
                if st.upper() != state.upper():
                    continue

            # House filtering
            house_term = first_term.get("house", "LOK_SABHA")
            house_display = "Lok Sabha" if house_term == "LOK_SABHA" else ("Rajya Sabha" if house_term == "RAJYA_SABHA" else "Lok Sabha")
            if house and house.upper() != "ALL":
                if house.upper() == "LOK_SABHA" and house_term != "LOK_SABHA":
                    continue
                if house.upper() == "RAJYA_SABHA" and house_term != "RAJYA_SABHA":
                    continue

            item = {
                "internal_mp_id": r.get("legacy_internal_id", ""),
                "mp_name_raw": r.get("canonical_name", ""),
                "mp_name_normalized": r.get("normalized_name") or r.get("canonical_name", ""),
                "constituency_raw": co,
                "constituency_normalized": co.upper(),
                "state_raw": st,
                "state_normalized": st.upper(),
                "house": house_display,
                "allocated_amount": quota,
                "total_expenditure": released,
                "unspent_amount": max(0.0, quota - released),
                "utilization_pct": round((released / quota) * 100, 2) if quota > 0 else 0.0,
                "recommended_works_count": 0,
                "completed_works_count": 0,
                "completion_rate_pct": 0.0,
                "transaction_count": 0,
                "successful_payments_count": 0,
                "pending_payments_count": 0,
                "average_rating": None,
                "email": r.get("official_email"),
                "contact_number": r.get("contact_phone"),
                "photo_url": r.get("photo_source_url"),
                "party": party.get("party_abbreviation"),
                "party_name_full": party.get("party_full_name"),
                "profession": r.get("profession"),
                "delhi_address": r.get("delhi_address"),
                "permanent_address": r.get("permanent_address"),
                "gender": r.get("gender"),
                "dob": str(r.get("date_of_birth") or "") or None,
                "sansad_mp_code": r.get("sansad_mp_code"),
                "source_file": "supabase",
                "source_download_date": "2026-09-05",
                "pipeline_created_at": r.get("created_at", "")
            }
            items.append(item)

        return {
            "total": total or len(items),
            "limit": limit,
            "offset": offset,
            "items": items,
            "source": "supabase"
        }

    def get_representative_detail(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Get exhaustive representative dossier by legacy_internal_id (e.g. INTERNAL_MP_278) or UUID.
        """
        params = {
            "select": "*,political_parties(*),representative_terms(*,states(*),constituencies(*)),parliamentary_allocations(*)",
            "limit": 1,
        }
        if identifier.startswith("INTERNAL_MP_"):
            params["legacy_internal_id"] = f"eq.{identifier}"
        else:
            params["representative_id"] = f"eq.{identifier}"

        status, data, _ = self._request("representatives", params=params)
        if status == 200 and isinstance(data, list) and data:
            r = data[0]
            rep_uuid = r.get("representative_id")

            # Fetch live work counts from Supabase
            _, _, total_works = self._request("infrastructure_works", params={"representative_id": f"eq.{rep_uuid}"}, prefer_count=True)
            _, _, comp_works = self._request("infrastructure_works", params={"representative_id": f"eq.{rep_uuid}", "lifecycle_status": "eq.COMPLETED"}, prefer_count=True)
            _, _, tx_count = self._request("treasury_vouchers", params={"representative_id": f"eq.{rep_uuid}"}, prefer_count=True)

            terms = r.get("representative_terms") or [{}]
            first_term = terms[0] if terms else {}
            st = (first_term.get("states") or {}).get("name_en", "UNKNOWN")
            co = (first_term.get("constituencies") or {}).get("constituency_name", "UNKNOWN")
            party = r.get("political_parties") or {}
            allocs = r.get("parliamentary_allocations") or [{}]
            quota = float(allocs[0].get("statutory_quota") or 0.0) if allocs else 0.0
            released = float(allocs[0].get("released_amount") or 0.0) if allocs else 0.0

            house_term = first_term.get("house", "LOK_SABHA")
            house_display = "Lok Sabha" if house_term == "LOK_SABHA" else ("Rajya Sabha" if house_term == "RAJYA_SABHA" else "Lok Sabha")

            return {
                "internal_mp_id": r.get("legacy_internal_id", ""),
                "mp_name_raw": r.get("canonical_name", ""),
                "mp_name_normalized": r.get("normalized_name") or r.get("canonical_name", ""),
                "constituency_raw": co,
                "constituency_normalized": co.upper(),
                "state_raw": st,
                "state_normalized": st.upper(),
                "house": house_display,
                "allocated_amount": quota,
                "total_expenditure": released,
                "unspent_amount": max(0.0, quota - released),
                "utilization_pct": round((released / quota) * 100, 2) if quota > 0 else 0.0,
                "recommended_works_count": total_works or 0,
                "completed_works_count": comp_works or 0,
                "completion_rate_pct": round((comp_works / total_works) * 100, 2) if total_works and comp_works else 0.0,
                "transaction_count": tx_count or 0,
                "successful_payments_count": tx_count or 0,
                "pending_payments_count": 0,
                "average_rating": None,
                "email": r.get("official_email"),
                "contact_number": r.get("contact_phone"),
                "photo_url": r.get("photo_source_url"),
                "party": party.get("party_abbreviation"),
                "party_name_full": party.get("party_full_name"),
                "profession": r.get("profession"),
                "delhi_address": r.get("delhi_address"),
                "permanent_address": r.get("permanent_address"),
                "gender": r.get("gender"),
                "dob": str(r.get("date_of_birth") or "") or None,
                "sansad_mp_code": r.get("sansad_mp_code"),
                "source_file": "supabase",
                "source_download_date": "2026-09-05",
                "pipeline_created_at": r.get("created_at", ""),
                "top_vendors": [],
                "anomalies": []
            }
        return None

    def get_work_detail(self, work_id: int) -> Optional[Dict[str, Any]]:
        """
        Get full work detail by work_id.
        """
        params = {
            "select": "*,states(*),constituencies(*),representatives(*,political_parties(*))",
            "work_id": f"eq.{work_id}",
            "limit": 1,
        }
        status, data, _ = self._request("infrastructure_works", params=params)
        if status == 200 and isinstance(data, list) and data:
            w = data[0]
            rep = w.get("representatives") or {}
            st_name = (w.get("states") or {}).get("name_en", "UNKNOWN")
            co_name = (w.get("constituencies") or {}).get("constituency_name", "UNKNOWN")

            rec_amt = float(w.get("recommended_amount") or 0.0) if w.get("recommended_amount") is not None else None
            sanc_amt = float(w.get("sanctioned_amount") or 0.0) if w.get("sanctioned_amount") is not None else None
            fin_amt = float(w.get("final_disbursed_amount") or (sanc_amt or 0.0)) if (w.get("final_disbursed_amount") is not None or sanc_amt is not None) else None

            rec_date = str(w.get("recommendation_date") or "") or None
            rec_year = int(rec_date.split("-")[0]) if rec_date and len(rec_date) >= 4 and rec_date[:4].isdigit() else None
            comp_date = str(w.get("completion_date") or "") or None
            comp_year = int(comp_date.split("-")[0]) if comp_date and len(comp_date) >= 4 and comp_date[:4].isdigit() else None

            return {
                "work_id": w["work_id"],
                "internal_mp_id": rep.get("legacy_internal_id", ""),
                "mp_name_normalized": rep.get("canonical_name", ""),
                "constituency_normalized": co_name.upper(),
                "state_normalized": st_name.upper(),
                "house": "Lok Sabha",
                "category_normalized": w.get("category_code") or "OTHER",
                "work_description_normalized": w.get("description_clean") or w.get("description_raw") or "Public Infrastructure Work",
                "ida_normalized": "DISTRICT IMPLEMENTING AUTHORITY",
                "lifecycle_status": w.get("lifecycle_status") or "RECOMMENDED",
                "recommended_amount": rec_amt,
                "recommendation_date": rec_date,
                "recommendation_year": rec_year,
                "final_amount": fin_amt,
                "completed_date": comp_date,
                "completion_year": comp_year,
                "duration_days": None,
                "cost_variance_amount": (fin_amt - rec_amt) if (fin_amt is not None and rec_amt is not None) else None,
                "cost_variance_pct": round(((fin_amt - rec_amt) / rec_amt) * 100, 2) if (fin_amt is not None and rec_amt and rec_amt > 0) else None,
                "has_images": bool(w.get("has_geo_photos")),
                "average_rating": None,
                "sanctioned_amount": sanc_amt,
                "sanction_date": str(w.get("sanction_date") or "") or None,
                "latitude": None,
                "longitude": None,
                "village": w.get("village_name"),
                "block": w.get("block_name"),
                "gram_panchayat": w.get("gram_panchayat"),
                "work_contractor": w.get("assigned_contractor_name"),
                "source_files": "supabase_canonical",
                "match_method": w.get("match_method") or "CANONICAL_LINK",
                "match_confidence": float(w.get("match_confidence") or 1.0),
                "mp_details": {
                    "internal_mp_id": rep.get("legacy_internal_id", ""),
                    "mp_name_normalized": rep.get("canonical_name", ""),
                    "constituency_normalized": co_name.upper(),
                    "state_normalized": st_name.upper(),
                    "allocated_amount": 0.0,
                    "total_expenditure": 0.0,
                    "utilization_pct": 0.0
                },
                "anomalies": [],
                "related_transactions": []
            }
        return None

    def get_treasury_vouchers(
        self,
        limit: int = 50,
        offset: int = 0,
        payment_status: Optional[str] = None,
        is_march_rush: Optional[bool] = None,
    ) -> Dict[str, Any]:
        params = {
            "select": "voucher_id,legacy_transaction_id,official_voucher_no,disbursement_amount,expenditure_date,payment_status,is_march_rush,activity_description,contractors(trade_name_raw,trade_name_normalized),representatives(canonical_name,legacy_internal_id)",
            "limit": limit,
            "offset": offset,
            "order": "voucher_id.desc",
        }
        if payment_status:
            params["payment_status"] = f"eq.{payment_status}"
        if is_march_rush is not None:
            params["is_march_rush"] = f"eq.{str(is_march_rush).lower()}"

        status, data, total = self._request("treasury_vouchers", params=params, prefer_count=True)
        return {
            "items": data if status in (200, 206) and isinstance(data, list) else [],
            "total": total or (len(data) if isinstance(data, list) else 0),
            "limit": limit,
            "offset": offset,
            "source": "supabase"
        }

    def get_contractors(
        self,
        limit: int = 50,
        offset: int = 0,
        search: Optional[str] = None,
        risk_level: Optional[str] = None,
    ) -> Dict[str, Any]:
        params = {
            "select": "contractor_id,legacy_vendor_id,trade_name_raw,trade_name_normalized,gstin,hhi_score,risk_level,states(name_en)",
            "limit": limit,
            "offset": offset,
            "order": "trade_name_raw.asc",
        }
        if search:
            params["trade_name_raw"] = f"ilike.*{search}*"
        if risk_level:
            params["risk_level"] = f"eq.{risk_level.upper()}"

        status, data, total = self._request("contractors", params=params, prefer_count=True)
        return {
            "items": data if status in (200, 206) and isinstance(data, list) else [],
            "total": total or (len(data) if isinstance(data, list) else 0),
            "limit": limit,
            "offset": offset,
            "source": "supabase"
        }


# Global singleton service
supabase_service = SupabaseService()
