import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard/policymaker
router.get('/policymaker', authenticateToken, requireRole(['MINISTER_POLICYMAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({ where: { status: 'ACTIVE' } });
    
    // Latest risk predictions
    const predictions = await prisma.riskPrediction.findMany({
      distinct: ['projectId'],
      orderBy: { createdAt: 'desc' },
      include: { project: true }
    });

    const highRiskCount = predictions.filter(p => p.riskLevel === 'High').length;
    const medRiskCount = predictions.filter(p => p.riskLevel === 'Medium').length;
    const lowRiskCount = predictions.filter(p => p.riskLevel === 'Low').length;

    const majorCostRiskCount = predictions.filter(p => p.costPrediction === 'Major (>40%)').length;
    const severeDelayRiskCount = predictions.filter(p => p.delayPrediction === 'Severe (>40 mo)').length;

    const openInterventionsCount = await prisma.intervention.count({
      where: { status: { in: ['PENDING', 'IN_PROGRESS', 'ESCALATED'] } }
    });

    // Aggregations by Ministry, Sector, State
    const projects = await prisma.project.findMany();
    const sectorRiskMap: Record<string, { total: number; high: number }> = {};
    const stateRiskMap: Record<string, { total: number; high: number }> = {};
    
    const predMap = new Map(predictions.map(p => [p.projectId, p.riskLevel]));

    projects.forEach(p => {
      const risk = predMap.get(p.id) || 'Low';
      // Sector
      if (!sectorRiskMap[p.sector]) sectorRiskMap[p.sector] = { total: 0, high: 0 };
      sectorRiskMap[p.sector].total += 1;
      if (risk === 'High') sectorRiskMap[p.sector].high += 1;

      // State
      if (!stateRiskMap[p.state]) stateRiskMap[p.state] = { total: 0, high: 0 };
      stateRiskMap[p.state].total += 1;
      if (risk === 'High') stateRiskMap[p.state].high += 1;
    });

    const sectorBreakdown = Object.entries(sectorRiskMap).map(([sector, data]) => ({
      sector,
      totalProjects: data.total,
      highRiskProjects: data.high,
      highRiskPercentage: Math.round((data.high / data.total) * 100)
    })).sort((a, b) => b.highRiskProjects - a.highRiskProjects).slice(0, 10);

    const stateBreakdown = Object.entries(stateRiskMap).map(([state, data]) => ({
      state,
      totalProjects: data.total,
      highRiskProjects: data.high
    })).sort((a, b) => b.highRiskProjects - a.highRiskProjects).slice(0, 10);

    // Top Intervention Priorities
    const topInterventions = await prisma.intervention.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS', 'ESCALATED'] } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        project: true
      }
    });

    return res.json({
      kpis: {
        totalProjects,
        activeProjects,
        highRiskProjects: highRiskCount,
        majorCostRiskProjects: majorCostRiskCount,
        severeDelayRiskProjects: severeDelayRiskCount,
        openInterventions: openInterventionsCount
      },
      riskDistribution: {
        low: lowRiskCount,
        medium: medRiskCount,
        high: highRiskCount
      },
      sectorBreakdown,
      stateBreakdown,
      topInterventionPriorities: topInterventions.map(i => ({
        id: i.id,
        projectCode: i.project.projectCode,
        projectName: i.project.projectName,
        sector: i.project.sector,
        state: i.project.state,
        driver: i.driver,
        recommendation: i.recommendation,
        priority: i.priority,
        status: i.status
      }))
    });
  } catch (error: any) {
    console.error('Policymaker dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch policymaker dashboard metrics' });
  }
});

