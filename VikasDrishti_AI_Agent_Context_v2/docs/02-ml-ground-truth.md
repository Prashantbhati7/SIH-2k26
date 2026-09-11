# ML GROUND TRUTH — DO NOT DEVIATE

## Authority

This document is a normalized implementation specification extracted from `source-final.ipynb`.

If any number or behavior here differs from the notebook, inspect the notebook and follow it.

## Dataset

Notebook reads:

`cleaned_dataset.csv`

Notebook reports:

**18,363 rows × 61 columns**

Do not hardcode this count in the application. Query actual imported database counts.

## Current model feature vector

Exactly 13 features:

```text
original_cost
revised_cost
cumulative_expenditure
physical_progress
expenditure_percent_original
project_age_months
remaining_planned_duration
planned_duration
not_started_flag
genuine_overdue_flag
ministry_encoded
sector_encoded
state_encoded
```

Every current model must use this same feature vector.

## Future target creation

The notebook sorts:

`project_code`, `report_date`

Then:

```python
df.groupby("project_code")["cost_overrun_percent"].shift(-1)
df.groupby("project_code")["delay_months"].shift(-1)
```

Therefore the target is the next available snapshot for the same project.

Rows without a next snapshot are excluded after target creation/dropna.

## Cost model

Target:
`future_cost_bucket`

Rules:

- x <= 0 → `No overrun`
- 0 < x <= 10 → `Minor (0-10%)`
- 10 < x <= 40 → `Moderate (10-40%)`
- x > 40 → `Major (>40%)`

Model:
`XGBClassifier`

Parameters:
- n_estimators=400
- max_depth=5
- learning_rate=0.05
- subsample=0.8
- colsample_bytree=0.8
- objective=`multi:softprob`
- eval_metric=`mlogloss`
- random_state=42
- n_jobs=-1

Notebook evaluation:
- rows: 5,931
- projects: 1,709
- baseline accuracy: 0.7456
- XGBoost accuracy: 0.8474
- macro F1: 0.6391

Class metrics:
- Major: P .79 / R .82 / F1 .80
- Minor: P .55 / R .17 / F1 .25
- Moderate: P .64 / R .52 / F1 .58
- No overrun: P .88 / R .97 / F1 .93

Important limitation:
Minor class recall is weak.

## Delay model

Target:
`future_delay_bucket`

Rules:
- x <= 3 → `Low (<=3 mo)`
- 3 < x <= 15 → `Moderate (3-15 mo)`
- 15 < x <= 40 → `High (15-40 mo)`
- x > 40 → `Severe (>40 mo)`

Model:
`XGBClassifier`

Parameters:
- n_estimators=400
- max_depth=5
- learning_rate=0.05
- subsample=0.8
- colsample_bytree=0.8
- objective=`multi:softprob`
- eval_metric=`mlogloss`
- random_state=42
- n_jobs=-1

Notebook evaluation:
- rows: 4,815
- projects: 1,436
- baseline accuracy: 0.2884
- XGBoost accuracy: 0.7906
- macro F1: 0.793

Class metrics:
- High: P .77 / R .82 / F1 .79
- Low: P .77 / R .76 / F1 .77
- Moderate: P .74 / R .71 / F1 .72
- Severe: P .90 / R .88 / F1 .89

## Future-risk model

Target:
`target_future_risk`

Binary:
- 0 = Low Risk
- 1 = High Risk

Model:
`XGBClassifier`

Parameters:
- n_estimators=400
- max_depth=5
- learning_rate=0.05
- subsample=0.8
- colsample_bytree=0.8
- objective=`binary:logistic`
- eval_metric=`logloss`
- random_state=42
- n_jobs=-1

Notebook evaluation:
- rows: 5,987
- projects: 1,718
- baseline accuracy: 0.6984
- XGBoost accuracy: 0.7401
- macro F1: 0.6777

Class metrics:
- Low Risk: P .80 / R .84 / F1 .82
- High Risk: P .58 / R .50 / F1 .54

Important limitation:
High-risk recall is 0.50. This is a screening model, not certainty.

## Train/test split

All three models use:

`GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)`

Groups:
`project_code`

Explain this in the UI:
Project-level grouping reduces leakage from repeated monthly observations of the same project.

## Risk-level mapping

The notebook uses:

```text
p < 0.33       Low
0.33 <= p < .66 Medium
p >= .66       High
```

Risk percentage:
`risk_probability * 100`

Do not invent another threshold system.

## Probability language

The risk model outputs a probability.

Use:
**Future Risk Probability: 82%**

Do not call this:
**82% confidence**

unless probability calibration has separately been demonstrated.

For cost/delay:
show the full class probability distribution from `predict_proba`.

## SHAP

The notebook uses:

`shap.TreeExplainer(model)`

and returns top 5 features by absolute SHAP magnitude.

For each driver store/display:
- feature
- feature value
- SHAP value
- absolute SHAP
- rank
- direction
- human explanation
- prescription

Positive SHAP:
`increasing risk`

Negative SHAP:
`reducing risk`

## Explanation text

```text
original_cost:
The original project cost is influencing the prediction.

revised_cost:
The revised project cost is influencing the prediction.

cumulative_expenditure:
Cumulative expenditure is influencing the prediction.

physical_progress:
Current physical progress is influencing the prediction.

expenditure_percent_original:
Expenditure relative to the original budget is influencing the prediction.

project_age_months:
The age of the project is influencing the prediction.

remaining_planned_duration:
The remaining planned project duration is influencing the prediction.

planned_duration:
The overall planned project duration is influencing the prediction.

not_started_flag:
Project start/progress status is influencing the prediction.

genuine_overdue_flag:
The project's overdue status is strongly influencing the prediction.

ministry_encoded:
The ministry/administrative category is influencing the prediction.

sector_encoded:
The project sector is influencing the prediction.

state_encoded:
The project state/location category is influencing the prediction.
```

## Prescription mapping

```text
original_cost:
Review the original cost estimate and validate the remaining budget requirement.

revised_cost:
Investigate cost revisions and identify the activities responsible for escalation.

cumulative_expenditure:
Review expenditure against completed work and investigate unusually high spending.

physical_progress:
Prioritize incomplete critical activities and introduce a short-term recovery plan.

expenditure_percent_original:
Compare expenditure with physical progress and investigate expenditure-progress mismatch.

project_age_months:
Review long-running activities and identify unresolved execution bottlenecks.

remaining_planned_duration:
Prepare a recovery schedule and prioritize activities with limited remaining time.

planned_duration:
Review the project schedule and reassess whether the planned duration remains realistic.

not_started_flag:
Immediately identify activities that have not started and remove their execution bottlenecks.

genuine_overdue_flag:
Create an overdue recovery plan and monitor critical activities more frequently.

ministry_encoded:
Review administrative dependencies and escalate unresolved approvals or coordination issues.

sector_encoded:
Review sector-specific execution risks and strengthen project monitoring.

state_encoded:
Review location-specific execution constraints and coordinate with the relevant authorities.
```

## Project prediction behavior

The notebook's `predict_project_by_code()`:

1. finds rows for project_code;
2. sorts by report_date;
3. selects the latest available row;
4. sends that row to all three models;
5. returns cost, delay and risk outputs plus explanations/prescriptions.

The web API must preserve this behavior.

## Notebook-to-web rule

Do not replace:
- XGBoost with arbitrary scoring
- SHAP with generic "AI explanation"
- next-snapshot targets with 30-day targets
- actual feature list with imagined external variables.

The web layer should make the notebook usable, not rewrite its science.
