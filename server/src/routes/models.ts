import { Router, Response } from 'express';
import axios from 'axios';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// GET /api/models
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const mlRes = await axios.get(`${ML_SERVICE_URL}/models`);
    return res.json(mlRes.data);
  } catch (error) {
    // Fallback model cards grounded in source-final.ipynb evaluation
    return res.json({
      models: [
        {
          version: 'CUF-XGB-COST-v1',
          name: 'Cost Overrun Model',
          type: 'XGBClassifier Multiclass (multi:softprob)',
          featureCount: 13,
          rows: 5931,
          projects: 1709,
          baselineAccuracy: 0.7456,
          modelAccuracy: 0.8474,
          macroF1: 0.6391,
          classMetrics: {
            'No overrun': { precision: 0.88, recall: 0.97, f1Score: 0.93 },
            'Minor (0-10%)': { precision: 0.55, recall: 0.17, f1Score: 0.25 },
            'Moderate (10-40%)': { precision: 0.64, recall: 0.52, f1Score: 0.58 },
            'Major (>40%)': { precision: 0.79, recall: 0.82, f1Score: 0.80 }
          },
          limitationNote: 'Weak recall (0.17) on Minor overrun class due to target imbalance.'
        },
        {
          version: 'CUF-XGB-DELAY-v1',
          name: 'Future Delay Model',
          type: 'XGBClassifier Multiclass (multi:softprob)',
          featureCount: 13,
          rows: 4815,
          projects: 1436,
          baselineAccuracy: 0.2884,
          modelAccuracy: 0.7906,
          macroF1: 0.7930,
          classMetrics: {
            'Low (<=3 mo)': { precision: 0.77, recall: 0.76, f1Score: 0.77 },
            'Moderate (3-15 mo)': { precision: 0.74, recall: 0.71, f1Score: 0.72 },
            'High (15-40 mo)': { precision: 0.77, recall: 0.82, f1Score: 0.79 },
            'Severe (>40 mo)': { precision: 0.90, recall: 0.88, f1Score: 0.89 }
          }
        },
        {
          version: 'CUF-XGB-RISK-v1',
          name: 'Future Risk Model',
          type: 'XGBClassifier Binary (binary:logistic)',
          featureCount: 13,
          rows: 5987,
          projects: 1718,
          baselineAccuracy: 0.6984,
          modelAccuracy: 0.7401,
          macroF1: 0.6777,
          classMetrics: {
            'Low Risk': { precision: 0.80, recall: 0.84, f1Score: 0.82 },
            'High Risk': { precision: 0.58, recall: 0.50, f1Score: 0.54 }
          },
          limitationNote: 'High Risk recall is 0.50. Operates as a screening risk indicator.'
        }
      ],
      methodology: {
        split: 'GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)',
        groupKey: 'project_code',
        rationale: 'Project-level grouping prevents data leakage between monthly reporting snapshots of the same project.',
        explainability: 'SHAP TreeExplainer (top 5 absolute SHAP impact values per snapshot)'
      },
      cufVsEnrichedStory: {
        current: 'Implemented & Evaluated CUF/PAIMANA XGBoost Models (13 features)',
        pilot: 'Daily Field Officer & Contractor ground execution data collection',
        future: 'CUF + Enriched feature engineering, retraining & comparative evaluation'
      }
    });
  }
});

export default router;
