"""
JanDrishti — Authoritative Public Government Data Source Registry
Maintains comprehensive technical and governance metadata for Tier 1 to Tier 4 official endpoints.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DataSourceDefinition(BaseModel):
    source_id: str
    source_name: str
    official_organization: str
    tier: str  # 'TIER_1_API', 'TIER_2_DASHBOARD', 'TIER_3_DOWNLOAD', 'TIER_4_REPORT'
    base_url: str
    endpoint: str
    http_method: str  # 'GET', 'POST'
    authentication_required: bool
    public_access: bool
    data_format: str  # 'JSON', 'CSV', 'XML', 'JPEG', 'PDF'
    supported_filters: List[str]
    pagination: bool
    entity_coverage: str
    refresh_frequency: str
    last_checked: str
    verification_status: str  # Actual result of the latest endpoint-level check.
    reliability_level: str  # 'OFFICIAL_PRIMARY', 'OFFICIAL_SECONDARY', 'STATUTORY_BENCHMARK'
    terms_or_usage_notes: str


OFFICIAL_SOURCE_REGISTRY: List[DataSourceDefinition] = [
    DataSourceDefinition(
        source_id="SRC_MOSPI_TILES",
        source_name="e-SAKSHI Chamber Macro Tiles API",
        official_organization="Ministry of Statistics & Programme Implementation (MoSPI)",
        tier="TIER_1_API",
        base_url="https://www.mplads.mospi.gov.in",
        endpoint="/rest/PreLoginDashboardData/getTilesData",
        http_method="POST",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["uname (0,0,0,1 for RS; 0,0,0,2 for LS; 0,0,0,0 for All)", "stateId", "districtId", "mpId"],
        pagination=False,
        entity_coverage="National Macro Allocations, Expenditures, Works Recommended/Sanctioned/Completed",
        refresh_frequency="Daily (Automated Treasury Sync)",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="VERIFIED_LIVE",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="Official e-SAKSHI portal pre-login endpoint. Legitimate public transparency data. Respect server limits (Max 1 req/sec)."
    ),
    DataSourceDefinition(
        source_id="SRC_MOSPI_MP_DATA",
        source_name="e-SAKSHI Total Member Directory API",
        official_organization="Ministry of Statistics & Programme Implementation (MoSPI)",
        tier="TIER_1_API",
        base_url="https://www.mplads.mospi.gov.in",
        endpoint="/rest/PreLoginDashboardData/getTotalMPData",
        http_method="POST",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["uname (0,0,0,1 for RS; 0,0,0,2 for LS; 0,0,0,0 for All)"],
        pagination=False,
        entity_coverage="Aggregate active-MP total for the requested chamber; not a member directory",
        refresh_frequency="Weekly",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="VERIFIED_LIVE",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="Public aggregate counter. It does not return member identities or internal e-SAKSHI IDs. Respect server limits (one request per second)."
    ),
    DataSourceDefinition(
        source_id="SRC_MOSPI_STATES",
        source_name="e-SAKSHI State & UT Reference Master API",
        official_organization="Ministry of Statistics & Programme Implementation (MoSPI)",
        tier="TIER_1_API",
        base_url="https://www.mplads.mospi.gov.in",
        endpoint="/rest/PreLoginDashboardData/getStateData",
        http_method="POST",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["None"],
        pagination=False,
        entity_coverage="36 States and Union Territories",
        refresh_frequency="Monthly",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="VERIFIED_LIVE",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="Public state-ID reference response. LGD code equivalence has not been independently verified. Respect server limits (one request per second)."
    ),
    DataSourceDefinition(
        source_id="SRC_MOSPI_TILES_REPORT",
        source_name="e-SAKSHI Macro Progress Report API",
        official_organization="Ministry of Statistics & Programme Implementation (MoSPI)",
        tier="TIER_1_API",
        base_url="https://www.mplads.mospi.gov.in",
        endpoint="/rest/PreLoginDashboardData/getTilesReportData",
        http_method="POST",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["uname", "stateId", "districtId"],
        pagination=False,
        entity_coverage="Physical and financial milestone reconciliation metrics",
        refresh_frequency="Daily",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="EMPTY_RESPONSE_NOT_INTEGRATABLE",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="Endpoint returned HTTP 200 with an empty JSON object for the audited national payload. Do not ingest until a non-empty documented contract is verified."
    ),
    DataSourceDefinition(
        source_id="SRC_DIGITAL_SANSAD_LS",
        source_name="Digital Sansad Lok Sabha Directory",
        official_organization="Lok Sabha Secretariat / Parliament of India",
        tier="TIER_1_API",
        base_url="https://sansad.in",
        endpoint="/api/v1/ls/members",
        http_method="GET",
        authentication_required=False,
        public_access=False,
        data_format="JSON",
        supported_filters=["term", "state", "party"],
        pagination=True,
        entity_coverage="543 Lok Sabha Members (18th Lok Sabha)",
        refresh_frequency="Monthly",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="UNAVAILABLE_HTTP_404",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="The Digital Sansad homepage is public, but this recorded API path returned HTTP 404 during the audit. Do not integrate it."
    ),
    DataSourceDefinition(
        source_id="SRC_SANSAD_PORTRAITS",
        source_name="Parliament of India Official Portrait Repository",
        official_organization="Lok Sabha & Rajya Sabha Secretariats",
        tier="TIER_2_DASHBOARD",
        base_url="https://sansad.in",
        endpoint="/uploads/ls/mp_photos/{id}.jpg",
        http_method="GET",
        authentication_required=False,
        public_access=False,
        data_format="JPEG",
        supported_filters=["mp_id"],
        pagination=False,
        entity_coverage="Legislative member portrait photographs",
        refresh_frequency="Quarterly",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="UNAVAILABLE_HTTP_404",
        reliability_level="OFFICIAL_SECONDARY",
        terms_or_usage_notes="The recorded representative portrait path returned HTTP 404 during the audit. Discover a current published asset path before use."
    ),
    DataSourceDefinition(
        source_id="SRC_DATA_GOV_IN",
        source_name="Open Government Data (OGD) Platform India",
        official_organization="National Informatics Centre (NIC) / MeitY",
        tier="TIER_1_API",
        base_url="https://api.data.gov.in",
        endpoint="/resource/{resource_id}",
        http_method="GET",
        authentication_required=True,
        public_access=True,
        data_format="JSON",
        supported_filters=["api-key", "format", "limit", "offset", "filters"],
        pagination=True,
        entity_coverage="National development schemes, constituency profiles, and census baselines",
        refresh_frequency="Quarterly",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="REQUIRES_RESOURCE_ID_AND_API_KEY",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="A resource ID and registered API key are required. A placeholder resource request returned HTTP 403; no resource is approved for ingestion."
    ),
    DataSourceDefinition(
        source_id="SRC_LGD_DIRECTORY",
        source_name="Local Government Directory (LGD) Master Codebook",
        official_organization="Ministry of Panchayati Raj",
        tier="TIER_2_DASHBOARD",
        base_url="https://lgdirectory.gov.in",
        endpoint="/services/getAllStatesWithDistricts",
        http_method="GET",
        authentication_required=False,
        public_access=False,
        data_format="JSON",
        supported_filters=["stateCode"],
        pagination=False,
        entity_coverage="All 760+ administrative districts and parliamentary cross-mappings",
        refresh_frequency="Biannual",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="ENDPOINT_UNAVAILABLE_DNS",
        reliability_level="OFFICIAL_PRIMARY",
        terms_or_usage_notes="The LGD public site is accessible at lgdirectory.gov.in, but the recorded lgd.gov.in service hostname did not resolve. Do not integrate this path."
    ),
    DataSourceDefinition(
        source_id="SRC_CAG_REPORTS",
        source_name="CAG Performance Audit Publications on MPLADS",
        official_organization="Comptroller & Auditor General of India",
        tier="TIER_4_REPORT",
        base_url="https://cag.gov.in",
        endpoint="/en/audit-reports",
        http_method="GET",
        authentication_required=False,
        public_access=False,
        data_format="PDF",
        supported_filters=["category=Union", "ministry=MoSPI"],
        pagination=True,
        entity_coverage="Statutory audit findings on unspent balances, idle funds, and execution delays",
        refresh_frequency="Annual",
        last_checked="2026-09-02T17:30:00Z",
        verification_status="UNAVAILABLE_HTTP_404",
        reliability_level="STATUTORY_BENCHMARK",
        terms_or_usage_notes="The CAG homepage is public, but this recorded route returned HTTP 404 during the audit. Discover a current publication route before use."
    ),
    DataSourceDefinition(
        source_id="SRC_EMPOWERED_INDIAN_SYNC",
        source_name="EmpoweredIndian Open MPLADS Intelligence Mirror",
        official_organization="EmpoweredIndian Civic Technology Platform",
        tier="TIER_1_API",
        base_url="https://api.empoweredindian.in",
        endpoint="/api/summary/mps",
        http_method="GET",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["page", "limit", "search", "sortBy", "order", "house", "state", "constituency"],
        pagination=True,
        entity_coverage="774 Parliamentary MPs with utilization rates, pending works, and payment gaps",
        refresh_frequency="Daily",
        last_checked="2026-09-03T09:35:00Z",
        verification_status="VERIFIED_LIVE",
        reliability_level="OFFICIAL_SECONDARY",
        terms_or_usage_notes="Verified civic open API mirror of official MoSPI e-SAKSHI data. Fully public under open data terms."
    ),
    DataSourceDefinition(
        source_id="SRC_EMPOWERED_INDIAN_METADATA",
        source_name="EmpoweredIndian Telemetry Sync & Overview Metadata API",
        official_organization="EmpoweredIndian Civic Technology Platform",
        tier="TIER_1_API",
        base_url="https://api.empoweredindian.in",
        endpoint="/api/metadata/sync-info",
        http_method="GET",
        authentication_required=False,
        public_access=True,
        data_format="JSON",
        supported_filters=["None"],
        pagination=False,
        entity_coverage="589,000+ national sync records and macro expenditure telemetry",
        refresh_frequency="Daily",
        last_checked="2026-09-03T09:35:00Z",
        verification_status="VERIFIED_LIVE",
        reliability_level="OFFICIAL_SECONDARY",
        terms_or_usage_notes="Live telemetry sync counters and macro allocation aggregates."
    ),
]



class SourceRegistryService:
    """Service to discover, query, and monitor authoritative data sources."""

    def __init__(self):
        self.sources = {s.source_id: s for s in OFFICIAL_SOURCE_REGISTRY}

    def list_sources(
        self,
        tier: Optional[str] = None,
        reliability: Optional[str] = None
    ) -> List[DataSourceDefinition]:
        results = list(self.sources.values())
        if tier:
            results = [s for s in results if s.tier.upper() == tier.upper().strip()]
        if reliability:
            results = [s for s in results if s.reliability_level.upper() == reliability.upper().strip()]
        return results

    def get_source(self, source_id: str) -> Optional[DataSourceDefinition]:
        return self.sources.get(source_id)

    def get_source_health_summary(self) -> Dict[str, Any]:
        return {
            "total_registered_sources": len(self.sources),
            "tier_1_apis": len([s for s in self.sources.values() if s.tier == "TIER_1_API"]),
            "tier_2_dashboards": len([s for s in self.sources.values() if s.tier == "TIER_2_DASHBOARD"]),
            "tier_3_downloads": len([s for s in self.sources.values() if s.tier == "TIER_3_DOWNLOAD"]),
            "tier_4_reports": len([s for s in self.sources.values() if s.tier == "TIER_4_REPORT"]),
            "official_primary_count": len([s for s in self.sources.values() if s.reliability_level == "OFFICIAL_PRIMARY"]),
            "public_access_rate_pct": round(
                100.0 * len([s for s in self.sources.values() if s.public_access]) / len(self.sources), 1
            ) if self.sources else 0.0,
            "provenance_standard": "SOURCE DATA > ASSUMPTION"
        }


source_registry_service = SourceRegistryService()
