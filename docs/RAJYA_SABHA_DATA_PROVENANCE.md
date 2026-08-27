# SIH26102 — Rajya Sabha Data Provenance & Source Registry

**Document Version:** 1.0  
**Registration Date:** 2026-08-26  
**Chamber Scope:** Council of States (Rajya Sabha)  
**Verification Level:** Cryptographic Hash (SHA-256) & Direct Public MoSPI Portal Ingestion  

---

## 1. Official Data Source Profile

- **Authoritative Entity:** Ministry of Statistics and Programme Implementation (MoSPI), Government of India
- **Platform:** eSAKSHI Web Solution for MPLADS
- **Portal URL:** `https://www.mplads.mospi.gov.in/`
- **Dashboard URL:** `https://www.mplads.mospi.gov.in/digigov/dashboard.html`
- **Access Protocol:** Authenticated Public PreLogin REST Endpoints
- **Download Date:** 2026-08-26

---

## 2. Ingested Artifacts & Cryptographic Checksums

| Artifact File | Description | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :---: | :--- |
| `data/raw/rajya_sabha/rajya_sabha_getTilesData.json` | Official Rajya Sabha macro tiles API response | 524 | `32b4fa82335fc0be0bc66fce3b8fe78df25f69f20e8d08599ba14c46fcf8ae22` |
| `data/raw/rajya_sabha/rajya_sabha_getTotalMPData.json` | Official active Rajya Sabha MP count response | 25 | `9a40186b568c7c2642a8b30e0a55255476a8d672eaeb4cfa88ddc969335e23aa` |
| `data/raw/rajya_sabha/rajya_sabha_getStateData.json` | Official 36 States/UTs reference dictionary | 1,532 | `8f367819bb2cc9b7eb92b8d0ceb440866870da37fdf31766a50689b2db9d2b27` |
| `data/raw/rajya_sabha/rajya_sabha_mps_all.json` | 235 Rajya Sabha MP directory | 38,468 | `cbdc15048fbb2811a2fef45070a78652d8805f63ca52f5581177651a511394c8` |
| `data/raw/rajya_sabha/all_rs_mp_metrics.json` | 235 Member-level financial & physical work tile records | 248,146 | `5ae560dea52c954bf9cf8da58bc59c9913ba041ca49e6fcf214457788b7dae01` |
| `data/raw/rajya_sabha/all_rs_state_metrics.json` | 36 State-level Rajya Sabha tile records | 35,247 | `84306dfed91af3d262ff4a974b7858ce1ee2ccb9ec1ec5fb6ae291079d300eb0` |

---

## 3. Disclosed Source Limitations

1. **Voucher-Level Transactions:** The public export does not expose individual physical payment vouchers linked to Rajya Sabha members. The platform preserves this boundary and reports 0 artificial vouchers.
2. **Work-Level Granular Attributes:** Project coordinates, geo-tags, gram panchayats, and contractors are not available in public exports and are stored as `NULL` (*"Not available in current source export"*).
3. **No Constituency Fabrication:** Rajya Sabha members represent States/UTs or are Nominated. The platform labels their territorial jurisdiction as `State Representation` / `Nominated` and never fabricates false Lok Sabha constituencies.
