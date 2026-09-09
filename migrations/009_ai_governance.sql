CREATE TABLE IF NOT EXISTS ai_model_runs (
    model_run_id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    feature_snapshot_version TEXT NOT NULL,
    training_status TEXT NOT NULL,
    metrics_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_review_labels (
    label_id TEXT PRIMARY KEY,
    anomaly_id TEXT NOT NULL,
    label TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewer_role TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
);
