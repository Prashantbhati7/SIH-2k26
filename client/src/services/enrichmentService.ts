import { api } from './api';

export interface FeatureCatalogItem {
  id: string;
  featureCode: string;
  featureName: string;
  description: string;
  targetRelevance: string;
  collectionRole: string;
  cadence: string;
  inputType: string;
  unit: string;
  sourceType: string;
  sectorScope: string;
  active: boolean;
}

export interface EnrichmentRecommendation {
  id: string;
  projectId: string;
  featureCatalogId: string;
  featureCatalog: FeatureCatalogItem;
  triggerDriver: string;
  reason: string;
  currentDataGap: string;
  targetRelevance: string;
  priority: string;
  feasibility: string;
  recommendationScore: number;
  status: string; // RECOMMENDED, ACCEPTED, REJECTED
  selected: boolean;
  createdAt: string;
}

export interface EnrichmentCollectionPlan {
  id: string;
  projectId: string;
  recommendationId: string;
  recommendation?: EnrichmentRecommendation;
  assignedRole: string;
  assignedUserId?: string;
  cadence: string;
  startDate: string;
  expectedObservations: number;
  status: string;
}

export interface EnrichmentObservation {
  id: string;
  projectId: string;
  featureCatalogId: string;
  featureCatalog: FeatureCatalogItem;
  collectionPlanId?: string;
  collectorUserId: string;
  observedAt: string;
  valueNumeric?: number;
  valueText?: string;
  valueBoolean?: boolean;
  unit?: string;
  source: string;
  evidenceUrl?: string;
  remarks?: string;
  verificationStatus: string; // PENDING, VERIFIED, REJECTED
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  project?: {
    projectName: string;
    projectCode: number;
  };
}

export const enrichmentService = {
  getFeatureCatalog: async () => {
    const response = await api.get('/enrichment/features');
    return response.data.data as FeatureCatalogItem[];
  },

  getProjectRecommendations: async (projectCode: number | string) => {
    const response = await api.get(`/projects/${projectCode}/enrichment/recommendations`);
    return response.data.recommendations as EnrichmentRecommendation[];
  },

  generateProjectRecommendations: async (projectCode: number | string) => {
    const response = await api.post(`/projects/${projectCode}/enrichment/recommendations/generate`);
    return response.data.recommendations as EnrichmentRecommendation[];
  },

  updateRecommendationStatus: async (id: string, status: string, selected?: boolean) => {
    const response = await api.patch(`/enrichment/recommendations/${id}`, { status, selected });
    return response.data.recommendation as EnrichmentRecommendation;
  },

  getProjectCollectionPlans: async (projectCode: number | string) => {
    const response = await api.get(`/projects/${projectCode}/enrichment/plans`);
    return response.data.plans as EnrichmentCollectionPlan[];
  },

  createCollectionPlan: async (projectCode: number | string, data: { recommendationId: string; assignedRole?: string; cadence?: string }) => {
    const response = await api.post(`/projects/${projectCode}/enrichment/plans`, data);
    return response.data.plan as EnrichmentCollectionPlan;
  },

  getProjectObservations: async (projectCode: number | string) => {
    const response = await api.get(`/projects/${projectCode}/enrichment/observations`);
    return response.data.observations as EnrichmentObservation[];
  },

  createObservation: async (projectCode: number | string, data: {
    featureCatalogId: string;
    collectionPlanId?: string;
    collectorUserId?: string;
    observedAt?: string;
    valueNumeric?: number;
    valueText?: string;
    valueBoolean?: boolean;
    remarks?: string;
    evidenceUrl?: string;
  }) => {
    const response = await api.post(`/projects/${projectCode}/enrichment/observations`, data);
    return response.data.observation as EnrichmentObservation;
  },

  verifyObservation: async (id: string, verificationStatus: 'VERIFIED' | 'REJECTED', verifiedBy?: string) => {
    const response = await api.patch(`/enrichment/observations/${id}/verify`, { verificationStatus, verifiedBy });
    return response.data.observation as EnrichmentObservation;
  },

  getProjectCoverage: async (projectCode: number | string) => {
    const response = await api.get(`/projects/${projectCode}/enrichment/coverage`);
    return response.data;
  },

  getPortfolioCoverage: async () => {
    const response = await api.get('/enrichment/coverage/portfolio');
    return response.data;
  },

  getEvaluations: async () => {
    const response = await api.get('/enrichment/evaluations');
    return response.data;
  },

  runEvaluation: async () => {
    const response = await api.post('/enrichment/evaluations/run');
    return response.data;
  }
};
