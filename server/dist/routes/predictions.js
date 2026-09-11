"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
// POST /api/predictions/run
router.post('/run', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectCode } = req.body;
        if (!projectCode) {
            return res.status(400).json({ error: 'projectCode is required' });
        }
        const project = await prisma.project.findUnique({
            where: { projectCode: parseInt(projectCode, 10) },
            include: { snapshots: { orderBy: { reportDate: 'desc' }, take: 1 } }
        });
        if (!project || project.snapshots.length === 0) {
            return res.status(404).json({ error: 'Project or snapshot not found' });
        }
        const latestSnapshot = project.snapshots[0];
        // Call ML FastAPI Service
        const mlResponse = await axios_1.default.post(`${ML_SERVICE_URL}/predict/project`, {
            project_code: project.projectCode
        });
        const mlData = mlResponse.data;
        // Save Prediction in DB
        const riskPred = await prisma.riskPrediction.create({
            data: {
                projectId: project.id,
                snapshotId: latestSnapshot.id,
                modelVersion: 'CUF-XGB-v1',
                costPrediction: mlData.cost.prediction,
                costProbabilitiesJson: JSON.stringify(mlData.cost.probabilities),
                delayPrediction: mlData.delay.prediction,
                delayProbabilitiesJson: JSON.stringify(mlData.delay.probabilities),
                riskProbability: mlData.risk.probability,
                riskLevel: mlData.risk.level,
                scorePercentage: mlData.risk.scorePercentage,
                drivers: {
                    create: mlData.risk.drivers.map((d) => ({
                        modelType: 'RISK',
                        feature: d.feature,
                        featureValue: d.featureValue,
                        shapValue: d.shapValue,
                        absShapValue: d.absShapValue,
                        rank: d.rank,
                        direction: d.direction,
                        explanation: d.explanation,
                        prescription: d.prescription
                    }))
                }
            },
            include: { drivers: true }
        });
        // Check if Early Warning needs to be generated
        if (mlData.risk.level === 'High' || mlData.cost.prediction.includes('Major') || mlData.delay.prediction.includes('Severe')) {
            const topDriver = mlData.risk.drivers[0];
            await prisma.earlyWarning.create({
                data: {
                    projectId: project.id,
                    predictionId: riskPred.id,
                    category: mlData.risk.level === 'High' ? 'FUTURE_RISK' : (mlData.cost.prediction.includes('Major') ? 'COST_OVERRUN' : 'DELAY_SCHEDULE'),
                    severity: mlData.risk.level === 'High' ? 'CRITICAL' : 'HIGH',
                    title: `High Forward Risk Detected (${mlData.risk.scorePercentage}%)`,
                    message: `XGBoost model forecasts high next-snapshot risk driven by ${topDriver?.feature || 'project metrics'}.`,
                    basis: `Future Risk Probability: ${mlData.risk.scorePercentage}% | Cost: ${mlData.cost.prediction} | Delay: ${mlData.delay.prediction}`,
                    status: 'DETECTED'
                }
            });
        }
        return res.json({
            message: 'Prediction generated successfully',
            prediction: riskPred
        });
    }
    catch (error) {
        console.error('Prediction API error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to generate prediction from ML service' });
    }
});
// GET /api/projects/:projectCode/prediction
router.get('/project/:projectCode', auth_1.authenticateToken, async (req, res) => {
    try {
        const projectCode = parseInt(req.params.projectCode, 10);
        const prediction = await prisma.riskPrediction.findFirst({
            where: { project: { projectCode } },
            orderBy: { createdAt: 'desc' },
            include: { drivers: true, project: true }
        });
        if (!prediction) {
            return res.status(404).json({ error: 'No prediction found for project' });
        }
        return res.json({ prediction });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch prediction' });
    }
});
exports.default = router;
