import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/benchmark/:projectCode
router.get('/:projectCode', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    const targetProject = await prisma.project.findUnique({
      where: { projectCode },
      include: {
        snapshots: { orderBy: { reportDate: 'desc' }, take: 1 },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!targetProject) {
      return res.status(404).json({ error: 'Project not found for benchmarking' });
    }

    const targetSnap = targetProject.snapshots[0];
    const targetPred = targetProject.predictions[0];

    // Sector peers
    const sectorPeers = await prisma.project.findMany({
      where: { sector: targetProject.sector },
      include: {
        snapshots: { orderBy: { reportDate: 'desc' }, take: 1 },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const peerCount = sectorPeers.length;
    if (peerCount < 2) {
      return res.json({
        hasBenchmark: false,
        message: 'Insufficient peer sample size to produce a valid sector benchmark.'
      });
    }

    let sumCostGrowth = 0;
    let sumProgress = 0;
    let sumDelay = 0;
    let sumRiskProb = 0;

    sectorPeers.forEach(p => {
      const snap = p.snapshots[0];
      const pred = p.predictions[0];
      if (snap) {
        sumCostGrowth += (snap.expenditurePercentOriginal || 0);
        sumProgress += (snap.physicalProgress || 0);
        sumDelay += (snap.delayMonths || 0);
      }
      if (pred) {
        sumRiskProb += (pred.scorePercentage || 0);
      }
    });

    const sectorAvgCostGrowth = Math.round((sumCostGrowth / peerCount) * 10) / 10;
    const sectorAvgProgress = Math.round((sumProgress / peerCount) * 10) / 10;
    const sectorAvgDelay = Math.round((sumDelay / peerCount) * 10) / 10;
    const sectorAvgRiskProb = Math.round((sumRiskProb / peerCount) * 10) / 10;

    const currentCostGrowth = targetSnap ? Math.round(targetSnap.expenditurePercentOriginal * 10) / 10 : 0;
    const currentProgress = targetSnap ? Math.round(targetSnap.physicalProgress * 10) / 10 : 0;
    const currentDelay = targetSnap ? Math.round(targetSnap.delayMonths * 10) / 10 : 0;
    const currentRiskProb = targetPred ? Math.round(targetPred.scorePercentage * 10) / 10 : 0;

    return res.json({
      hasBenchmark: true,
      projectCode: targetProject.projectCode,
      projectName: targetProject.projectName,
      sector: targetProject.sector,
      peerCount,
      comparison: [
        { metric: 'Expenditure / Original Budget (%)', project: currentCostGrowth, sectorAverage: sectorAvgCostGrowth },
        { metric: 'Physical Progress (%)', project: currentProgress, sectorAverage: sectorAvgProgress },
        { metric: 'Current Delay (Months)', project: currentDelay, sectorAverage: sectorAvgDelay },
        { metric: 'Model Risk Probability (%)', project: currentRiskProb, sectorAverage: sectorAvgRiskProb }
      ],
      insight: currentRiskProb > sectorAvgRiskProb
        ? `Project forward risk (${currentRiskProb}%) is currently ABOVE the ${targetProject.sector} sector median (${sectorAvgRiskProb}%).`
        : `Project forward risk (${currentRiskProb}%) is currently AT OR BELOW the ${targetProject.sector} sector median (${sectorAvgRiskProb}%).`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate project benchmark' });
  }
});

export default router;
