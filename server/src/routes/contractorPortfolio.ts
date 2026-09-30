import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to determine Safety Grade based on metrics
export function calculateSafetyGrade(riskScore: number, blacklisted: boolean): string {
  if (blacklisted) return 'BLACKLISTED';
  if (riskScore <= 12) return 'GRADE_A_PLUS';
  if (riskScore <= 22) return 'GRADE_A';
  if (riskScore <= 38) return 'GRADE_B';
  if (riskScore <= 55) return 'GRADE_C';
  return 'HIGH_RISK';
}

// GET /api/contractor-portfolio/stats - High-level contractor portfolio statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const contractors = await prisma.contractorProfile.findMany({
      include: {
        assignments: { where: { status: 'ACTIVE' } },
        historyRecords: true
      }
    });

    const totalContractors = contractors.length;
    const safeCount = contractors.filter(c => c.safetyRating === 'GRADE_A_PLUS' || c.safetyRating === 'GRADE_A').length;
    const conditionalCount = contractors.filter(c => c.safetyRating === 'GRADE_B' || c.safetyRating === 'GRADE_C').length;
    const highRiskCount = contractors.filter(c => c.safetyRating === 'HIGH_RISK' || c.blacklisted).length;

    let totalActiveAssignments = 0;
    let totalCompletedHistory = 0;
    let totalActiveAllocatedValue = 0;
    let sumOnTimeRate = 0;
    let sumCostOverrun = 0;
    let sumDelayMonths = 0;

    for (const c of contractors) {
      totalActiveAssignments += c.assignments.length;
      totalCompletedHistory += c.historyRecords.length;
      sumOnTimeRate += c.onTimeCompletionRate;
      sumCostOverrun += c.historicalCostOverrunAvg;
      sumDelayMonths += c.historicalDelayAvgMonths;
      for (const a of c.assignments) {
        totalActiveAllocatedValue += a.allocatedBudgetCrores;
      }
    }

    const avgOnTimeRate = totalContractors > 0 ? +(sumOnTimeRate / totalContractors).toFixed(1) : 0;
    const avgCostOverrun = totalContractors > 0 ? +(sumCostOverrun / totalContractors).toFixed(1) : 0;
    const avgDelayMonths = totalContractors > 0 ? +(sumDelayMonths / totalContractors).toFixed(1) : 0;

    return res.json({
      totalContractors,
      safeCount,
      conditionalCount,
      highRiskCount,
      totalActiveAssignments,
      totalCompletedHistory,
      totalActiveAllocatedValueCrores: +totalActiveAllocatedValue.toFixed(2),
      avgOnTimeRate,
      avgCostOverrunPercent: avgCostOverrun,
      avgDelayMonths
    });
  } catch (error) {
    console.error('Error fetching contractor stats:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor portfolio stats' });
  }
});

// GET /api/contractor-portfolio - List all contractors with filtering & search
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { search, sector, safetyRating, status } = req.query;

    const where: any = {};

    if (safetyRating && safetyRating !== 'ALL') {
      where.safetyRating = String(safetyRating);
    }

    if (status === 'BLACKLISTED') {
      where.blacklisted = true;
    } else if (status === 'ACTIVE') {
      where.blacklisted = false;
    }

    if (sector && sector !== 'ALL') {
      where.specialization = {
        contains: String(sector)
      };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { companyName: { contains: q } },
        { registrationNumber: { contains: q } },
        { contactPerson: { contains: q } },
        { specialization: { contains: q } }
      ];
    }

    const contractors = await prisma.contractorProfile.findMany({
      where,
      orderBy: [
        { blacklisted: 'asc' },
        { riskScore: 'asc' }
      ],
      include: {
        assignments: {
          include: {
            project: {
              select: {
                id: true,
                projectCode: true,
                projectName: true,
                sector: true,
                state: true,
                agency: true,
                status: true
              }
            }
          }
        },
        historyRecords: {
          orderBy: { completionYear: 'desc' }
        },
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 1
        }
      }
    });

    const enriched = contractors.map(c => {
      const activeCount = c.assignments.filter(a => a.status === 'ACTIVE').length;
      const capacityUtilization = c.maxConcurrentProjects > 0 ? +((activeCount / c.maxConcurrentProjects) * 100).toFixed(1) : 0;
      const isOverloaded = activeCount >= c.maxConcurrentProjects;

      return {
        ...c,
        activeAssignmentsCount: activeCount,
        capacityUtilizationPercent: capacityUtilization,
        isOverloaded,
        latestEvaluation: c.evaluations[0] || null
      };
    });

    return res.json({ contractors: enriched });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor portfolio' });
  }
});

