import os
import warnings
import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sklearn.dummy import DummyClassifier
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

FEATURE_COLS = [
    "original_cost",
    "revised_cost",
    "cumulative_expenditure",
    "physical_progress",
    "expenditure_percent_original",
    "project_age_months",
    "remaining_planned_duration",
    "planned_duration",
    "not_started_flag",
    "genuine_overdue_flag",
    "ministry_encoded",
    "sector_encoded",
    "state_encoded"
]

FEATURE_REASON_TEXT = {
    "original_cost": "The original project cost is influencing the prediction.",
    "revised_cost": "The revised project cost is influencing the prediction.",
    "cumulative_expenditure": "Cumulative expenditure is influencing the prediction.",
    "physical_progress": "Current physical progress is influencing the prediction.",
    "expenditure_percent_original": "Expenditure relative to the original budget is influencing the prediction.",
    "project_age_months": "The age of the project is influencing the prediction.",
    "remaining_planned_duration": "The remaining planned project duration is influencing the prediction.",
    "planned_duration": "The overall planned project duration is influencing the prediction.",
    "not_started_flag": "Project start/progress status is influencing the prediction.",
    "genuine_overdue_flag": "The project's overdue status is strongly influencing the prediction.",
    "ministry_encoded": "The ministry/administrative category is influencing the prediction.",
    "sector_encoded": "The project sector is influencing the prediction.",
    "state_encoded": "The project state/location category is influencing the prediction."
}

PRESCRIPTIONS = {
    "original_cost": "Review the original cost estimate and validate the remaining budget requirement.",
    "revised_cost": "Investigate cost revisions and identify the activities responsible for escalation.",
    "cumulative_expenditure": "Review expenditure against completed work and investigate unusually high spending.",
    "physical_progress": "Prioritize incomplete critical activities and introduce a short-term recovery plan.",
    "expenditure_percent_original": "Compare expenditure with physical progress and investigate expenditure-progress mismatch.",
    "project_age_months": "Review long-running activities and identify unresolved execution bottlenecks.",
    "remaining_planned_duration": "Prepare a recovery schedule and prioritize activities with limited remaining time.",
    "planned_duration": "Review the project schedule and reassess whether the planned duration remains realistic.",
    "not_started_flag": "Immediately identify activities that have not started and remove their execution bottlenecks.",
    "genuine_overdue_flag": "Create an overdue recovery plan and monitor critical activities more frequently.",
    "ministry_encoded": "Review administrative dependencies and escalate unresolved approvals or coordination issues.",
    "sector_encoded": "Review sector-specific execution risks and strengthen project monitoring.",
    "state_encoded": "Review location-specific execution constraints and coordinate with the relevant authorities."
}

def bucket_cost_overrun(x):
    if pd.isna(x):
        return np.nan
    elif x <= 0:
        return "No overrun"
    elif x <= 10:
        return "Minor (0-10%)"
    elif x <= 40:
        return "Moderate (10-40%)"
    else:
        return "Major (>40%)"

def bucket_delay(x):
    if pd.isna(x):
        return np.nan
    elif x <= 3:
        return "Low (<=3 mo)"
    elif x <= 15:
        return "Moderate (3-15 mo)"
    elif x <= 40:
        return "High (15-40 mo)"
    else:
        return "Severe (>40 mo)"

