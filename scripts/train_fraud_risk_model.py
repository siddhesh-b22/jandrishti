"""Train a supervised fraud-risk prioritizer only when reviewed labels are sufficient."""

import json
import os
import sqlite3
from datetime import datetime, timezone

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(BASE, "database", "mplads.db")
FEATURES = os.path.join(BASE, "data", "features", "ai_work_features.csv")
REPORT = os.path.join(BASE, "data", "features", "fraud_model_report.json")
MIN_LABELS = 30
MIN_PER_CLASS = 10


def main():
    conn = sqlite3.connect(DB)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS ai_review_labels (
            label_id TEXT PRIMARY KEY, anomaly_id TEXT NOT NULL, label TEXT NOT NULL,
            reviewer_id TEXT NOT NULL, reviewer_role TEXT NOT NULL, notes TEXT,
            created_at TEXT NOT NULL
        )"""
    )
    conn.commit()
    labels = pd.read_sql_query(
        """SELECT anomaly_id, label FROM ai_review_labels
        WHERE label IN ('CONFIRMED_RISK', 'NO_ISSUE')""", conn
    )
    anomalies = pd.read_sql_query(
        "SELECT anomaly_id, entity_id FROM anomalies WHERE entity_type = 'WORK'", conn
    )
    conn.close()
    report = {
        "model_version": "fraud-risk-v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "BLOCKED_INSUFFICIENT_LABELS",
        "minimum_labels": MIN_LABELS,
        "minimum_labels_per_class": MIN_PER_CLASS,
        "reviewed_label_count": int(len(labels)),
        "limitations": ["Fraud labels require qualified human review and do not represent automatic legal findings."],
    }
    counts = labels["label"].value_counts()
    if len(labels) < MIN_LABELS or any(counts.get(label, 0) < MIN_PER_CLASS for label in ("CONFIRMED_RISK", "NO_ISSUE")):
        with open(REPORT, "w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)
        print(json.dumps(report, indent=2))
        return

    frame = pd.read_csv(FEATURES, low_memory=False).merge(anomalies, left_on="work_id", right_on="entity_id")
    frame = frame.merge(labels, on="anomaly_id")
    frame["target"] = (frame["label"] == "CONFIRMED_RISK").astype(int)
    numeric = ["recommended_amount", "duration_days", "mp_payment_total", "mp_vendor_count", "cost_overrun_pct"]
    categorical = ["category_normalized", "state_normalized"]
    transformer = ColumnTransformer([
        ("numeric", SimpleImputer(strategy="median"), numeric),
        ("categorical", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encoder", OneHotEncoder(handle_unknown="ignore"))]), categorical),
    ])
    model = Pipeline([("features", transformer), ("classifier", RandomForestClassifier(n_estimators=150, class_weight="balanced", random_state=42, min_samples_leaf=3))])
    split = max(1, int(len(frame) * 0.8))
    model.fit(frame.iloc[:split][numeric + categorical], frame.iloc[:split]["target"])
    predictions = model.predict(frame.iloc[split:][numeric + categorical])
    actual = frame.iloc[split:]["target"]
    report.update({
        "status": "TRAINED",
        "training_rows": int(split),
        "evaluation_rows": int(len(actual)),
        "precision": float(precision_score(actual, predictions, zero_division=0)),
        "recall": float(recall_score(actual, predictions, zero_division=0)),
        "f1": float(f1_score(actual, predictions, zero_division=0)),
    })
    with open(REPORT, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
