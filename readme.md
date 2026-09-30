# VikasDrishti — Infrastructure Project Intelligence Platform (SIH 2026)

**Team Nirvana** • **Problem Statement:** SIH26103 — Web-Based Integrated Project-Monitoring Platform • **Theme:** Smart Automation

---

## 🚀 Overview

**VikasDrishti** transforms raw monthly project-monitoring snapshots into decision support using the continuous operational loop:

$$\text{PREDICT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{WARN} \longrightarrow \text{PRESCRIBE} \longrightarrow \text{ACT} \longrightarrow \text{VERIFY} \longrightarrow \text{LEARN}$$

### Key Capabilities
1. **Core ML Inference**: 3 XGBoost models (`Cost Overrun`, `Future Delay`, `Future Risk`) trained with GroupShuffleSplit grouping on 1,709+ projects from the PAIMANA/OCMS dataset.
2. **SHAP TreeExplainer & Prescriptions**: Top 5 feature impact drivers with plain-language explanations and automated deterministic prescriptions.
3. **Role-Based Workflows (4 Roles)**:
   - 🏛️ **Minister / Policymaker**: National portfolio risk overview, macro sector benchmark, India Risk Map.
   - 👔 **Project Manager**: Project digital profiles, early warning center, intervention assignment, what-if simulator.
   - 📋 **Field Officer**: Ground inspection feed, physical progress verification, evidence upload.
   - 👷 **Contractor / Implementer**: Task execution, monthly targets vs achievement, delay filings.
4. **🏢 Contractor Portfolio Management & Pre-Award Safety Evaluation (NEW FEATURE)**:
   - **Vendor Dossier & History**: Track contractor registration, financial capacity, active concurrency load vs bandwidth limits, and past completed projects.
   - **Historical Metrics**: Track historical cost overrun rates, average delays, on-time delivery rates, and quality audit grades.
   - **Pre-Award Safety & Suitability Assessor**: Multi-factor decision engine assessing whether it is safe to award a specific project package to a contractor based on domain match, scale fit, capacity headroom, past delay tendencies, and cost discipline.
   - **Risk Mitigation Prescriptions**: Generates concrete safeguards (e.g., enhanced bank guarantee, bi-weekly milestone audits, escrow account requirements).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React-Leaflet
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite
- **ML Service**: Python 3, FastAPI, XGBoost, SHAP, Scikit-learn, Pandas, NumPy

---

## 🏃 Quick Start Guide

### 1. Python ML Service
```bash
cd ml_service
pip install -r requirements.txt
python3 main.py
# Running on http://localhost:8000 (Swagger docs at /docs)
```

### 2. Backend Server & Database
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
npm start
# Running on http://localhost:5001 (Health check at /health)
```

### 3. Frontend Web Client
```bash
cd client
npm install
npm run dev
# Running on http://localhost:3000
```

### 4. Run Acceptance Tests
```bash
python3 tests/run_acceptance_tests.py
```

---

## 🔑 Demo Role Credentials

| Role | Email | Password |
|---|---|---|
| Minister / Policymaker | `minister@vikasdrishti.gov.in` | `password123` |
| Project Manager | `manager@vikasdrishti.gov.in` | `password123` |
| Field Officer | `field@vikasdrishti.gov.in` | `password123` |
| Contractor / Implementer | `contractor@vikasdrishti.gov.in` | `password123` |