class ModelEngine:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.df = None
        self.cost_model = None
        self.cost_encoder = None
        self.cost_metrics = {}
        
        self.delay_model = None
        self.delay_encoder = None
        self.delay_metrics = {}
        
        self.risk_model = None
        self.risk_metrics = {}
        
        self.is_trained = False

    def load_and_train(self):
        print(f"Loading dataset from: {self.data_path}")
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")
        
        df = pd.read_csv(self.data_path)
        df = df.sort_values(["project_code", "report_date"]).copy()
        
        # Shift -1 targets for future prediction
        df["future_cost_overrun_percent"] = df.groupby("project_code")["cost_overrun_percent"].shift(-1)
        df["future_delay_months"] = df.groupby("project_code")["delay_months"].shift(-1)
        
        df["future_cost_bucket"] = df["future_cost_overrun_percent"].apply(bucket_cost_overrun)
        df["future_delay_bucket"] = df["future_delay_months"].apply(bucket_delay)
        
        self.df = df
        
        # 1. Train Cost Model
        self._train_cost_model()
        # 2. Train Delay Model
        self._train_delay_model()
        # 3. Train Future Risk Model
        self._train_risk_model()
        
        self.is_trained = True
        print("All VikasDrishti XGBoost models trained successfully.")

    def _train_cost_model(self):
        target = "future_cost_bucket"
        data = self.df[FEATURE_COLS + ["project_code", target]].dropna()
        X = data[FEATURE_COLS]
        y_raw = data[target]
        
        encoder = LabelEncoder()
        y = encoder.fit_transform(y_raw)
        
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
        train_idx, test_idx = next(splitter.split(X, y, groups=data["project_code"]))
        
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        baseline = DummyClassifier(strategy="most_frequent")
        baseline.fit(X_train, y_train)
        baseline_acc = accuracy_score(y_test, baseline.predict(X_test))
        
        model = XGBClassifier(
            n_estimators=400,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="multi:softprob",
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, pred)
        macro_f1 = f1_score(y_test, pred, average="macro")
        report = classification_report(y_test, pred, target_names=encoder.classes_, output_dict=True)
        
        self.cost_model = model
        self.cost_encoder = encoder
        self.cost_metrics = {
            "version": "CUF-XGB-COST-v1",
            "name": "Cost Overrun Model",
            "type": "XGBClassifier Multiclass (multi:softprob)",
            "rows": len(data),
            "projects": int(data["project_code"].nunique()),
            "baseline_accuracy": round(float(baseline_acc), 4),
            "baselineAccuracy": round(float(baseline_acc), 4),
            "model_accuracy": round(float(acc), 4),
            "modelAccuracy": round(float(acc), 4),
            "macro_f1": round(float(macro_f1), 4),
            "macroF1": round(float(macro_f1), 4),
            "class_metrics": report,
            "classes": [str(c) for c in encoder.classes_],
            "limitationNote": "Weak recall (0.17) on Minor overrun class due to target imbalance."
        }

    def _train_delay_model(self):
        target = "future_delay_bucket"
        data = self.df[FEATURE_COLS + ["project_code", target]].dropna()
        X = data[FEATURE_COLS]
        y_raw = data[target]
        
        encoder = LabelEncoder()
        y = encoder.fit_transform(y_raw)
        
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
        train_idx, test_idx = next(splitter.split(X, y, groups=data["project_code"]))
        
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        baseline = DummyClassifier(strategy="most_frequent")
        baseline.fit(X_train, y_train)
        baseline_acc = accuracy_score(y_test, baseline.predict(X_test))
        
        model = XGBClassifier(
            n_estimators=400,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="multi:softprob",
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, pred)
        macro_f1 = f1_score(y_test, pred, average="macro")
        report = classification_report(y_test, pred, target_names=encoder.classes_, output_dict=True)
        
        self.delay_model = model
        self.delay_encoder = encoder
        self.delay_metrics = {
            "version": "CUF-XGB-DELAY-v1",
            "name": "Future Delay Model",
            "type": "XGBClassifier Multiclass (multi:softprob)",
            "rows": len(data),
            "projects": int(data["project_code"].nunique()),
            "baseline_accuracy": round(float(baseline_acc), 4),
            "baselineAccuracy": round(float(baseline_acc), 4),
            "model_accuracy": round(float(acc), 4),
            "modelAccuracy": round(float(acc), 4),
            "macro_f1": round(float(macro_f1), 4),
            "macroF1": round(float(macro_f1), 4),
            "class_metrics": report,
            "classes": [str(c) for c in encoder.classes_]
        }

    def _train_risk_model(self):
        target = "target_future_risk"
        data = self.df[FEATURE_COLS + ["project_code", target]].dropna()
        X = data[FEATURE_COLS]
        y = data[target].astype(int)
        
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
        train_idx, test_idx = next(splitter.split(X, y, groups=data["project_code"]))
        
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        baseline = DummyClassifier(strategy="most_frequent")
        baseline.fit(X_train, y_train)
        baseline_acc = accuracy_score(y_test, baseline.predict(X_test))
        
        model = XGBClassifier(
            n_estimators=400,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, pred)
        macro_f1 = f1_score(y_test, pred, average="macro")
        report = classification_report(y_test, pred, target_names=["Low Risk", "High Risk"], output_dict=True)
        
        self.risk_model = model
        self.risk_metrics = {
            "version": "CUF-XGB-RISK-v1",
            "name": "Future Risk Model",
            "type": "XGBClassifier Binary (binary:logistic)",
            "rows": len(data),
            "projects": int(data["project_code"].nunique()),
            "baseline_accuracy": round(float(baseline_acc), 4),
            "baselineAccuracy": round(float(baseline_acc), 4),
            "model_accuracy": round(float(acc), 4),
            "modelAccuracy": round(float(acc), 4),
            "macro_f1": round(float(macro_f1), 4),
            "macroF1": round(float(macro_f1), 4),
            "class_metrics": report,
            "classes": ["Low Risk", "High Risk"],
            "limitationNote": "High Risk recall is 0.50. Operates as a screening risk indicator."
        }

    def extract_shap_drivers(self, model, X_row, top_n=5):
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_row)
        
        if isinstance(shap_values, list):
            # Multiclass list of arrays (take positive class or last)
            values = shap_values[-1][0]
        else:
            shap_values = np.asarray(shap_values)
            if shap_values.ndim == 3:
                values = shap_values[0, :, -1]
            elif shap_values.ndim == 2:
                values = shap_values[0]
            else:
                values = shap_values.flatten()
                
        df_imp = pd.DataFrame({
            "feature": FEATURE_COLS,
            "shap_value": values,
            "abs_shap": np.abs(values),
            "feature_value": X_row.iloc[0].values
        }).sort_values("abs_shap", ascending=False).head(top_n)
        
        drivers = []
        for rank, (_, row) in enumerate(df_imp.iterrows(), start=1):
            feat = row["feature"]
            val = float(row["shap_value"]) if not pd.isna(row["shap_value"]) else 0.0
            feat_val = float(row["feature_value"]) if not pd.isna(row["feature_value"]) else 0.0
            abs_val = float(row["abs_shap"]) if not pd.isna(row["abs_shap"]) else 0.0
            direction = "increasing risk" if val > 0 else "reducing risk"
            drivers.append({
                "rank": rank,
                "feature": feat,
                "featureValue": feat_val,
                "shapValue": round(val, 4),
                "absShapValue": round(abs_val, 4),
                "direction": direction,
                "explanation": FEATURE_REASON_TEXT.get(feat, f"{feat} is influencing the prediction."),
                "prescription": PRESCRIPTIONS.get(feat, f"Review execution parameters related to {feat}.")
            })
        return drivers

    def predict_features(self, feature_dict: dict):
        # Ensure input feature dict has no NaNs
        clean_features = {k: (0.0 if pd.isna(v) or v is None else float(v)) for k, v in feature_dict.items()}
        X_row = pd.DataFrame([clean_features])[FEATURE_COLS]
        
        # 1. Cost Prediction
        cost_probs = self.cost_model.predict_proba(X_row)[0]
        cost_pred_idx = np.argmax(cost_probs)
        cost_class = self.cost_encoder.classes_[cost_pred_idx]
        cost_prob_dict = {str(cls): (0.0 if pd.isna(prob) else round(float(prob), 4)) for cls, prob in zip(self.cost_encoder.classes_, cost_probs)}
        cost_drivers = self.extract_shap_drivers(self.cost_model, X_row)
        
        # 2. Delay Prediction
        delay_probs = self.delay_model.predict_proba(X_row)[0]
        delay_pred_idx = np.argmax(delay_probs)
        delay_class = self.delay_encoder.classes_[delay_pred_idx]
        delay_prob_dict = {str(cls): (0.0 if pd.isna(prob) else round(float(prob), 4)) for cls, prob in zip(self.delay_encoder.classes_, delay_probs)}
        delay_drivers = self.extract_shap_drivers(self.delay_model, X_row)
        
        # 3. Future Risk Prediction
        risk_probs = self.risk_model.predict_proba(X_row)[0]
        risk_prob = float(risk_probs[1]) if len(risk_probs) > 1 else float(risk_probs[0])
        if pd.isna(risk_prob):
            risk_prob = 0.0
        risk_score_pct = round(risk_prob * 100, 2)
        
        if risk_prob < 0.33:
            risk_level = "Low"
        elif risk_prob < 0.66:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        risk_drivers = self.extract_shap_drivers(self.risk_model, X_row)
        
        return {
            "cost": {
                "prediction": str(cost_class),
                "probabilities": cost_prob_dict,
                "drivers": cost_drivers
            },
            "delay": {
                "prediction": str(delay_class),
                "probabilities": delay_prob_dict,
                "drivers": delay_drivers
            },
            "risk": {
                "probability": round(risk_prob, 4),
                "scorePercentage": risk_score_pct,
                "level": risk_level,
                "drivers": risk_drivers
            }
        }

    def predict_project(self, project_code: int):
        proj_rows = self.df[self.df["project_code"] == project_code]
        if proj_rows.empty:
            raise ValueError(f"Project code {project_code} not found in dataset")
        
        latest_row = proj_rows.sort_values("report_date").iloc[-1]
        feature_dict = {col: (0.0 if pd.isna(latest_row[col]) else float(latest_row[col])) for col in FEATURE_COLS}
        
        result = self.predict_features(feature_dict)
        result["projectCode"] = project_code
        result["latestReportDate"] = str(latest_row["report_date"])
        result["projectName"] = str(latest_row.get("project_name", f"Project {project_code}"))
        return result
