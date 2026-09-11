# SCREEN-BY-SCREEN REQUIREMENTS

## 1. Landing

Hero:
**VikasDrishti**
**From Monitoring Projects to Predicting What Happens Next.**

Show four stages:
PREDICT
EXPLAIN
WARN
PRESCRIBE

Show four roles:
Minister → Decide
Project Manager → Manage
Field Officer → Verify
Contractor → Execute

Primary CTA:
Enter Intelligence Platform

## 2. Login

Professional government/enterprise login.

Demo accounts:
- minister@vikasdrishti.gov.in
- manager@vikasdrishti.gov.in
- field@vikasdrishti.gov.in
- contractor@vikasdrishti.gov.in

Use one demo password documented in README.

## 3. Policymaker dashboard

Header:
National Infrastructure Intelligence

KPIs:
- Total Projects
- Active Projects
- High Future-Risk Projects
- Major Cost-Risk Projects
- Severe Delay-Risk Projects
- Open Interventions

Charts:
- risk distribution
- cost forecast distribution
- delay forecast distribution
- risk by ministry
- risk by sector
- risk by state
- intervention priorities

Main panel:
Top Intervention Priorities.

Each item:
project
risk
primary driver
recommended action
priority

## 4. Manager dashboard

KPIs:
- Projects Under Management
- High Risk
- Cost Warnings
- Delay Warnings
- Pending Interventions
- Delayed Milestones

Charts:
- risk trend
- planned vs physical progress
- financial vs physical progress
- project risk by sector/agency

Tables:
- active warnings
- interventions
- projects requiring action

## 5. Field dashboard

Mobile-friendly.

KPIs:
- Assigned Projects
- Pending Verifications
- Today's Updates
- Open Issues
- Due Tasks

Map/list:
assigned projects only.

Primary CTA:
Submit Field Update.

## 6. Contractor dashboard

KPIs:
- Assigned Projects
- Active Tasks
- Completed Tasks
- Overdue Tasks
- Monthly Target
- Achievement %

Show:
- task progress
- milestones
- target vs achieved
- issues

Predictive warnings:
Coming Soon.

## 7. Project Digital Profile

This is the core screen.

Header:
- project name
- project code
- ministry
- sector
- state
- agency
- latest report
- status

Current status:
- original cost
- revised cost
- cumulative expenditure
- physical progress
- current delay
- project age
- planned duration
- remaining planned duration

Forecast cards:

### Cost
Predicted class.
All class probabilities.

### Delay
Predicted class.
All class probabilities.

### Future Risk
Probability.
Low/Medium/High.

Explain:
"Risk probability is derived from the future-risk XGBoost model."

Then:
Top 5 SHAP drivers.

Then:
Early warnings.

Then:
AI recommendations.

Then:
Interventions.

Then:
Historical charts.

Then:
Benchmark.

Then:
timeline/activity.

## 8. Explainability panel

Title:
**Why is this project at risk?**

For each top driver:
- rank
- feature name
- human-readable value
- SHAP impact
- increasing/reducing
- explanation
- linked recommendation

Provide a compact SHAP bar visualization.

## 9. Early Warning Center

Each warning:
- severity
- category
- project
- prediction
- probability
- driver
- explanation
- recommended action
- status

Statuses:
DETECTED
ACKNOWLEDGED
ACTION ASSIGNED
IN PROGRESS
VERIFICATION REQUIRED
RESOLVED
ESCALATED

## 10. Intervention Center

Columns:
Project
Risk
Driver
Recommendation
Assigned To
Priority
Due
Status

Actions:
Assign
Escalate
Update
Resolve

## 11. Benchmarking

Compare current project with:
- sector average
- ministry average
- state average if meaningful
- similar projects

Metrics:
- cost growth
- physical progress
- financial progress
- delay
- risk probability

Do not fabricate a benchmark when insufficient data exists.

## 12. Risk Map

India map.

Markers:
- Low
- Medium
- High

Filters:
state
ministry
sector
risk
status

Click marker:
project summary + link.

## 13. Data Upload

Workflow:
Upload
→ Validate
→ Normalize
→ Feature Engineering
→ Prediction
→ Warning
→ Dashboard Update

Show:
- records received
- valid
- invalid
- projects updated
- risks detected

## 14. Model Intelligence Lab

Show:
- 3 models
- exact features
- training methodology
- metrics
- class performance
- limitations
- model version

## 15. CUF vs Enriched

Show:

CURRENT:
CUF/PAIMANA model
Status: Implemented

FUTURE:
CUF + field/contractor enriched data
Status: Pilot / data collection

Do not invent CUF+Enriched performance.

## 16. AI Assistant

Chat panel with:
- natural-language query
- project links
- risk explanation
- recommendations

## 17. Reports

Project Intelligence Report:
- overview
- current status
- financial
- schedule
- progress
- cost forecast
- delay forecast
- future risk
- SHAP
- warnings
- recommendations
- benchmarking
- interventions
- history

## 18. Audit

Show:
user
action
entity
timestamp
metadata

## 19. Methodology/Sources

Separate:
Currently used
from
Planned/future.

Include source references supplied by the SIH PPT.