// GET /api/contractor-portfolio/:id - Detailed Contractor Dossier
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const contractor = await prisma.contractorProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, active: true }
        },
        assignments: {
          orderBy: { assignedDate: 'desc' },
          include: {
            project: {
              include: {
                snapshots: {
                  orderBy: { reportDate: 'desc' },
                  take: 1
                },
                predictions: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  include: {
                    drivers: {
                      orderBy: { rank: 'asc' },
                      take: 3
                    }
                  }
                },
                warnings: {
                  where: { status: { in: ['DETECTED', 'ACKNOWLEDGED', 'ACTION_ASSIGNED', 'IN_PROGRESS'] } },
                  take: 3
                }
              }
            }
          }
        },
        historyRecords: {
          orderBy: { completionYear: 'desc' }
        },
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          include: {
            project: {
              select: {
                projectCode: true,
                projectName: true,
                sector: true,
                agency: true
              }
            }
          }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor profile not found' });
    }

    const activeAssignments = contractor.assignments.filter(a => a.status === 'ACTIVE');
    const capacityUtilization = contractor.maxConcurrentProjects > 0
      ? +((activeAssignments.length / contractor.maxConcurrentProjects) * 100).toFixed(1)
      : 0;

    // Aggregate statistics across history records
    const historyCount = contractor.historyRecords.length;
    let totalContractValue = 0;
    let totalFinalCost = 0;
    let onTimeCount = 0;
    let totalSafetyIncidents = 0;

    for (const h of contractor.historyRecords) {
      totalContractValue += h.contractValueCrores;
      totalFinalCost += h.finalCostCrores;
      if (h.delayMonths <= 0.5) onTimeCount++;
      totalSafetyIncidents += h.safetyIncidents;
    }

    const calculatedOverrunAvg = historyCount > 0 && totalContractValue > 0
      ? +(((totalFinalCost - totalContractValue) / totalContractValue) * 100).toFixed(1)
      : contractor.historicalCostOverrunAvg;

    const calculatedOnTimeRate = historyCount > 0
      ? +((onTimeCount / historyCount) * 100).toFixed(1)
      : contractor.onTimeCompletionRate;

    return res.json({
      contractor: {
        ...contractor,
        activeAssignmentsCount: activeAssignments.length,
        capacityUtilizationPercent: capacityUtilization,
        isOverloaded: activeAssignments.length >= contractor.maxConcurrentProjects,
        computedMetrics: {
          totalHistoricalContractValueCrores: +totalContractValue.toFixed(2),
          totalHistoricalFinalCostCrores: +totalFinalCost.toFixed(2),
          calculatedOverrunAvg,
          calculatedOnTimeRate,
          totalSafetyIncidents
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contractor dossier:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor dossier' });
  }
});

// POST /api/contractor-portfolio - Register a new contractor
router.post('/', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      registrationNumber,
      contactPerson,
      contactEmail,
      contactPhone,
      establishedYear,
      experienceYears,
      specialization,
      financialCapacityCrores,
      maxConcurrentProjects,
      notes
    } = req.body;

    if (!companyName || !registrationNumber || !contactPerson || !contactEmail || !specialization) {
      return res.status(400).json({ error: 'Company Name, Registration Number, Contact Person, Email, and Specialization are required.' });
    }

    const existing = await prisma.contractorProfile.findUnique({
      where: { registrationNumber }
    });

    if (existing) {
      return res.status(400).json({ error: `Contractor with registration number '${registrationNumber}' already exists.` });
    }

    const contractor = await prisma.contractorProfile.create({
      data: {
        companyName,
        registrationNumber,
        contactPerson,
        contactEmail,
        contactPhone,
        establishedYear: establishedYear ? parseInt(establishedYear, 10) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 5,
        specialization,
        financialCapacityCrores: financialCapacityCrores ? parseFloat(financialCapacityCrores) : 500.0,
        maxConcurrentProjects: maxConcurrentProjects ? parseInt(maxConcurrentProjects, 10) : 5,
        safetyRating: 'GRADE_A',
        riskScore: 18.0,
        notes
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'REGISTER_CONTRACTOR',
          entity: 'ContractorProfile',
          entityId: contractor.id,
          metadataJson: JSON.stringify({ companyName, registrationNumber })
        }
      });
    }

    return res.status(201).json({ message: 'Contractor profile created successfully', contractor });
  } catch (error: any) {
    console.error('Error creating contractor:', error);
    return res.status(500).json({ error: error.message || 'Failed to create contractor profile' });
  }
});

