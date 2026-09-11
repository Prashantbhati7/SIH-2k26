# DATABASE IMPLEMENTATION DETAILS

Use PostgreSQL + Prisma.

## Relations

Role
1 → many Users

Ministry
1 → many Projects

Project
1 → many ProjectSnapshots
1 → many RiskPredictions
1 → many EarlyWarnings
1 → many Interventions
1 → many FieldUpdates
1 → many ContractorTasks
1 → many MonthlyTargets
1 → many Milestones

RiskPrediction
1 → many RiskDrivers
1 → many EarlyWarnings

Warning
1 → many Interventions

Upload
1 → many ValidationErrors

ModelVersion
1 → many RiskPredictions

## Important indexes

Projects:
- project_code unique
- ministry_id
- sector
- state
- status

Snapshots:
- project_id + report_date
- report_date

Predictions:
- project_id + snapshot_id + model_version

Warnings:
- project_id + status
- severity
- detected_at

Interventions:
- assigned_user_id
- status
- deadline

Field updates:
- project_id + update_date

Contractor tasks:
- contractor_id
- project_id
- status

## Data import

If `cleaned_dataset.csv` exists:
- import it;
- preserve human-readable fields;
- preserve encoded model features;
- map each unique project_code to a Project;
- create ProjectSnapshot rows from report_date.

Do not create one Project row per monthly snapshot.

## Latest snapshot query

For project_code:
ORDER BY report_date DESC
LIMIT 1

This mirrors notebook `predict_project_by_code`.

## Prediction persistence

Predictions must be tied to:
- project
- exact snapshot
- model version

This makes predictions auditable.

## Model metadata

Store:
- model name
- model type
- version
- feature list
- metrics
- training rows
- project count
- methodology
- limitations

## Audit

All state-changing actions create AuditLog records.

## Demo data

Prefer actual notebook dataset.

If synthetic records are needed:
- label source as DEMO/SYNTHETIC;
- do not mix labels invisibly;
- make the data realistic enough for charts;
- preserve the same model schema.
