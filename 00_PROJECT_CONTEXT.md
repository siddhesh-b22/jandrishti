# SIH26102 — Project Context

## Project
Build an SIH 2026 solution around MPLADS (Members of Parliament Local Area Development Scheme) data.

## Current objective
Create a reliable data pipeline and web platform that:
1. Ingests publicly obtained MPLADS datasets.
2. Preserves raw source files unchanged.
3. Cleans and normalizes data.
4. Produces a traceable `mplads_master_dataset.csv`.
5. Generates analytical/anomaly-detection features.
6. Exposes processed data through a backend API.
7. Provides a web dashboard for exploration, analytics, and risk/anomaly review.

## Current known raw files
The project currently has:
- `mplads_mp_summary_2026-08-26.csv`
- `mplads_expenditures_2026-08-26.csv`
- `mplads_recommended_works_2026-08-26.csv`
- `mplads_completed_works_2026-08-26.csv`
- an allocated-limit dataset downloaded from the MPLADS dashboard
- `json_2026-08-26.json`

Inspect actual columns before using them. Do not assume columns from filenames.

## Official-source context
The current MPLADS dashboard exposes aggregate and MP/allocation-level information. A stable public work-level API has not been established for this project.

Do not make the website dependent on undocumented internal MPLADS APIs. Use downloaded/publicly obtained data as source inputs and build our own processing pipeline/API.

## Data integrity
- Never overwrite `data/raw/`.
- Never fabricate missing government data.
- Never turn recommended amount into sanctioned amount.
- Never invent sanction dates, coordinates, agencies, or statuses.
- Never force low-confidence joins.
- Preserve provenance where practical.
