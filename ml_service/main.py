import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_manager import ModelEngine, FEATURE_COLS

DATASET_PATH = os.environ.get(
    "DATASET_PATH",
    os.path.join(os.path.dirname(__file__), "..", "VikasDrishti_AI_Agent_Context_v2", "cleaned_dataset.csv")
)

app = FastAPI(
    title="VikasDrishti ML Inference Service",
    description="XGBoost + SHAP Project Risk, Cost Overrun & Delay Prediction API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ModelEngine(data_path=os.path.abspath(DATASET_PATH))

@app.on_event("startup")
def startup_event():
    engine.load_and_train()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "models_trained": engine.is_trained,
        "dataset_rows": len(engine.df) if engine.df is not None else 0
    }

class ProjectPredictRequest(BaseModel):
    project_code: Optional[int] = None
    features: Optional[Dict[str, float]] = None

@app.post("/predict/project")
def predict_project(req: ProjectPredictRequest):
    if not engine.is_trained:
        raise HTTPException(status_code=503, detail="ML Models are still training or not ready")
        
    try:
        if req.project_code is not None:
            return engine.predict_project(req.project_code)
        elif req.features is not None:
            missing = [c for c in FEATURE_COLS if c not in req.features]
            if missing:
                raise HTTPException(status_code=400, detail=f"Missing feature vector values: {missing}")
            return engine.predict_features(req.features)
        else:
            raise HTTPException(status_code=400, detail="Must provide either project_code or features vector")
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/explain/project")
def explain_project(req: ProjectPredictRequest):
    return predict_project(req)

@app.get("/models")
def get_models():
    if not engine.is_trained:
        raise HTTPException(status_code=503, detail="Models not trained")
    return {
        "models": [
            engine.cost_metrics,
            engine.delay_metrics,
            engine.risk_metrics
        ],
        "feature_vector": FEATURE_COLS,
        "train_split": "GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42) by project_code",
        "horizon": "Next available snapshot reporting cycle"
    }

@app.get("/models/{version}/metrics")
def get_model_metrics(version: str):
    if not engine.is_trained:
        raise HTTPException(status_code=503, detail="Models not trained")
        
    for m in [engine.cost_metrics, engine.delay_metrics, engine.risk_metrics]:
        if m["version"].lower() == version.lower() or version.lower() in m["version"].lower():
            return m
            
    raise HTTPException(status_code=404, detail=f"Model version '{version}' not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
