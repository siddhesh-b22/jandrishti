# SIH26102 — Analytics and Anomaly Detection

## Purpose
Identify unusual patterns for human review.

A high anomaly score is NOT proof of corruption or wrongdoing.

Use:
- anomaly
- risk indicator
- unusual pattern
- requires review

## Features

### Cost
Where genuinely available:
- expenditure / recommended amount
- absolute difference
- percentage difference

### Time
Where dates are available:
- recommendation-to-completion duration
- unusual completion duration compared with comparable works
- payment timing patterns

### Vendor / agency
Where available:
- number of works
- total expenditure
- average work amount
- concentration by MP/constituency/category

### Text similarity
Use work names/descriptions to identify:
- near duplicates
- highly similar projects
- repeated descriptions

### MP analytics
Use genuine MP summary values for:
- allocation
- recommendations
- expenditure
- completion counts
- utilization indicators

Do not attach MP totals to individual works.

## Initial methods
Start with interpretable methods:
- statistical thresholds
- robust z-scores
- Isolation Forest
- Local Outlier Factor
- clustering
- TF-IDF/embeddings for text similarity

Do not claim model accuracy without labeled ground truth.

## Explainability
Every anomaly should have machine-generated reasons based on real fields.

Example:

```text
risk_score: 0.82
risk_level: HIGH

reasons:
- Expenditure is 1.85x recommended amount.
- Completion duration is unusually high.
- Work description is highly similar to another record.
```
