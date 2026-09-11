import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/reports/:projectCode
router.post('/:projectCode', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    const project = await prisma.project.findUnique({
      where: { projectCode },
      include: {
        ministry: true,
        snapshots: { orderBy: { reportDate: 'desc' }, take: 1 },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1, include: { drivers: true } },
        warnings: { orderBy: { detectedAt: 'desc' } },
        interventions: { orderBy: { createdAt: 'desc' }, include: { assignedUser: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const latestSnap = project.snapshots[0];
    const latestPred = project.predictions[0];

    const report = {
      title: `VikasDrishti Infrastructure Project Intelligence Report`,
      generatedAt: new Date().toISOString(),
      disclaimer: 'PROTOTYPE / DEMO DATA — Next-Snapshot Forecast for Next Reporting Cycle',
      project: {
        code: project.projectCode,
        name: project.projectName,
        ministry: project.ministry?.name || 'N/A',
        sector: project.sector,
        state: project.state,
        agency: project.agency,
        status: project.status
      },
      latestSnapshot: latestSnap ? {
        reportDate: latestSnap.reportDate,
        originalCost: latestSnap.originalCost,
        revisedCost: latestSnap.revisedCost,
        cumulativeExpenditure: latestSnap.cumulativeExpenditure,
        physicalProgress: latestSnap.physicalProgress,
        delayMonths: latestSnap.delayMonths,
        projectAgeMonths: latestSnap.projectAgeMonths,
        plannedDuration: latestSnap.plannedDuration
      } : null,
      predictions: latestPred ? {
        modelVersion: latestPred.modelVersion,
        costOverrunPrediction: latestPred.costPrediction,
        delayPrediction: latestPred.delayPrediction,
        riskProbabilityPct: latestPred.scorePercentage,
        riskLevel: latestPred.riskLevel,
        drivers: latestPred.drivers.map(d => ({
          feature: d.feature,
          impact: d.absShapValue,
          direction: d.direction,
          explanation: d.explanation,
          recommendation: d.prescription
        }))
      } : null,
      earlyWarnings: project.warnings.map(w => ({
        severity: w.severity,
        category: w.category,
        title: w.title,
        message: w.message,
        status: w.status
      })),
      interventions: project.interventions.map(i => ({
        driver: i.driver,
        recommendation: i.recommendation,
        priority: i.priority,
        status: i.status,
        assignedTo: i.assignedUser?.name || 'Unassigned'
      }))
    };

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'GENERATE_REPORT',
          entity: 'Project',
          entityId: project.id,
          metadataJson: JSON.stringify({ projectCode })
        }
      });
    }

    return res.json({ report });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate project report' });
  }
});

export default router;
