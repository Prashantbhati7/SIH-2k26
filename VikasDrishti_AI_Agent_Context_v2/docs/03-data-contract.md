# DATA CONTRACT

## Human-readable project data

Retain both human-readable categories and model encodings.

### Core identifiers
- project_code
- project_id
- project_name
- legacy_ocms_code
- pmgid

### Organizational
- agency
- ministry
- sector
- state

### Dates
- date_of_approval
- start_date
- original_completion_date
- revised_completion_date
- actual_completion_date
- report_date
- report_month

### Financial
- original_cost
- revised_cost
- cumulative_expenditure
- expenditure_percent_original
- cost_overrun
- cost_overrun_percent

### Progress/schedule
- physical_progress
- progress_change
- expenditure_change
- planned_duration_months
- raw_project_age_months
- project_age_months
- remaining_planned_duration
- planned_duration
- project_age
- delay_months
- schedule_revision

### Status/data quality
- status
- not_started_flag
- genuine_overdue_flag
- missing_date_flag
- source_date_error_flag
- date_order_inconsistency_flag

### Encodings
- ministry_encoded
- sector_encoded
- state_encoded

### Targets/research fields
- target_cost_overrun_final
- target_delay_final
- target_future_cost_revision
- target_future_schedule_revision
- target_future_risk
- risk_score
- risk_class
- target_cost
- target_delay
- target_future_cost
- target_future_delay

Do not expose future target columns as current operational facts.

## Database entities

### User
id
name
email
password_hash
role_id
ministry_id
agency_id
active
created_at

### Role
id
code
display_name

### Ministry
id
name

### Project
id
project_code
project_id
project_name
ministry_id
sector
state
agency
status
latitude
longitude
source
created_at

### ProjectSnapshot
id
project_id
report_date
all current model features
relevant progress/financial/schedule values
created_at

### RiskPrediction
id
project_id
snapshot_id
model_version
cost_prediction
cost_probabilities_json
delay_prediction
delay_probabilities_json
risk_probability
risk_level
created_at

### RiskDriver
id
prediction_id
model_type
feature
feature_value
shap_value
absolute_shap_value
rank
direction
explanation

### EarlyWarning
id
project_id
prediction_id
category
severity
title
message
basis
status
detected_at

### Intervention
id
project_id
warning_id
driver
recommendation
priority
assigned_role
assigned_user_id
deadline
status
remarks
created_at
updated_at

### FieldUpdate
id
project_id
field_officer_id
update_date
physical_progress
milestone_status
issue_type
issue_description
evidence_url
remarks
verification_status

### ContractorTask
id
project_id
contractor_id
task
target
completed
deadline
status
remarks

### MonthlyTarget
id
project_id
contractor_id
month
target
achieved

### Milestone
id
project_id
name
planned_date
actual_date
status

### DataUpload
id
uploaded_by
filename
rows_received
rows_valid
rows_invalid
projects_updated
risks_detected
status
created_at

### DataValidationError
id
upload_id
row_number
field
error_type
message

### ModelVersion
id
name
type
version
metrics_json
feature_list_json
created_at

### AuditLog
id
user_id
action
entity
entity_id
metadata_json
created_at

## Data validation

Check:
- missing project code
- duplicate project_code + report_date
- invalid dates
- negative costs
- negative progress
- progress > 100
- invalid category values
- date-order inconsistencies
- invalid encodings
- missing model features

## Geospatial

Use coordinates only when actually available.

If not available:
- map at state level;
- never fabricate exact coordinates.

## Data freshness

Display:
- latest PAIMANA snapshot date
- latest prediction timestamp
- latest field update
- model version

Do not call monthly PAIMANA data "real-time".