// PATCH /api/contractor-portfolio/:id - Update contractor profile or blacklist status
router.patch('/:id', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      specialization,
      financialCapacityCrores,
      maxConcurrentProjects,
      safetyRating,
      riskScore,
      blacklisted,
      notes
    } = req.body;

    const data: any = {};
    if (companyName !== undefined) data.companyName = companyName;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;
    if (contactEmail !== undefined) data.contactEmail = contactEmail;
    if (contactPhone !== undefined) data.contactPhone = contactPhone;
    if (specialization !== undefined) data.specialization = specialization;
    if (financialCapacityCrores !== undefined) data.financialCapacityCrores = parseFloat(financialCapacityCrores);
    if (maxConcurrentProjects !== undefined) data.maxConcurrentProjects = parseInt(maxConcurrentProjects, 10);
    if (riskScore !== undefined) {
      data.riskScore = parseFloat(riskScore);
      data.safetyRating = calculateSafetyGrade(data.riskScore, blacklisted ?? false);
    }
    if (safetyRating !== undefined) data.safetyRating = safetyRating;
    if (blacklisted !== undefined) {
      data.blacklisted = Boolean(blacklisted);
      if (data.blacklisted) data.safetyRating = 'BLACKLISTED';
    }
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.contractorProfile.update({
      where: { id: req.params.id },
      data
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CONTRACTOR_PROFILE',
          entity: 'ContractorProfile',
          entityId: updated.id,
          metadataJson: JSON.stringify(data)
        }
      });
    }

    return res.json({ message: 'Contractor profile updated successfully', contractor: updated });
  } catch (error: any) {
    console.error('Error updating contractor:', error);
    return res.status(500).json({ error: error.message || 'Failed to update contractor profile' });
  }
});

