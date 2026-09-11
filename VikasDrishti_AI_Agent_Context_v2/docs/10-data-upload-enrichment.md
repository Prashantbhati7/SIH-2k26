# DATA UPLOAD + ENRICHMENT

## Monthly PAIMANA/CUF upload

The current monitoring workflow is monthly.

UI:
**Upload Monthly Project Data**

Supported:
- CSV
- Excel

Flow:

Upload
→ Data Validation
→ Normalization
→ Feature Engineering
→ Prediction
→ Risk Scoring
→ Early Warnings
→ Dashboard Update

## Processing results

Show:
- records received
- valid records
- invalid records
- projects updated
- new risks detected
- warnings generated

## Validation errors

Show row:
- row number
- field
- error
- severity
- suggested correction

## Import behavior

Do not overwrite historical snapshots blindly.

If project_code + report_date already exists:
- mark duplicate/update according to explicit import policy;
- preserve audit trail.

## Daily enriched data

Field officer form:
- project
- date
- physical progress
- work completed
- milestone status
- issue type
- issue description
- evidence
- remarks

Contractor form:
- project
- task
- target
- achievement
- milestone
- issue
- evidence
- remarks

## Candidate future enriched variables

Store raw data that can later derive:
- progress velocity
- task completion rate
- issue frequency
- milestone behavior
- execution consistency

Do not silently add these to the current model.

## CUF vs Enriched story

CURRENT:
CUF/PAIMANA features → existing XGBoost models.

PILOT:
field + contractor data collection.

FUTURE:
CUF + enriched feature engineering → retraining → evaluation.

Do not show a fabricated future ROC-AUC/F1.

## UI label

"Pilot Enriched Data"

"Collected execution data is retained for future CUF + Enriched model validation."

## Future external integrations

PPT references:
- PFMS
- Satellite/Bhuvan
- OCMS history
- external enrichment

These should be represented as:
Planned Integration
unless the actual integration exists.
