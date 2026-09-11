# SOURCE GROUNDING

## Uploaded SIH source

`source-sih-ppt.pdf` is the team's SIH presentation.

Important source concepts:
- VikasDrishti
- PREDICT → EXPLAIN → WARN → PRESCRIBE
- unified intelligence network
- four user roles
- early warnings
- SHAP explainability
- RAG/AI assistant
- CUF vs enriched data
- geospatial risk map
- intervention/what-if/dependency concepts
- PAIMANA integration
- future PFMS/satellite/OCMS enrichment

The PPT's technical approach describes a pipeline covering ingestion/data engineering, PostgreSQL/feature engineering, statistical/predictive models, SHAP/explainability, early warnings, prescriptive recommendation, RAG assistant and geospatial risk.

## References listed in the PPT

PAIMANA report/data:
https://paimana-proj.mospi.gov.in/ReportPage

PAIMANA official portal:
https://paimana-proj.mospi.gov.in

Parliament Q&A:
https://sansad.in/ls/questions/questions-and-answers

PIB / official PAIMANA information:
https://informatics.nic.in/files/websites/october-2025/paimana-portal.php

PM Gati Shakti:
https://www.digitalindia.gov.in/initiative/gati-shakti/

PRAGATI:
https://www.pmindia.gov.in/en/news_updates/pragati/

CAG:
https://cag.gov.in

## Grounding rule

Do not claim that a listed source is currently integrated merely because it appears in the PPT references.

Distinguish:
- source/reference
- current data input
- planned integration.

## Notebook

`source-final.ipynb` is the authority for the actual current ML implementation.

The current notebook demonstrates:
- dataset loading
- 13-feature vector
- next-snapshot target creation
- cost XGBoost
- delay XGBoost
- future-risk XGBoost
- project-level GroupShuffleSplit
- SHAP explanations
- feature-based prescriptions
- latest-snapshot project prediction.

## Source discrepancy handling

The PPT presents some proposed numbers/claims at presentation level, while the notebook contains actual model evaluation outputs.

For implementation:
- use notebook values for model metrics;
- use database-derived values for current data counts;
- do not hardcode PPT statistics when the imported dataset provides actual values.