// POST /api/contractor-portfolio/:id/historical-projects - Add past project record to contractor track record
router.post('/:id/historical-projects', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      projectName,
      sector,
      state,
      clientAgency,
      contractValueCrores,
      finalCostCrores,
      plannedDurationMonths,
      actualDurationMonths,
      completionYear,
      completionStatus,
      qualityGrade,
      safetyIncidents,
      performanceSummary
    } = req.body;

    if (!projectName || !sector || !clientAgency || contractValueCrores === undefined || finalCostCrores === undefined) {
      return res.status(400).json({ error: 'Project Name, Sector, Client Agency, Contract Value, and Final Cost are required.' });
    }

    const cVal = parseFloat(contractValueCrores);
    const fCost = parseFloat(finalCostCrores);
    const pDur = parseFloat(plannedDurationMonths) || 12.0;
    const aDur = parseFloat(actualDurationMonths) || pDur;
    const delayM = Math.max(0, aDur - pDur);
    const overrunPct = cVal > 0 ? +(((fCost - cVal) / cVal) * 100).toFixed(1) : 0;

    const createdRecord = await prisma.contractorHistoricalProject.create({
      data: {
        contractorProfileId: req.params.id,
        projectName,
        sector,
        state: state || 'Pan-India',
        clientAgency,
        contractValueCrores: cVal,
        finalCostCrores: fCost,
        costOverrunPercent: overrunPct,
        plannedDurationMonths: pDur,
        actualDurationMonths: aDur,
        delayMonths: +delayM.toFixed(1),
        completionYear: completionYear ? parseInt(completionYear, 10) : new Date().getFullYear(),
        completionStatus: completionStatus || (delayM > 0 ? 'COMPLETED_WITH_DELAY' : 'COMPLETED_ON_TIME'),
        qualityGrade: qualityGrade || 'GOOD',
        safetyIncidents: safetyIncidents ? parseInt(safetyIncidents, 10) : 0,
        performanceSummary
      }
    });

    // Recompute contractor profile aggregated metrics
    const allHistory = await prisma.contractorHistoricalProject.findMany({
      where: { contractorProfileId: req.params.id }
    });

    const count = allHistory.length;
    let sumOverrun = 0;
    let sumDelay = 0;
    let onTime = 0;

    for (const h of allHistory) {
      sumOverrun += h.costOverrunPercent;
      sumDelay += h.delayMonths;
      if (h.delayMonths <= 0.5) onTime++;
    }

    const avgOverrun = +(sumOverrun / count).toFixed(1);
    const avgDelay = +(sumDelay / count).toFixed(1);
    const onTimeRate = +((onTime / count) * 100).toFixed(1);

    // Dynamic risk score calculation
    let calculatedRisk = (avgOverrun * 0.4) + (avgDelay * 2.5) + ((100 - onTimeRate) * 0.3);
    calculatedRisk = Math.min(100, Math.max(5, +calculatedRisk.toFixed(1)));

    const contractor = await prisma.contractorProfile.findUnique({ where: { id: req.params.id } });
    const newGrade = calculateSafetyGrade(calculatedRisk, contractor?.blacklisted || false);

    await prisma.contractorProfile.update({
      where: { id: req.params.id },
      data: {
        totalProjectsCompleted: count,
        historicalCostOverrunAvg: avgOverrun,
        historicalDelayAvgMonths: avgDelay,
        onTimeCompletionRate: onTimeRate,
        riskScore: calculatedRisk,
        safetyRating: newGrade
      }
    });

    return res.status(201).json({ message: 'Historical project added and contractor metrics recalibrated', record: createdRecord });
  } catch (error: any) {
    console.error('Error adding historical project:', error);
    return res.status(500).json({ error: error.message || 'Failed to add historical project' });
  }
});

