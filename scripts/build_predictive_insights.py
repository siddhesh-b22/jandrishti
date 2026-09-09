"""Train leakage-safe delay and cost-overrun prioritization models."""

import json
import os
import sqlite3
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEATURES = os.path.join(BASE_DIR, "data", "features")
OUTPUT = os.path.join(FEATURES, "predictive_insights.csv")
MODEL_VERSION = "predictive-insights-v1"
NUMERIC = ["recommended_amount", "mp_payment_count", "mp_payment_total", "mp_vendor_count"]
CATEGORICAL = ["category_normalized", "state_normalized", "house"]


def make_preprocessor():
    return ColumnTransformer([
        ("numeric", SimpleImputer(strategy="median"), NUMERIC),
        ("categorical", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]), CATEGORICAL),
    ])


def main():
    frame = pd.read_csv(os.path.join(FEATURES, "ai_work_features.csv"), low_memory=False)
    frame["recommendation_date"] = pd.to_datetime(frame["recommendation_date"], errors="coerce")
    frame["duration_days"] = pd.to_numeric(frame["duration_days"], errors="coerce")
    frame["cost_overrun_pct"] = pd.to_numeric(frame["cost_overrun_pct"], errors="coerce")
    completed = frame[
        frame["recommendation_date"].notna()
        & frame["duration_days"].notna()
        & frame["cost_overrun_pct"].notna()
        & (frame["duration_days"] > 0)
    ].sort_values("recommendation_date")
    result = {
        "model_version": MODEL_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "feature_snapshot_version": str(frame["feature_snapshot_version"].iloc[0]),
        "target_leakage_controls": [
            "Final amount, completion date, duration, and lifecycle status are excluded from predictors.",
            "Evaluation uses chronological holdout data rather than random splitting.",
        ],
        "limitations": [
            "Predictions prioritize monitoring; they do not establish fraud or statutory non-compliance.",
            "Snapshot-backed source data limits generalization until live detailed feeds are available.",
        ],
    }
    if len(completed) < 100:
        result.update({"status": "INSUFFICIENT_HISTORY", "training_rows": len(completed)})
        pd.DataFrame().to_csv(OUTPUT, index=False)
        with open(os.path.join(FEATURES, "predictive_model_report.json"), "w", encoding="utf-8") as handle:
            json.dump(result, handle, indent=2)
        db_path = os.path.join(BASE_DIR, "database", "mplads.db")
        if os.path.isfile(db_path):
            conn = sqlite3.connect(db_path)
            conn.execute(
                """CREATE TABLE IF NOT EXISTS ai_model_runs (
                    model_run_id TEXT PRIMARY KEY, model_name TEXT NOT NULL,
                    model_version TEXT NOT NULL, feature_snapshot_version TEXT NOT NULL,
                    training_status TEXT NOT NULL, metrics_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL
                )"""
            )
            conn.execute(
                """INSERT OR REPLACE INTO ai_model_runs
                (model_run_id, model_name, model_version, feature_snapshot_version,
                 training_status, metrics_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    "PREDICTIVE_" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"),
                    "Delay and cost-overrun predictors", MODEL_VERSION,
                    result["feature_snapshot_version"], result["status"],
                    json.dumps({key: result[key] for key in ("delay_roc_auc", "cost_mae_pct_points", "training_rows", "evaluation_rows")}),
                    result["created_at"],
                ),
            )
            conn.commit()
            conn.close()
        print(json.dumps(result, indent=2))
        return

    split = max(1, int(len(completed) * 0.8))
    train, test = completed.iloc[:split], completed.iloc[split:]
    x_train, x_test = train[NUMERIC + CATEGORICAL], test[NUMERIC + CATEGORICAL]
    delay_train = (train["duration_days"] > train["duration_days"].quantile(0.75)).astype(int)
    delay_test = (test["duration_days"] > train["duration_days"].quantile(0.75)).astype(int)
    delay_model = Pipeline([
        ("features", make_preprocessor()),
        ("model", RandomForestClassifier(n_estimators=120, random_state=42, class_weight="balanced", min_samples_leaf=5)),
    ])
    delay_model.fit(x_train, delay_train)
    delay_probability = delay_model.predict_proba(x_test)[:, 1]
    auc = roc_auc_score(delay_test, delay_probability) if delay_test.nunique() > 1 else None

    cost_model = Pipeline([
        ("features", make_preprocessor()),
        ("model", RandomForestRegressor(n_estimators=120, random_state=42, min_samples_leaf=5, n_jobs=-1)),
    ])
    cost_model.fit(x_train, train["cost_overrun_pct"])
    cost_prediction = cost_model.predict(x_test)
    tree_matrix = np.array([tree.predict(cost_model.named_steps["features"].transform(x_test)) for tree in cost_model.named_steps["model"].estimators_])
    uncertainty = tree_matrix.std(axis=0)

    predictions = test[["work_id", "internal_mp_id"]].copy()
    predictions["delay_probability"] = np.round(delay_probability, 4)
    predictions["predicted_cost_overrun_pct"] = np.round(cost_prediction, 2)
    predictions["cost_overrun_uncertainty"] = np.round(uncertainty, 2)
    predictions["model_version"] = MODEL_VERSION
    predictions.to_csv(OUTPUT, index=False)
    result.update({
        "status": "TRAINED",
        "training_rows": len(train),
        "evaluation_rows": len(test),
        "delay_roc_auc": round(float(auc), 4) if auc is not None else None,
        "cost_mae_pct_points": round(float(mean_absolute_error(test["cost_overrun_pct"], cost_prediction)), 4),
        "prediction_count": len(predictions),
    })
    with open(os.path.join(FEATURES, "predictive_model_report.json"), "w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
