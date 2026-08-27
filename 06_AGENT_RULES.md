# SIH26102 — Antigravity Agent Rules

## Mandatory workflow

Before writing the full application:

1. Inspect the repository.
2. Inspect every file under `data/raw/`.
3. Profile all datasets.
4. Identify candidate keys and relationships.
5. Produce a proposed merge strategy.
6. Implement ETL.
7. Generate the master dataset.
8. Run validation/reconciliation.
9. Report unmatched records and data-quality issues.
10. Only then proceed to backend/frontend implementation.

## Never
- modify raw files
- invent government values
- silently drop records
- silently duplicate records
- force low-confidence fuzzy matches
- assume columns without inspecting them
- replace NULL with zero without evidence
- claim an anomaly proves fraud/corruption
- hard-code statistics that should come from data

## If uncertain
Report:
- what is known
- what is missing
- what assumption would be needed
- why that assumption may be unsafe

Prefer transparent NULL/unmatched records.

## Coding
- modular scripts
- logging
- validation checks
- reproducible ETL
- configuration instead of unnecessary hard-coded paths
- README commands
- environment variables for secrets
- never commit secrets

## Data-phase completion
Do not declare the data phase complete until:
- all raw datasets are profiled
- relationships are documented
- master dataset exists
- reconciliation checks pass
- unmatched records are reported
- data-quality report exists
