# MODEL INTELLIGENCE LAB + AI TRANSPARENCY

## Purpose

A technically credible SIH prototype should expose how the model works and where it is limited.

## Model cards

### Cost Overrun Model

XGBoost multiclass.

Feature count:
13

Training:
5,931 rows
1,709 projects

Baseline accuracy:
74.56%

XGBoost accuracy:
84.74%

Macro F1:
63.91%

Major:
F1 80%

Minor:
F1 25%

Moderate:
F1 58%

No overrun:
F1 93%

### Delay Model

XGBoost multiclass.

Training:
4,815 rows
1,436 projects

Baseline:
28.84%

XGBoost:
79.06%

Macro F1:
79.30%

Severe:
F1 89%

### Future Risk Model

XGBoost binary.

Training:
5,987 rows
1,718 projects

Baseline:
69.84%

XGBoost:
74.01%

Macro F1:
67.77%

High Risk:
F1 54%

## Methodology card

GroupShuffleSplit:
- test size 25%
- random state 42
- grouped by project_code

Explain why:
monthly observations of the same project are correlated; project-level grouping reduces leakage.

## Explainability card

SHAP TreeExplainer.

Show:
- top 5 drivers
- SHAP value
- direction
- feature value
- explanation
- recommendation

## Limitations

Make visible:
- next-snapshot target, not fixed-horizon forecast;
- class imbalance;
- weak Minor cost-overrun recall;
- High Risk recall of 0.50;
- external data not currently integrated;
- current enriched data is pilot/future.

## Probability vs confidence

Risk probability:
model output.

Confidence:
do not use as a synonym unless calibrated.

## Model versioning

Examples:
- CUF-XGB-COST-v1
- CUF-XGB-DELAY-v1
- CUF-XGB-RISK-v1

Every prediction records model version.

## CUF vs Enriched

Current:
implemented/evaluated CUF model.

Future:
CUF + Enriched model.

Only publish new metrics after actual retraining/evaluation.
