# ROLE + RBAC SPECIFICATION

## Role philosophy

The platform is not four copies of the same dashboard.

Each role sees a different layer of intelligence.

## Role 1 — MINISTER / POLICYMAKER

Mission:
**SEE & DECIDE**

Question:
**Where should I intervene?**

### Can view
- all authorized portfolio projects
- portfolio KPIs
- national/sector/ministry/state summaries
- risk map
- cost/delay/future-risk predictions
- SHAP summaries
- early warnings
- intervention priorities
- benchmarking
- what-if simulation
- reports
- portfolio AI assistant
- model intelligence

### Should not edit
- contractor task execution
- field verification
- ground evidence

## Role 2 — PROJECT MANAGER / MINISTRY

Mission:
**MONITOR & MANAGE**

Question:
**Which project needs action and what should I do?**

### Can
- view authorized ministry/project portfolio
- open full project intelligence
- inspect predictions
- inspect SHAP drivers
- acknowledge warnings
- create/assign/escalate interventions
- benchmark
- upload monthly data
- generate reports
- review field/contractor updates
- use authorized assistant

## Role 3 — FIELD OFFICER

Mission:
**VERIFY & TRACK**

Question:
**What is actually happening on the ground?**

### Can
- see assigned projects
- submit daily field update
- report issue
- attach evidence
- verify intervention
- update ground status
- add remarks

### Must not
- see unrelated portfolio projects
- see national policy intelligence
- manage contractor records outside assigned workflow

## Role 4 — CONTRACTOR / IMPLEMENTER

Mission:
**ACT & EXECUTE**

Question:
**What do I need to execute?**

### Can
- see assigned projects
- see assigned tasks
- update tasks
- update milestones
- update monthly target achievement
- report issues
- submit execution evidence
- update progress

### Must not
- see other contractors' projects
- see national risk portfolio
- see unrelated ministry data

Predictive contractor warning:
**Coming Soon**.

## Backend authorization

Never rely on React route hiding.

Every protected endpoint must check:
- authenticated user
- role
- project ownership/assignment
- ministry/agency scope

## Assistant authorization

The AI assistant must apply the same data scope as the user.

Policymaker:
portfolio scope.

Manager:
authorized ministry/project scope.

Field:
assigned projects only.

Contractor:
assigned projects only.

## UI permissions

Use role-aware navigation.

Do not merely hide data visually while API endpoints remain accessible.

## Audit

Log:
- login
- prediction generation
- warning acknowledgement
- intervention assignment
- escalation
- field update
- evidence submission
- contractor update
- data upload
- report generation
- assistant query
