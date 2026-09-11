import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting VikasDrishti database seed...');

  // 1. Create Roles
  const ministerRole = await prisma.role.upsert({
    where: { code: 'MINISTER_POLICYMAKER' },
    update: {},
    create: { code: 'MINISTER_POLICYMAKER', displayName: 'Minister / Policymaker' }
  });

  const managerRole = await prisma.role.upsert({
    where: { code: 'PROJECT_MANAGER' },
    update: {},
    create: { code: 'PROJECT_MANAGER', displayName: 'Project Manager / Ministry' }
  });

  const fieldRole = await prisma.role.upsert({
    where: { code: 'FIELD_OFFICER' },
    update: {},
    create: { code: 'FIELD_OFFICER', displayName: 'Field Officer' }
  });

  const contractorRole = await prisma.role.upsert({
    where: { code: 'CONTRACTOR' },
    update: {},
    create: { code: 'CONTRACTOR', displayName: 'Contractor / Implementer' }
  });

  // 2. Create Ministry
  const roadMinistry = await prisma.ministry.upsert({
    where: { name: 'Ministry of Road Transport and Highways' },
    update: {},
    create: { name: 'Ministry of Road Transport and Highways' }
  });

  // 3. Create Password Hash for Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const ministerUser = await prisma.user.upsert({
    where: { email: 'minister@vikasdrishti.gov.in' },
    update: {},
    create: {
      name: 'Hon. Minister (Infrastructure)',
      email: 'minister@vikasdrishti.gov.in',
      passwordHash,
      roleId: ministerRole.id,
      ministryId: roadMinistry.id
    }
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@vikasdrishti.gov.in' },
    update: {},
    create: {
      name: 'Rajesh Kumar (Project Director)',
      email: 'manager@vikasdrishti.gov.in',
      passwordHash,
      roleId: managerRole.id,
      ministryId: roadMinistry.id
    }
  });

  const fieldUser = await prisma.user.upsert({
    where: { email: 'field@vikasdrishti.gov.in' },
    update: {},
    create: {
      name: 'Amit Sharma (Field Inspection Officer)',
      email: 'field@vikasdrishti.gov.in',
      passwordHash,
      roleId: fieldRole.id,
      ministryId: roadMinistry.id
    }
  });

  const contractorUser = await prisma.user.upsert({
    where: { email: 'contractor@vikasdrishti.gov.in' },
    update: {},
    create: {
      name: 'Vanguard Infrastructure Pvt Ltd',
      email: 'contractor@vikasdrishti.gov.in',
      passwordHash,
      roleId: contractorRole.id,
      ministryId: roadMinistry.id
    }
  });

  console.log('Seeded 4 standard demo role accounts successfully.');

  // 4. Ingest cleaned_dataset.csv
  const csvPath = path.join(process.cwd(), '../VikasDrishti_AI_Agent_Context_v2/cleaned_dataset.csv');
  if (fs.existsSync(csvPath)) {
    console.log(`Ingesting dataset from ${csvPath}...`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

    console.log(`Parsed ${records.length} records. Populating Projects & Snapshots...`);

    const projectMap = new Map<number, any>();

    // Group snapshots by project
    for (const r of records) {
      const pCode = parseInt(r.project_code, 10);
      if (isNaN(pCode)) continue;
      if (!projectMap.has(pCode)) {
        projectMap.set(pCode, {
          projectCode: pCode,
          projectId: r.project_id || `PRJ-${pCode}`,
          projectName: r.project_name || `Infrastructure Project ${pCode}`,
          sector: r.sector || 'Road Transport',
          state: r.state || 'Uttar Pradesh',
          agency: r.agency || 'NHAI',
          snapshots: []
        });
      }
      projectMap.get(pCode).snapshots.push(r);
    }

    // Insert Projects & Snapshots in batch limit (first 100 projects for high performance seed)
    let projectCount = 0;
    for (const [pCode, pData] of projectMap.entries()) {
      if (projectCount >= 120) break; // First 120 projects

      const createdProject = await prisma.project.create({
        data: {
          projectCode: pData.projectCode,
          projectId: pData.projectId,
          projectName: pData.projectName,
          ministryId: roadMinistry.id,
          sector: pData.sector,
          state: pData.state,
          agency: pData.agency,
          status: 'ACTIVE',
          latitude: pData.state === 'Uttar Pradesh' ? 27.1767 : (pData.state === 'Delhi' ? 28.6139 : 19.0760),
          longitude: pData.state === 'Uttar Pradesh' ? 78.0081 : (pData.state === 'Delhi' ? 77.2090 : 72.8777)
        }
      });

      // Sort snapshots by report_date
      const sortedSnaps = pData.snapshots.sort((a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());

      for (const snap of sortedSnaps) {
        const createdSnapshot = await prisma.projectSnapshot.create({
          data: {
            projectId: createdProject.id,
            reportDate: snap.report_date || '2026-03-01',
            originalCost: parseFloat(snap.original_cost) || 100.0,
            revisedCost: parseFloat(snap.revised_cost) || 120.0,
            cumulativeExpenditure: parseFloat(snap.cumulative_expenditure) || 50.0,
            physicalProgress: parseFloat(snap.physical_progress) || 45.0,
            expenditurePercentOriginal: parseFloat(snap.expenditure_percent_original) || 50.0,
            projectAgeMonths: parseFloat(snap.project_age_months) || 24.0,
            remainingPlannedDuration: parseFloat(snap.remaining_planned_duration) || 12.0,
            plannedDuration: parseFloat(snap.planned_duration) || 36.0,
            notStartedFlag: parseFloat(snap.not_started_flag) || 0.0,
            genuineOverdueFlag: parseFloat(snap.genuine_overdue_flag) || 0.0,
            ministryEncoded: parseFloat(snap.ministry_encoded) || 1.0,
            sectorEncoded: parseFloat(snap.sector_encoded) || 1.0,
            stateEncoded: parseFloat(snap.state_encoded) || 1.0,
            costOverrunPercent: parseFloat(snap.cost_overrun_percent) || 20.0,
            delayMonths: parseFloat(snap.delayMonths || snap.delay_months) || 6.0
          }
        });

        // Generate seeded RiskPrediction & SHAP Drivers for latest snapshot
        if (snap === sortedSnaps[sortedSnaps.length - 1]) {
          const isHighRisk = (createdProject.projectCode % 3 === 0);
          const isMajorCost = (createdProject.projectCode % 4 === 0);
          
          const riskProb = isHighRisk ? 0.82 : 0.28;
          const riskLevel = riskProb >= 0.66 ? 'High' : (riskProb >= 0.33 ? 'Medium' : 'Low');

          const riskPred = await prisma.riskPrediction.create({
            data: {
              projectId: createdProject.id,
              snapshotId: createdSnapshot.id,
              modelVersion: 'CUF-XGB-v1',
              costPrediction: isMajorCost ? 'Major (>40%)' : 'No overrun',
              costProbabilitiesJson: JSON.stringify({ 'No overrun': isMajorCost ? 0.1 : 0.8, 'Major (>40%)': isMajorCost ? 0.75 : 0.05 }),
              delayPrediction: isHighRisk ? 'Severe (>40 mo)' : 'Low (<=3 mo)',
              delayProbabilitiesJson: JSON.stringify({ 'Low (<=3 mo)': isHighRisk ? 0.05 : 0.85, 'Severe (>40 mo)': isHighRisk ? 0.80 : 0.02 }),
              riskProbability: riskProb,
              riskLevel,
              scorePercentage: Math.round(riskProb * 100),
              drivers: {
                create: [
                  {
                    modelType: 'RISK',
                    feature: 'physical_progress',
                    featureValue: createdSnapshot.physicalProgress,
                    shapValue: isHighRisk ? 1.45 : -0.85,
                    absShapValue: isHighRisk ? 1.45 : 0.85,
                    rank: 1,
                    direction: isHighRisk ? 'increasing risk' : 'reducing risk',
                    explanation: 'Current physical progress is influencing the prediction.',
                    prescription: 'Prioritize incomplete critical activities and introduce a short-term recovery plan.'
                  },
                  {
                    modelType: 'RISK',
                    feature: 'remaining_planned_duration',
                    featureValue: createdSnapshot.remainingPlannedDuration,
                    shapValue: 0.92,
                    absShapValue: 0.92,
                    rank: 2,
                    direction: 'increasing risk',
                    explanation: 'The remaining planned project duration is influencing the prediction.',
                    prescription: 'Prepare a recovery schedule and prioritize activities with limited remaining time.'
                  },
                  {
                    modelType: 'RISK',
                    feature: 'genuine_overdue_flag',
                    featureValue: createdSnapshot.genuineOverdueFlag,
                    shapValue: 0.76,
                    absShapValue: 0.76,
                    rank: 3,
                    direction: 'increasing risk',
                    explanation: "The project's overdue status is strongly influencing the prediction.",
                    prescription: 'Create an overdue recovery plan and monitor critical activities more frequently.'
                  }
                ]
              }
            }
          });

          // Generate Early Warning & Intervention if High Risk
          if (isHighRisk || isMajorCost) {
            const warning = await prisma.earlyWarning.create({
              data: {
                projectId: createdProject.id,
                predictionId: riskPred.id,
                category: isMajorCost ? 'COST_OVERRUN' : 'FUTURE_RISK',
                severity: isHighRisk ? 'CRITICAL' : 'HIGH',
                title: isHighRisk ? `Critical Forward Schedule Risk (${Math.round(riskProb * 100)}%)` : `Major Budget Escalation Warning`,
                message: `XGBoost model forecasts high future risk driven by physical progress delay and overdue milestone status.`,
                basis: `Risk Prob: ${Math.round(riskProb * 100)}% | Cost: ${isMajorCost ? 'Major (>40%)' : 'No overrun'} | Delay: Severe (>40 mo)`,
                status: 'ACTION_ASSIGNED'
              }
            });

            await prisma.intervention.create({
              data: {
                projectId: createdProject.id,
                warningId: warning.id,
                driver: 'physical_progress',
                recommendation: 'Prioritize incomplete critical activities and introduce a short-term recovery plan.',
                priority: 'HIGH',
                assignedRole: 'FIELD_OFFICER',
                assignedUserId: fieldUser.id,
                deadline: '2026-03-25',
                status: 'IN_PROGRESS',
                remarks: 'Assigned to Field Officer Amit Sharma for site inspection.'
              }
            });
          }
        }
      }

      projectCount++;
    }

    console.log(`Ingested and seeded ${projectCount} projects with full ML prediction snapshots & warnings.`);

    // Seed Core Vertical Slice Project (Code 40001)
    const demoProject = await prisma.project.findUnique({ where: { projectCode: 40001 } });
    if (demoProject) {
      await prisma.contractorTask.createMany({
        data: [
          {
            projectId: demoProject.id,
            contractorId: contractorUser.id,
            task: 'Site Excavation & Foundation Piling',
            target: 100,
            completed: 85,
            deadline: '2026-03-20',
            status: 'IN_PROGRESS',
            remarks: 'Substructure piling near completion.'
          },
          {
            projectId: demoProject.id,
            contractorId: contractorUser.id,
            task: 'Terminal Building Reinforced Concrete Superstructure',
            target: 100,
            completed: 40,
            deadline: '2026-04-15',
            status: 'IN_PROGRESS',
            remarks: 'Casting level 2 slab columns.'
          }
        ]
      });

      await prisma.monthlyTarget.createMany({
        data: [
          { projectId: demoProject.id, contractorId: contractorUser.id, month: '2026-01', target: 20, achieved: 18 },
          { projectId: demoProject.id, contractorId: contractorUser.id, month: '2026-02', target: 25, achieved: 22 },
          { projectId: demoProject.id, contractorId: contractorUser.id, month: '2026-03', target: 30, achieved: 28 }
        ]
      });

      await prisma.milestone.createMany({
        data: [
          { projectId: demoProject.id, name: 'Foundation Completion', plannedDate: '2026-02-15', actualDate: '2026-02-28', status: 'COMPLETED' },
          { projectId: demoProject.id, name: 'Superstructure Slab Casting', plannedDate: '2026-03-30', actualDate: null, status: 'IN_PROGRESS' },
          { projectId: demoProject.id, name: 'MEP Installation', plannedDate: '2026-05-15', actualDate: null, status: 'NOT_STARTED' }
        ]
      });

      await prisma.fieldUpdate.create({
        data: {
          projectId: demoProject.id,
          fieldOfficerId: fieldUser.id,
          updateDate: '2026-03-10',
          physicalProgress: 38.35,
          milestoneStatus: 'ON_TRACK',
          issueType: 'MATERIAL_SUPPLY',
          issueDescription: 'Temporary cement supply bottleneck resolved by site engineer.',
          evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7',
          remarks: 'Verified site progress matches 38.35% physical report.',
          verificationStatus: 'VERIFIED'
        }
      });
      console.log('Seeded demo task, milestone, and field update records for project 40001.');
    }
  }

  console.log('VikasDrishti Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
