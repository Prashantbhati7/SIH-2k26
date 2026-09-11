# API + SERVICE ARCHITECTURE

## Stack

Frontend:
React + TypeScript + Vite

UI:
Tailwind + shadcn/ui + Lucide

Charts:
Recharts

Map:
Leaflet + OpenStreetMap

Backend:
Node.js + Express + TypeScript

DB:
PostgreSQL + Prisma

ML:
Python FastAPI + XGBoost + SHAP

Optional LLM:
Ollama

## API groups

### Auth
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout

### Dashboard
GET /api/dashboard/policymaker
GET /api/dashboard/manager
GET /api/dashboard/field
GET /api/dashboard/contractor

### Projects
GET /api/projects
GET /api/projects/:projectCode
GET /api/projects/:projectCode/history
GET /api/projects/:projectCode/intelligence
GET /api/projects/:projectCode/benchmarks

### Predictions
GET /api/projects/:projectCode/prediction
POST /api/predictions/run

### Explanations
GET /api/projects/:projectCode/explanation

### Warnings
GET /api/warnings
GET /api/warnings/:id
PATCH /api/warnings/:id

### Interventions
GET /api/interventions
POST /api/interventions
PATCH /api/interventions/:id

### Field
GET /api/field/projects
POST /api/field/updates
GET /api/field/updates/:id
POST /api/field/evidence

### Contractor
GET /api/contractor/projects
GET /api/contractor/tasks
PATCH /api/contractor/tasks/:id
POST /api/contractor/progress

### Data
POST /api/data/upload
GET /api/data/uploads/:id
GET /api/data/uploads/:id/validation

### Benchmark
GET /api/benchmark/:projectCode

### Assistant
POST /api/assistant/query

### Reports
POST /api/reports/:projectCode

### Simulation
POST /api/simulation

### Model
GET /api/models
GET /api/models/:modelVersion
GET /api/models/:modelVersion/metrics

## ML service endpoints

POST /predict/project
POST /explain/project
GET /models
GET /models/:id/metrics
GET /health

## Service interfaces

PredictionEngine:
- predictCost
- predictDelay
- predictRisk
- explainCost
- explainDelay
- explainRisk

WarningEngine:
- evaluateProject
- createWarnings

PrescriptionEngine:
- prescriptionsFromDrivers

BenchmarkEngine:
- findPeers
- aggregateBenchmarks

## Project intelligence response

```json
{
  "projectCode": "…",
  "latestReportDate": "…",
  "cost": {
    "prediction": "Major (>40%)",
    "probabilities": {},
    "drivers": [],
    "prescriptions": []
  },
  "delay": {
    "prediction": "Severe (>40 mo)",
    "probabilities": {},
    "drivers": [],
    "prescriptions": []
  },
  "risk": {
    "probability": 0.82,
    "level": "High",
    "drivers": [],
    "prescriptions": []
  }
}
```

## API behavior

If prediction already exists for latest snapshot:
return stored prediction.

If absent:
generate it.

Store model version.

If ML service is unavailable:
return last stored prediction if available.
Otherwise return an explicit unavailable state.

Never silently replace missing model output with random numbers.

## Backend RBAC

Middleware must verify:
- identity
- role
- project scope
- ministry/agency scope
- assignment

## Error model

Use structured errors:
- 400 validation
- 401 unauthenticated
- 403 unauthorized
- 404 not found
- 409 conflict
- 500 internal

## API documentation

Generate OpenAPI/Swagger if practical.
