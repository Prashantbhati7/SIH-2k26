# VIKASDRISHTI — MASTER AGENT INSTRUCTIONS

## Read this first

You are building **VikasDrishti**, the SIH 2026 prototype of Team Nirvana for problem statement **SIH26103 — Use case on web-based integrated project-monitoring platform**, theme **Smart Automation**.

Before writing code, read:

1. `source-final.ipynb`
2. `source-sih-ppt.pdf`
3. `docs/01-product-vision.md`
4. `docs/02-ml-ground-truth.md`
5. `docs/03-data-contract.md`
6. `docs/04-role-rbac.md`
7. `docs/05-screen-requirements.md`
8. `docs/06-intelligence-workflows.md`
9. `docs/07-api-architecture.md`
10. `docs/08-database-schema.md`
11. `docs/09-ai-assistant.md`
12. `docs/10-data-upload-enrichment.md`
13. `docs/11-model-lab-and-transparency.md`
14. `docs/12-demo-script.md`
15. `docs/13-ui-design-system.md`
16. `docs/14-acceptance-tests.md`

## Source priority

When sources conflict:

1. `source-final.ipynb` is authoritative for current ML/data behavior.
2. The SIH PPT is authoritative for product vision, role ecosystem and proposed future capabilities.
3. The instruction files translate those sources into implementation requirements.
4. Never silently invent a capability unsupported by the sources.

If a product requirement and current notebook capability differ, implement the product workflow around the current capability and label the unsupported part as future/planned.

## Mission

Do not build a generic project-management dashboard.

Build an **infrastructure project intelligence system** whose central experience is:

**PREDICT → EXPLAIN → WARN → PRESCRIBE → ACT → VERIFY → LEARN**

The prototype must demonstrate that VikasDrishti transforms monitoring data into decision support.

## Mandatory end-to-end loop

A project snapshot must be able to flow through:

PAIMANA/CUF snapshot
→ validation
→ current feature vector
→ XGBoost cost prediction
→ XGBoost delay prediction
→ XGBoost future-risk prediction
→ probability outputs
→ SHAP explanation
→ top risk drivers
→ deterministic prescriptions
→ early warning
→ intervention
→ manager assignment
→ field/contractor feedback
→ timeline/activity update
→ enriched-data storage

## Critical ML honesty rule

The notebook's targets use the **next available snapshot for the same project** via `groupby("project_code").shift(-1)`.

Therefore current predictions must be described as:

- Next-Snapshot Prediction
- Forward-looking Project Risk
- Forecast for Next Available Reporting Cycle

Do NOT describe them as a validated 15-day or 30-day prediction.

The PPT discusses 15–30 day early warning as the intended innovation, but the current notebook does not establish a fixed 15/30-day target. Treat fixed-horizon forecasting as future work unless separately implemented and validated.

## Never fake

Do not claim:
- live PAIMANA API integration unless actually implemented
- live PFMS integration
- live satellite/Bhuvan verification
- production government deployment
- 30-day prediction
- fraud detection
- calibrated confidence
- validated CUF+Enriched model performance
- real-time PAIMANA updates
- real external government data ingestion

Use labels:
- Prototype
- Demo Data
- Next-Snapshot Forecast
- Planned Integration
- Pilot
- Simulated Scenario

## Architecture rule

Recommended:

React
→ Node.js/Express
→ PostgreSQL
→ Python FastAPI ML service
→ XGBoost + SHAP

Optional:
Node
→ retrieval layer
→ local Ollama LLM

Do not rewrite the notebook models into arbitrary JavaScript formulas if the actual model artifacts can be served through Python.

## If model artifacts are unavailable

Do not invent model outputs.

Use one of these approaches:
1. load actual model artifacts if present;
2. expose a Python service that trains from the provided dataset at development/startup time;
3. use stored prediction results generated from the notebook;
4. if none is possible, clearly mark prediction as unavailable.

A deterministic fallback is acceptable for non-ML UI behavior, but it must not masquerade as a trained model prediction.

## Build priority

### P0 — absolutely required
- authentication
- RBAC
- PostgreSQL/Prisma
- actual dataset ingestion if available
- three ML models
- project intelligence API
- Project Digital Profile
- SHAP explanation
- early warning
- prescription
- intervention workflow
- four role dashboards
- field/contractor update flow

### P1 — highly important
- benchmarking
- risk map
- AI assistant
- monthly upload
- model intelligence lab
- report generation
- audit trail

### P2 — conceptual/future
- what-if simulation
- dependency graph
- advanced anomaly engine
- PFMS integration
- satellite/Bhuvan integration
- CUF+Enriched retraining
- contractor predictive warning

## Core implementation principle

Do not build disconnected screens.

When an action occurs, update the relevant state/data and make the change visible elsewhere.

Example:
warning created
→ warning appears in manager dashboard
→ manager assigns intervention
→ assigned user sees intervention
→ field officer submits update
→ contractor updates task
→ project activity timeline changes
→ dashboard metrics can reflect latest status

## Coding quality

Use:
- TypeScript
- modular components
- service layer
- validation
- centralized errors
- typed API contracts
- environment variables
- Prisma migrations
- tests for critical workflows

Avoid:
- giant App.tsx
- duplicated dashboard code
- hardcoded KPIs
- fake buttons
- localStorage as the primary database
- frontend-only authorization
- arbitrary random AI outputs

## Final quality bar

The product should make a judge understand within minutes:

1. who uses it;
2. what data it consumes;
3. what the models predict;
4. why a prediction was made;
5. what warning is generated;
6. what action is recommended;
7. who owns the action;
8. how field/contractor feedback closes the loop;
9. how enriched data can support future improvement.
