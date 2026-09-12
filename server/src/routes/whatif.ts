import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// GET /api/projects/:projectCode/what-if/baseline
router.get('/:projectCode/what-if/baseline', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    if (isNaN(projectCode)) {
      return res.status(400).json({ error: 'Invalid project code' });
    }

    const project = await prisma.project.findUnique({
      where: { projectCode },
      include: {
        ministry: true,
        snapshots: { orderBy: { reportDate: 'desc' }, take: 1 }
      }
    });

    if (!project || project.snapshots.length === 0) {
      return res.status(404).json({ error: `Project code ${projectCode} or snapshot not found` });
    }

    const latestSnapshot = project.snapshots[0];

    const baselineFeatures = {
      original_cost: Number(latestSnapshot.originalCost || 0),
      revised_cost: Number(latestSnapshot.revisedCost || 0),
      cumulative_expenditure: Number(latestSnapshot.cumulativeExpenditure || 0),
      physical_progress: Number(latestSnapshot.physicalProgress || 0),
      expenditure_percent_original: Number(latestSnapshot.expenditurePercentOriginal || 0),
      project_age_months: Number(latestSnapshot.projectAgeMonths || 0),
      remaining_planned_duration: Number(latestSnapshot.remainingPlannedDuration || 0),
      planned_duration: Number(latestSnapshot.plannedDuration || 0),
      not_started_flag: Number(latestSnapshot.notStartedFlag || 0),
      genuine_overdue_flag: Number(latestSnapshot.genuineOverdueFlag || 0),
      ministry_encoded: Number(latestSnapshot.ministryEncoded || 0),
      sector_encoded: Number(latestSnapshot.sectorEncoded || 0),
      state_encoded: Number(latestSnapshot.stateEncoded || 0)
    };

    // Call ML service to get baseline prediction
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/project`, {
      features: baselineFeatures
    });

    return res.json({
      project: {
        id: project.id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        ministry: project.ministry?.name || 'Unknown Ministry',
        sector: project.sector,
        state: project.state,
        agency: project.agency,
        status: project.status
      },
      latestSnapshot: {
        id: latestSnapshot.id,
        reportDate: latestSnapshot.reportDate,
        originalCost: latestSnapshot.originalCost,
        revisedCost: latestSnapshot.revisedCost,
        cumulativeExpenditure: latestSnapshot.cumulativeExpenditure,
        physicalProgress: latestSnapshot.physicalProgress,
        expenditurePercentOriginal: latestSnapshot.expenditurePercentOriginal,
        projectAgeMonths: latestSnapshot.projectAgeMonths,
        remainingPlannedDuration: latestSnapshot.remainingPlannedDuration,
        plannedDuration: latestSnapshot.plannedDuration,
        notStartedFlag: latestSnapshot.notStartedFlag,
        genuineOverdueFlag: latestSnapshot.genuineOverdueFlag
      },
      baselineFeatures,
      baselinePrediction: mlResponse.data
    });
  } catch (error: any) {
    console.error('Fetch what-if baseline error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to fetch baseline for What-If simulation' });
  }
});

// POST /api/projects/:projectCode/what-if/simulate
router.post('/:projectCode/what-if/simulate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    if (isNaN(projectCode)) {
      return res.status(400).json({ error: 'Invalid project code' });
    }

    const project = await prisma.project.findUnique({
      where: { projectCode },
      include: {
        snapshots: { orderBy: { reportDate: 'desc' }, take: 1 }
      }
    });

    if (!project || project.snapshots.length === 0) {
      return res.status(404).json({ error: `Project code ${projectCode} or snapshot not found` });
    }

    const snapshot = project.snapshots[0];
    const hyp = req.body.hypotheticalFeatures || {};

    // 1. Validate & clamp editable numerical inputs
    const original_cost = Math.max(0, Number(hyp.original_cost ?? snapshot.originalCost));
    const revised_cost = Math.max(0, Number(hyp.revised_cost ?? snapshot.revisedCost));
    const cumulative_expenditure = Math.max(0, Number(hyp.cumulative_expenditure ?? snapshot.cumulativeExpenditure));
    const physical_progress = Math.min(100, Math.max(0, Number(hyp.physical_progress ?? snapshot.physicalProgress)));
    const project_age_months = Math.max(0, Number(hyp.project_age_months ?? snapshot.projectAgeMonths));
    const remaining_planned_duration = Math.max(0, Number(hyp.remaining_planned_duration ?? snapshot.remainingPlannedDuration));
    const planned_duration = Math.max(0, Number(hyp.planned_duration ?? snapshot.plannedDuration));
    const not_started_flag = Number(hyp.not_started_flag ?? snapshot.notStartedFlag) > 0.5 ? 1.0 : 0.0;
    const genuine_overdue_flag = Number(hyp.genuine_overdue_flag ?? snapshot.genuineOverdueFlag) > 0.5 ? 1.0 : 0.0;

    // 2. Recalculate dependent feature automatically
    const expenditure_percent_original = original_cost > 0
      ? Math.round(((cumulative_expenditure / original_cost) * 100) * 100) / 100
      : 0;

    // 3. Preserve baseline categoricals
    const ministry_encoded = Number(snapshot.ministryEncoded || 0);
    const sector_encoded = Number(snapshot.sectorEncoded || 0);
    const state_encoded = Number(snapshot.stateEncoded || 0);

    const simulatedFeatures = {
      original_cost,
      revised_cost,
      cumulative_expenditure,
      physical_progress,
      expenditure_percent_original,
      project_age_months,
      remaining_planned_duration,
      planned_duration,
      not_started_flag,
      genuine_overdue_flag,
      ministry_encoded,
      sector_encoded,
      state_encoded
    };

    const baselineFeatures = {
      original_cost: Number(snapshot.originalCost || 0),
      revised_cost: Number(snapshot.revisedCost || 0),
      cumulative_expenditure: Number(snapshot.cumulativeExpenditure || 0),
      physical_progress: Number(snapshot.physicalProgress || 0),
      expenditure_percent_original: Number(snapshot.expenditurePercentOriginal || 0),
      project_age_months: Number(snapshot.projectAgeMonths || 0),
      remaining_planned_duration: Number(snapshot.remainingPlannedDuration || 0),
      planned_duration: Number(snapshot.plannedDuration || 0),
      not_started_flag: Number(snapshot.notStartedFlag || 0),
      genuine_overdue_flag: Number(snapshot.genuineOverdueFlag || 0),
      ministry_encoded: Number(snapshot.ministryEncoded || 0),
      sector_encoded: Number(snapshot.sectorEncoded || 0),
      state_encoded: Number(snapshot.stateEncoded || 0)
    };

    // 4. Run inference for simulated state and baseline state in parallel
    const [baselineRes, simulatedRes] = await Promise.all([
      axios.post(`${ML_SERVICE_URL}/predict/project`, { features: baselineFeatures }),
      axios.post(`${ML_SERVICE_URL}/predict/project`, { features: simulatedFeatures })
    ]);

    const bData = baselineRes.data;
    const sData = simulatedRes.data;

    const riskProbDelta = Number((sData.risk.probability - bData.risk.probability).toFixed(4));
    const scorePctDelta = Number((sData.risk.scorePercentage - bData.risk.scorePercentage).toFixed(2));

    return res.json({
      simulatedFeatures,
      baselineFeatures,
      baselinePrediction: bData,
      simulatedPrediction: sData,
      deltas: {
        riskProbabilityDelta: riskProbDelta,
        scorePercentageDelta: scorePctDelta,
        riskLevelChanged: bData.risk.level !== sData.risk.level,
        costPredictionChanged: bData.cost.prediction !== sData.cost.prediction,
        delayPredictionChanged: bData.delay.prediction !== sData.delay.prediction
      }
    });
  } catch (error: any) {
    console.error('Run what-if simulation error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to execute What-If simulation' });
  }
});

export default router;