// POST /api/contractor-portfolio/assign-project - Assign project / package to contractor
router.post('/assign-project', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      contractorProfileId,
      projectId,
      projectCode,
      packageTitle,
      allocatedBudgetCrores,
      assignedDate,
      targetCompletionDate,
      notes
    } = req.body;

    let targetProjectId = projectId;
    if (!targetProjectId && projectCode) {
      const proj = await prisma.project.findUnique({ where: { projectCode: parseInt(projectCode, 10) } });
      if (!proj) return res.status(404).json({ error: `Project code ${projectCode} not found` });
      targetProjectId = proj.id;
    }

    if (!contractorProfileId || !targetProjectId) {
      return res.status(400).json({ error: 'Contractor Profile ID and Project ID/Code are required.' });
    }

    const contractor = await prisma.contractorProfile.findUnique({
      where: { id: contractorProfileId },
      include: { assignments: { where: { status: 'ACTIVE' } } }
    });

    if (!contractor) return res.status(404).json({ error: 'Contractor profile not found' });
    if (contractor.blacklisted) {
      return res.status(400).json({ error: 'Cannot assign project to a blacklisted contractor.' });
    }

    const assignment = await prisma.contractorProjectAssignment.create({
      data: {
        contractorProfileId,
        projectId: targetProjectId,
        packageTitle: packageTitle || 'General EPC Infrastructure Construction Package',
        allocatedBudgetCrores: allocatedBudgetCrores ? parseFloat(allocatedBudgetCrores) : 100.0,
        assignedDate: assignedDate || new Date().toISOString().split('T')[0],
        targetCompletionDate: targetCompletionDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
        status: 'ACTIVE',
        performanceScore: 85.0,
        notes
      },
      include: {
        project: true,
        contractorProfile: true
      }
    });

    // Update active projects count on contractor
    await prisma.contractorProfile.update({
      where: { id: contractorProfileId },
      data: { totalProjectsOngoing: contractor.assignments.length + 1 }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'ASSIGN_PROJECT_CONTRACTOR',
          entity: 'ContractorProjectAssignment',
          entityId: assignment.id,
          metadataJson: JSON.stringify({
            contractor: contractor.companyName,
            project: assignment.project.projectName,
            budget: assignment.allocatedBudgetCrores
          })
        }
      });
    }

    return res.status(201).json({ message: 'Project successfully assigned to contractor', assignment });
  } catch (error: any) {
    console.error('Error assigning project:', error);
    return res.status(500).json({ error: error.message || 'Failed to assign project' });
  }
});

