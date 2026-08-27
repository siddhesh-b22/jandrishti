# SIH26102 — Master Dataset Specification

## Purpose
`data/processed/mplads_master_dataset.csv` is the canonical analytical dataset generated from the raw sources.

Raw files remain unchanged.

## Rules
1. One logical work/entity per row where work identity is supported.
2. Do not repeat MP-level totals as if they were work-level values.
3. Do not force unrelated one-to-many tables into one flat table if that causes duplication.
4. Preserve unmatched records.
5. Preserve source provenance.

## Recommended metadata
- `record_id`
- `work_id`
- `source_files`
- `match_method`
- `match_confidence`
- `etl_run_date`

## Important validation
Check:
- duplicate work IDs
- malformed dates
- impossible amounts
- accidental multiplication of totals after joins
- reconciliation of totals before/after joins
- null rates
- unmatched records

## Preferred normalized model

```text
MP / Constituency
   ├── Works
   ├── Expenditure transactions
   ├── MP summary
   └── Allocation
```

If one master CSV causes serious duplication, create normalized tables and a carefully defined analytical view instead of corrupting the data.