// GET /api/dashboard/manager
router.get('/manager', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const userMinistryId = req.user?.ministryId;
    const whereProject = userMinistryId ? { ministryId: userMinistryId } : {};

    const projects = await prisma.project.findMany({
      where: whereProject,
      include: {
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        warnings: {
          where: { status: { in: ['DETECTED', 'ACKNOWLEDGED', 'ACTION_ASSIGNED'] } }
        },
        interventions: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
        }
      }
    });

    const totalProjects = projects.length;
    let highRisk = 0;
    let costWarnings = 0;
    let delayWarnings = 0;

    projects.forEach(p => {
      const pred = p.predictions[0];
      if (pred && pred.riskLevel === 'High') highRisk += 1;
      p.warnings.forEach(w => {
        if (w.category.includes('COST')) costWarnings += 1;
        if (w.category.includes('DELAY') || w.category.includes('SCHEDULE')) delayWarnings += 1;
      });
    });

    const pendingInterventions = await prisma.intervention.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        ...(userMinistryId ? { project: { ministryId: userMinistryId } } : {})
      }
    });

    const delayedMilestones = await prisma.milestone.count({
      where: {
        status: 'DELAYED',
        ...(userMinistryId ? { project: { ministryId: userMinistryId } } : {})
      }
    });

    const activeWarnings = await prisma.earlyWarning.findMany({
      where: {
        status: { in: ['DETECTED', 'ACKNOWLEDGED', 'ACTION_ASSIGNED'] },
        ...(userMinistryId ? { project: { ministryId: userMinistryId } } : {})
      },
      take: 10,
      orderBy: { detectedAt: 'desc' },
      include: { project: true }
    });

    return res.json({
      kpis: {
        projectsUnderManagement: totalProjects,
        highRiskCount: highRisk,
        costWarningsCount: costWarnings,
        delayWarningsCount: delayWarnings,
        pendingInterventions,
        delayedMilestones
      },
      activeWarnings: activeWarnings.map(w => ({
        id: w.id,
        projectCode: w.project.projectCode,
        projectName: w.project.projectName,
        category: w.category,
        severity: w.severity,
        title: w.title,
        message: w.message,
        status: w.status,
        detectedAt: w.detectedAt
      })),
      projects: projects.slice(0, 15).map(p => ({
        id: p.id,
        projectCode: p.projectCode,
        projectName: p.projectName,
        sector: p.sector,
        state: p.state,
        status: p.status,
        riskLevel: p.predictions[0]?.riskLevel || 'Low',
        riskProbability: p.predictions[0]?.scorePercentage || 0,
        costPrediction: p.predictions[0]?.costPrediction || 'No overrun',
        delayPrediction: p.predictions[0]?.delayPrediction || 'Low (<=3 mo)'
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch manager dashboard metrics' });
  }
});

// GET /api/dashboard/field
router.get('/field', authenticateToken, requireRole(['FIELD_OFFICER', 'PROJECT_MANAGER', 'MINISTER_POLICYMAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const assignedProjects = await prisma.project.findMany({
      take: 10,
      include: {
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
        fieldUpdates: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const pendingVerifications = await prisma.fieldUpdate.count({
      where: { verificationStatus: 'PENDING' }
    });

    const openIssues = await prisma.fieldUpdate.count({
      where: { issueType: { not: null } }
    });

    return res.json({
      kpis: {
        assignedProjects: assignedProjects.length,
        pendingVerifications,
        todaysUpdates: 2,
        openIssues
      },
      assignedProjects: assignedProjects.map(p => ({
        id: p.id,
        projectCode: p.projectCode,
        projectName: p.projectName,
        sector: p.sector,
        state: p.state,
        status: p.status,
        riskLevel: p.predictions[0]?.riskLevel || 'Low',
        lastUpdateDate: p.fieldUpdates[0]?.updateDate || 'No update'
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch field officer dashboard' });
  }
});

// GET /api/dashboard/contractor
router.get('/contractor', authenticateToken, requireRole(['CONTRACTOR', 'PROJECT_MANAGER', 'MINISTER_POLICYMAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.contractorTask.findMany({
      include: { project: true }
    });

    const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const overdueTasks = tasks.filter(t => t.status === 'OVERDUE').length;

    const targets = await prisma.monthlyTarget.findMany();
    const totalTarget = targets.reduce((acc, curr) => acc + curr.target, 0) || 100;
    const totalAchieved = targets.reduce((acc, curr) => acc + curr.achieved, 0) || 75;
    const achievementPct = Math.round((totalAchieved / totalTarget) * 100);

    return res.json({
      kpis: {
        assignedProjects: 3,
        activeTasks,
        completedTasks,
        overdueTasks,
        monthlyTargetPct: achievementPct
      },
      tasks: tasks.map(t => ({
        id: t.id,
        projectCode: t.project.projectCode,
        projectName: t.project.projectName,
        task: t.task,
        target: t.target,
        completed: t.completed,
        deadline: t.deadline,
        status: t.status
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch contractor dashboard' });
  }
});

export default router;
