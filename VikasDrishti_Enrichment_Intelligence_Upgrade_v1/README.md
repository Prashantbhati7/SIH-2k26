# VikasDrishti — Enrichment Intelligence Upgrade Pack

This is an implementation/change-request pack for the CURRENT VikasDrishti application.

## Goal

Add a new capability called:

**Project-Specific Enrichment Intelligence**

The current application already performs predictions using the existing CUF/PAIMANA feature set.

This upgrade must NOT replace the current prediction system.

Instead, it adds a layer that answers:

> "For this particular project, what additional information should we start collecting because it may improve future prediction of cost overrun, delay, or project risk?"

The system should then:
1. inspect the current project's model outputs and SHAP drivers,
2. identify information gaps,
3. recommend candidate enriched features,
4. explain why each feature is relevant to this project,
5. specify who should collect it and how often,
6. allow Field Officers / Contractors to start collecting those variables,
7. store the observations separately from current CUF features,
8. accumulate 3–4 months of enriched observations,
9. eventually evaluate CUF-only vs CUF+Enriched,
10. retrain only after sufficient data exists and validate properly.

## Critical rule

This is a **feature recommendation + data collection + future model improvement workflow**.

It is NOT permission to:
- modify the current XGBoost models immediately,
- claim that a suggested feature improves accuracy,
- fabricate CUF+Enriched metrics,
- silently feed new fields into the existing model,
- confuse correlation with causation.

## Current system must remain intact

Preserve:
- current dashboards
- RBAC
- project intelligence
- cost prediction
- delay prediction
- future risk prediction
- SHAP
- early warnings
- prescriptions
- interventions
- existing APIs
- existing database
- current model artifacts

Implement this as an additive module.

## Source priority

1. Existing repository/codebase
2. `source-final.ipynb`
3. Existing model artifacts and database schema
4. `docs/` in this pack
5. SIH product requirements

The notebook remains authoritative for current ML behavior.