// POST /api/contractor-portfolio/evaluate-safety - Comprehensive Decision Engine: "Will it be safe to give this project to this contractor?"
router.post('/evaluate-safety', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      contractorProfileId,
      projectId,
      projectCode,
      customTargetCostCrores,
      customTargetSector,
      customTargetDurationMonths,
      complexityLevel // 'STANDARD', 'HIGH', 'CRITICAL'
    } = req.body;

    if (!contractorProfileId) {
      return res.status(400).json({ error: 'contractorProfileId is required for safety evaluation' });
    }

    const contractor = await prisma.contractorProfile.findUnique({
      where: { id: contractorProfileId },
      include: {
        historyRecords: true,
        assignments: { where: { status: 'ACTIVE' } }
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor profile not found' });
    }

    // Resolve target project information (from DB or custom inputs)
    let targetProject: any = null;
    let targetCost = customTargetCostCrores ? parseFloat(customTargetCostCrores) : 250.0;
    let targetSector = customTargetSector || 'Roads & Highways';
    let targetDuration = customTargetDurationMonths ? parseFloat(customTargetDurationMonths) : 24.0;
    let existingProjectRiskProb = 0.35;
    let existingProjectDelayPrediction = 'Low (<=3 mo)';
    let existingProjectCostPrediction = 'No overrun';

    if (projectId || projectCode) {
      targetProject = await prisma.project.findFirst({
        where: projectId ? { id: projectId } : { projectCode: parseInt(projectCode, 10) },
        include: {
          snapshots: { orderBy: { reportDate: 'desc' }, take: 1 },
          predictions: { orderBy: { createdAt: 'desc' }, take: 1, include: { drivers: true } }
        }
      });

      if (targetProject) {
        targetSector = targetProject.sector;
        const snap = targetProject.snapshots[0];
        if (snap) {
          targetCost = snap.revisedCost || snap.originalCost || targetCost;
          targetDuration = snap.plannedDuration || targetDuration;
        }
        const pred = targetProject.predictions[0];
        if (pred) {
          existingProjectRiskProb = pred.riskProbability;
          existingProjectDelayPrediction = pred.delayPrediction;
          existingProjectCostPrediction = pred.costPrediction;
        }
      }
    }

    // -------------------------------------------------------------
    // MULTI-DIMENSIONAL CONTRACTOR SAFETY & SUITABILITY MATRIX
    // -------------------------------------------------------------
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];

    // 1. Blacklist Check
    if (contractor.blacklisted) {
      const evaluation = await prisma.contractorEvaluation.create({
        data: {
          contractorProfileId: contractor.id,
          projectId: targetProject?.id || null,
          evaluatorUserId: req.user?.id || null,
          safetyVerdict: 'REJECTED',
          suitabilityScore: 0.0,
          capacityUtilizationPercent: 0.0,
          sectorExperienceMatch: false,
          predictedDelayRisk: 'SEVERE',
          predictedOverrunRisk: 'MAJOR',
          riskFactorsJson: JSON.stringify(['Contractor is officially BLACKLISTED / DEBARRED due to compliance or performance failure.']),
          recommendationsJson: JSON.stringify(['STRICTLY REJECT BID. Do not award any public infrastructure work.'])
        }
      });
      return res.json({
        evaluation,
        verdict: 'REJECTED',
        suitabilityScore: 0,
        isSafe: false,
        summary: 'Contractor is Blacklisted. Under no circumstances should work be awarded.'
      });
    }

    // 2. Sector & Domain Match
    const specs = contractor.specialization.toLowerCase();
    const tSectorLower = targetSector.toLowerCase();
    const historySectorMatch = contractor.historyRecords.some(h => 
      h.sector.toLowerCase().includes(tSectorLower) || tSectorLower.includes(h.sector.toLowerCase())
    );
    const textSectorMatch = specs.includes(tSectorLower) || (
      (tSectorLower.includes('road') || tSectorLower.includes('highway')) && (specs.includes('road') || specs.includes('highway'))
    ) || (
      (tSectorLower.includes('air') || tSectorLower.includes('aviation')) && (specs.includes('air') || specs.includes('aviation'))
    ) || (
      (tSectorLower.includes('rail')) && (specs.includes('rail'))
    ) || (
      (tSectorLower.includes('power')) && (specs.includes('power'))
    );

    const sectorExperienceMatch = historySectorMatch || textSectorMatch;
    let sectorScore = sectorExperienceMatch ? 95 : 40;

    if (sectorExperienceMatch) {
      strengths.push(`Proven sector expertise in ${targetSector} with verified past track record.`);
    } else {
      riskFactors.push(`Lack of established track record in ${targetSector}. Vendor core specialization is '${contractor.specialization}'.`);
      recommendations.push(`Require mandatory technical joint venture (JV) or specialized engineering supervision for ${targetSector}.`);
    }

    // 3. Financial Scale & Budget Fit
    const largestPastProject = contractor.historyRecords.reduce((max, h) => Math.max(max, h.contractValueCrores), 0);
    const capacityRatio = targetCost / (contractor.financialCapacityCrores || 500);
    let financialFitScore = 90;

    if (targetCost > contractor.financialCapacityCrores) {
      financialFitScore = 30;
      riskFactors.push(`Project budget (₹${targetCost.toFixed(1)} Cr) exceeds contractor's certified financial capacity (₹${contractor.financialCapacityCrores.toFixed(1)} Cr).`);
      recommendations.push('Impose enhanced performance security / 100% additional bank guarantee.');
    } else if (capacityRatio > 0.6) {
      financialFitScore = 65;
      riskFactors.push(`Project scale (₹${targetCost.toFixed(1)} Cr) absorbs ${Math.round(capacityRatio * 100)}% of contractor total financial bandwidth.`);
      recommendations.push('Establish escrow-based milestone disbursement to safeguard cash flows.');
    } else {
      strengths.push(`Comfortable financial headroom: Project cost utilizes ${Math.round(capacityRatio * 100)}% of total capacity.`);
    }

    // 4. Concurrency & Active Workload Bandwidth
    const activeAssignments = contractor.assignments.length;
    const capacityUtilization = contractor.maxConcurrentProjects > 0
      ? (activeAssignments / contractor.maxConcurrentProjects) * 100
      : 50;

    let capacityScore = 95;
    if (activeAssignments >= contractor.maxConcurrentProjects) {
      capacityScore = 35;
      riskFactors.push(`Severe workload bottleneck: Contractor currently has ${activeAssignments} active projects (100% capacity limit reached: ${contractor.maxConcurrentProjects} max).`);
      recommendations.push('Delay work order award until at least 1 ongoing project is formally commissioned.');
    } else if (capacityUtilization >= 75) {
      capacityScore = 68;
      riskFactors.push(`High concurrent workload: Running ${activeAssignments}/${contractor.maxConcurrentProjects} active contracts.`);
      recommendations.push('Mandate dedicated on-site project management team separate from existing packages.');
    } else {
      strengths.push(`Available execution bandwidth: ${contractor.maxConcurrentProjects - activeAssignments} concurrent slots available.`);
    }

    // 5. Historical Delay Tendencies
    let scheduleScore = 90;
    let predictedDelayRisk: 'LOW' | 'MODERATE' | 'SEVERE' = 'LOW';
    if (contractor.historicalDelayAvgMonths > 10 || contractor.onTimeCompletionRate < 50) {
      scheduleScore = 30;
      predictedDelayRisk = 'SEVERE';
      riskFactors.push(`High historical schedule slippage: Average past delay is ${contractor.historicalDelayAvgMonths} months; on-time rate is only ${contractor.onTimeCompletionRate}%.`);
      recommendations.push('Institute strict bi-weekly liquidated damages penalty clauses for milestone lapses.');
    } else if (contractor.historicalDelayAvgMonths > 4 || contractor.onTimeCompletionRate < 75) {
      scheduleScore = 65;
      predictedDelayRisk = 'MODERATE';
      riskFactors.push(`Moderate historical delay trend (${contractor.historicalDelayAvgMonths} months avg delay).`);
      recommendations.push('Require 15-day critical path review with digital Gantt chart progress tracking.');
    } else {
      strengths.push(`Excellent on-time milestone delivery rate of ${contractor.onTimeCompletionRate}% in past works.`);
    }

    // 6. Historical Cost Overrun Discipline
    let costDisciplineScore = 90;
    let predictedOverrunRisk: 'LOW' | 'MODERATE' | 'MAJOR' = 'LOW';
    if (contractor.historicalCostOverrunAvg > 25) {
      costDisciplineScore = 30;
      predictedOverrunRisk = 'MAJOR';
      riskFactors.push(`Frequent budget escalation: Past projects show an average cost overrun of ${contractor.historicalCostOverrunAvg}%.`);
      recommendations.push('Freeze fixed-price contract with zero price-variation clause on non-statutory materials.');
    } else if (contractor.historicalCostOverrunAvg > 8) {
      costDisciplineScore = 65;
      predictedOverrunRisk = 'MODERATE';
      riskFactors.push(`Minor-to-moderate historical cost overrun tendency (${contractor.historicalCostOverrunAvg}% avg).`);
      recommendations.push('Conduct pre-award quantity estimation audit to prevent subsequent variation claims.');
    } else {
      strengths.push(`Strict cost control history: Average cost variation is only ${contractor.historicalCostOverrunAvg}%.`);
    }

    // 7. Quality and Safety Inspections
    if (contractor.qualityAuditScore < 70) {
      riskFactors.push(`Below-benchmark quality audit score (${contractor.qualityAuditScore}/100) from past field inspections.`);
      recommendations.push('Mandate third-party quality inspection (TPI) agency for concrete testing and QA/QC certification.');
    }

    // 8. Target Project Current Risk Factor
    if (existingProjectRiskProb > 0.65) {
      riskFactors.push(`Target Project already carries High ML Risk (${Math.round(existingProjectRiskProb * 100)}%) and requires exceptional execution discipline.`);
      recommendations.push('Assign a Senior Project Director and deploy daily IoT/drone monitoring.');
    }

    // Composite Suitability Score (0 - 100)
    const compositeScore = +(
      (sectorScore * 0.25) +
      (financialFitScore * 0.20) +
      (capacityScore * 0.20) +
      (scheduleScore * 0.20) +
      (costDisciplineScore * 0.15)
    ).toFixed(1);

    // Determine Final Safety Verdict
    let safetyVerdict: 'SAFE' | 'CONDITIONALLY_SAFE' | 'HIGH_RISK';
    let safetyLabel: string;
    let isSafe: boolean;

    const isOverloaded = activeAssignments >= contractor.maxConcurrentProjects;
    if (compositeScore >= 80 && riskFactors.length <= 1 && !isOverloaded) {
      safetyVerdict = 'SAFE';
      safetyLabel = 'SAFE & RECOMMENDED FOR AWARD';
      isSafe = true;
      if (recommendations.length === 0) {
        recommendations.push('Proceed with standard contract execution & routine field verification.');
      }
    } else if (compositeScore >= 58 && contractor.safetyRating !== 'HIGH_RISK') {
      safetyVerdict = 'CONDITIONALLY_SAFE';
      safetyLabel = 'CONDITIONALLY SAFE (MANDATORY SAFEGUARDS REQUIRED)';
      isSafe = true;
    } else {
      safetyVerdict = 'HIGH_RISK';
      safetyLabel = 'HIGH RISK / UNSAFE TO ALLOCATE';
      isSafe = false;
      recommendations.unshift('DO NOT ALLOCATE this package without senior steering committee clearance and substantial financial guarantees.');
    }

    // Save Evaluation Record
    const evaluation = await prisma.contractorEvaluation.create({
      data: {
        contractorProfileId: contractor.id,
        projectId: targetProject?.id || null,
        evaluatorUserId: req.user?.id || null,
        safetyVerdict,
        suitabilityScore: compositeScore,
        capacityUtilizationPercent: +capacityUtilization.toFixed(1),
        sectorExperienceMatch,
        predictedDelayRisk,
        predictedOverrunRisk,
        riskFactorsJson: JSON.stringify(riskFactors),
        recommendationsJson: JSON.stringify(recommendations)
      },
      include: {
        contractorProfile: true,
        project: true
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'EVALUATE_CONTRACTOR_SAFETY',
          entity: 'ContractorEvaluation',
          entityId: evaluation.id,
          metadataJson: JSON.stringify({
            contractor: contractor.companyName,
            project: targetProject ? targetProject.projectName : `Sector: ${targetSector}`,
            score: compositeScore,
            verdict: safetyVerdict
          })
        }
      });
    }

    return res.json({
      evaluation,
      verdict: safetyVerdict,
      verdictLabel: safetyLabel,
      suitabilityScore: compositeScore,
      isSafe,
      contractor: {
        id: contractor.id,
        companyName: contractor.companyName,
        registrationNumber: contractor.registrationNumber,
        safetyRating: contractor.safetyRating,
        riskScore: contractor.riskScore,
        specialization: contractor.specialization,
        financialCapacityCrores: contractor.financialCapacityCrores,
        activeProjects: activeAssignments,
        maxConcurrentProjects: contractor.maxConcurrentProjects,
        capacityUtilizationPercent: +capacityUtilization.toFixed(1),
        historicalCostOverrunAvg: contractor.historicalCostOverrunAvg,
        historicalDelayAvgMonths: contractor.historicalDelayAvgMonths,
        onTimeCompletionRate: contractor.onTimeCompletionRate,
        qualityAuditScore: contractor.qualityAuditScore
      },
      targetProject: {
        projectName: targetProject ? targetProject.projectName : 'New Infrastructure Tender Package',
        sector: targetSector,
        costCrores: targetCost,
        plannedDurationMonths: targetDuration,
        existingRiskProb: existingProjectRiskProb,
        predictedDelay: existingProjectDelayPrediction,
        predictedCostOverrun: existingProjectCostPrediction
      },
      dimensions: {
        sectorScore,
        financialFitScore,
        capacityScore,
        scheduleScore,
        costDisciplineScore
      },
      strengths,
      riskFactors,
      recommendations
    });
  } catch (error: any) {
    console.error('Error evaluating contractor safety:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate contractor safety' });
  }
});

export default router;
