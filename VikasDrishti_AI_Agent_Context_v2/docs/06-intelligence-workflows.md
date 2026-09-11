# INTELLIGENCE WORKFLOWS

## Workflow A — Project intelligence

Latest project snapshot
→ build 13-feature vector
→ cost XGBoost
→ delay XGBoost
→ risk XGBoost
→ store prediction
→ SHAP
→ top 5 drivers
→ explanations
→ prescriptions

## Workflow B — Early warning

Prediction + project indicators
→ evaluate warning rules
→ create warning only when meaningful
→ attach model basis
→ attach supporting driver
→ attach recommended action
→ assign severity

Warnings must not be generic notifications.

## Workflow C — Prescriptive action

Top SHAP driver
→ feature explanation
→ prescription mapping
→ role selection
→ priority
→ intervention

Example:

Driver:
physical_progress

Explanation:
Current physical progress is influencing the prediction.

Recommendation:
Prioritize incomplete critical activities and introduce a short-term recovery plan.

Responsible:
Project Manager

## Workflow D — Intervention

Warning
→ acknowledge
→ assign
→ in progress
→ verification required
→ resolved

Manager can escalate.

Field officer can verify ground status.

Contractor can execute/update assigned task.

## Workflow E — Field feedback

Field officer:
- chooses assigned project
- submits date
- updates physical progress
- records issue
- attaches evidence
- submits verification

This updates:
- project activity feed
- field update table
- intervention state where relevant

It does NOT automatically become a current model feature.

It is stored as enriched data.

## Workflow F — Contractor execution

Contractor:
- opens assigned project
- opens task
- updates achievement
- updates milestone
- submits issue/evidence

Manager can review.

## Workflow G — AI assistant

User query
→ authenticate user
→ determine data scope
→ retrieve projects/snapshots/predictions/warnings
→ construct answer
→ optionally call local LLM
→ cite/link project records
→ never expose unauthorized records.

## Workflow H — Benchmark

Current project
→ identify eligible peers
→ calculate metrics
→ compare
→ generate a factual insight only if sample size is sufficient.

Example:
"Project is above the sector median on predicted risk."

Avoid overconfident causal claims.

## Workflow I — What-if

This is conceptual, not notebook ML.

Input:
budget intervention
schedule intervention
priority

Output:
scenario-only estimate.

Label:
"Scenario Simulation — not validated ML forecast."

## Workflow J — Dependency

Use predefined project dependencies where available.

Do not imply ML causality.

Label:
"Dependency Analysis."

## Workflow K — Anomaly

Rule-based anomaly examples:
- expenditure change without proportional physical-progress change
- unusual progress change
- repeated revisions

Wording:
"Anomaly detected — verification required."

Never:
"Fraud detected."

## Workflow L — Model improvement

Current:
CUF/PAIMANA model

Pilot:
daily field + contractor data

Future:
CUF + Enriched feature dataset

Then:
train/evaluate future model

Only publish performance after actual validation.
