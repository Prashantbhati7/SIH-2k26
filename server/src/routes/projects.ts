import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/projects
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { search, sector, state, riskLevel, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { projectName: { contains: search as string } },
        { projectCode: isNaN(parseInt(search as string)) ? undefined : parseInt(search as string) }
      ].filter(Boolean);
    }
    if (sector) whereClause.sector = sector as string;
    if (state) whereClause.state = state as string;

    const [total, projects] = await Promise.all([
      prisma.project.count({ where: whereClause }),
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        include: {
          ministry: true,
          snapshots: { orderBy: { reportDate: 'desc' }, take: 1 },
          predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
          warnings: { where: { status: { in: ['DETECTED', 'ACKNOWLEDGED', 'ACTION_ASSIGNED'] } } }
        }
      })
    ]);

    // Optional filter by riskLevel
    let resultProjects = projects.map(p => {
      const latestSnapshot = p.snapshots[0];
      const latestPred = p.predictions[0];
      return {
        id: p.id,
        projectCode: p.projectCode,
        projectId: p.projectId,
        projectName: p.projectName,
        ministry: p.ministry?.name || 'Unknown',
        sector: p.sector,
        state: p.state,
        agency: p.agency,
        status: p.status,
        reportDate: latestSnapshot?.reportDate || 'N/A',
        originalCost: latestSnapshot?.originalCost || 0,
        revisedCost: latestSnapshot?.revisedCost || 0,
        cumulativeExpenditure: latestSnapshot?.cumulativeExpenditure || 0,
        physicalProgress: latestSnapshot?.physicalProgress || 0,
        delayMonths: latestSnapshot?.delayMonths || 0,
        costOverrunPercent: latestSnapshot?.costOverrunPercent || 0,
        costPrediction: latestPred?.costPrediction || 'No overrun',
        delayPrediction: latestPred?.delayPrediction || 'Low (<=3 mo)',
        riskLevel: latestPred?.riskLevel || 'Low',
        riskProbability: latestPred?.riskProbability || 0,
        scorePercentage: latestPred?.scorePercentage || 0,
        activeWarningsCount: p.warnings.length
      };
    });

    if (riskLevel) {
      resultProjects = resultProjects.filter(p => p.riskLevel.toLowerCase() === (riskLevel as string).toLowerCase());
    }

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      projects: resultProjects
    });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:projectCode
router.get('/:projectCode', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    if (isNaN(projectCode)) {
      return res.status(400).json({ error: 'Invalid project code' });
    }

    const project = await prisma.project.findUnique({
      where: { projectCode },
      include: {
        ministry: true,
        snapshots: { orderBy: { reportDate: 'desc' } },
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { drivers: true }
        },
        warnings: { orderBy: { detectedAt: 'desc' } },
        interventions: { orderBy: { createdAt: 'desc' }, include: { assignedUser: true } },
        fieldUpdates: { orderBy: { createdAt: 'desc' }, include: { fieldOfficer: true } },
        tasks: { orderBy: { createdAt: 'desc' }, include: { contractor: true } },
        targets: { orderBy: { month: 'desc' } },
        milestones: { orderBy: { plannedDate: 'asc' } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: `Project code ${projectCode} not found` });
    }

    const latestSnapshot = project.snapshots[0];
    const latestPrediction = project.predictions[0];

    // Build timeline feed
    const timeline: any[] = [];

    project.snapshots.forEach(s => {
      timeline.push({
        id: `snap-${s.id}`,
        type: 'SNAPSHOT',
        title: `Reporting Cycle Snapshot: ${s.reportDate}`,
        date: s.reportDate,
        description: `Physical Progress: ${s.physicalProgress}%, Expenditure: ₹${s.cumulativeExpenditure} Cr`,
        badgeColor: 'blue'
      });
    });

    project.warnings.forEach(w => {
      timeline.push({
        id: `warn-${w.id}`,
        type: 'EARLY_WARNING',
        title: `Early Warning Detected: ${w.title}`,
        date: w.detectedAt.toISOString().split('T')[0],
        description: `${w.message} (Severity: ${w.severity})`,
        badgeColor: w.severity === 'CRITICAL' || w.severity === 'HIGH' ? 'red' : 'amber'
      });
    });

    project.interventions.forEach(i => {
      timeline.push({
        id: `inter-${i.id}`,
        type: 'INTERVENTION',
        title: `Intervention Created: ${i.recommendation}`,
        date: i.createdAt.toISOString().split('T')[0],
        description: `Assigned to: ${i.assignedUser?.name || i.assignedRole || 'Unassigned'} [Status: ${i.status}]`,
        badgeColor: 'purple'
      });
    });

    project.fieldUpdates.forEach(f => {
      timeline.push({
        id: `field-${f.id}`,
        type: 'FIELD_UPDATE',
        title: `Field Officer Ground Update`,
        date: f.updateDate,
        description: `Officer: ${f.fieldOfficer.name} | Reported Progress: ${f.physicalProgress}% | Issues: ${f.issueDescription || 'None'}`,
        badgeColor: 'emerald'
      });
    });

    project.tasks.forEach(t => {
      timeline.push({
        id: `task-${t.id}`,
        type: 'CONTRACTOR_TASK',
        title: `Contractor Task: ${t.task}`,
        date: t.deadline,
        description: `Completed: ${t.completed}/${t.target} [Status: ${t.status}]`,
        badgeColor: 'indigo'
      });
    });

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({
      project: {
        id: project.id,
        projectCode: project.projectCode,
        projectId: project.projectId,
        projectName: project.projectName,
        ministry: project.ministry?.name || 'Ministry of Infrastructure',
        sector: project.sector,
        state: project.state,
        agency: project.agency,
        status: project.status,
        latitude: project.latitude,
        longitude: project.longitude,
        source: project.source
      },
      latestSnapshot,
      prediction: latestPrediction ? {
        modelVersion: latestPrediction.modelVersion,
        costPrediction: latestPrediction.costPrediction,
        costProbabilities: JSON.parse(latestPrediction.costProbabilitiesJson || '{}'),
        delayPrediction: latestPrediction.delayPrediction,
        delayProbabilities: JSON.parse(latestPrediction.delayProbabilitiesJson || '{}'),
        riskProbability: latestPrediction.riskProbability,
        scorePercentage: latestPrediction.scorePercentage,
        riskLevel: latestPrediction.riskLevel,
        drivers: latestPrediction.drivers.map(d => ({
          rank: d.rank,
          feature: d.feature,
          featureValue: d.featureValue,
          shapValue: d.shapValue,
          absShapValue: d.absShapValue,
          direction: d.direction,
          explanation: d.explanation,
          prescription: d.prescription
        }))
      } : null,
      warnings: project.warnings,
      interventions: project.interventions,
      fieldUpdates: project.fieldUpdates,
      contractorTasks: project.tasks,
      monthlyTargets: project.targets,
      milestones: project.milestones,
      historySnapshots: project.snapshots,
      activityTimeline: timeline
    });
  } catch (error: any) {
    console.error('Fetch project detail error:', error);
    return res.status(500).json({ error: 'Failed to fetch project profile' });
  }
});

// GET /api/projects/:projectCode/history
router.get('/:projectCode/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projectCode = parseInt(req.params.projectCode, 10);
    const snapshots = await prisma.projectSnapshot.findMany({
      where: { project: { projectCode } },
      orderBy: { reportDate: 'asc' }
    });
    return res.json({ snapshots });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project history' });
  }
});

export default router;
