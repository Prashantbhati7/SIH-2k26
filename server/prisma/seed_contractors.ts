import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedContractors() {
  console.log('--- Seeding Contractor Portfolio & History Records ---');

  // Find demo contractor user
  const contractorUser = await prisma.user.findUnique({
    where: { email: 'contractor@vikasdrishti.gov.in' }
  });

  // Find a few projects to link
  const p40001 = await prisma.project.findUnique({ where: { projectCode: 40001 } });
  const p40000 = await prisma.project.findUnique({ where: { projectCode: 40000 } });
  const allProjects = await prisma.project.findMany({ take: 20 });

  // 1. Vanguard Infrastructure (Linked to demo contractor login)
  const vanguard = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-VANG-2018-A1' },
    update: {},
    create: {
      userId: contractorUser ? contractorUser.id : null,
      companyName: 'Vanguard Infrastructure Pvt Ltd',
      registrationNumber: 'IND-VANG-2018-A1',
      contactPerson: 'Vikramaditya Singhania',
      contactEmail: 'contractor@vikasdrishti.gov.in',
      contactPhone: '+91 98112 34567',
      establishedYear: 2012,
      experienceYears: 14,
      specialization: 'Civil Aviation, Airport Terminals, Smart Superstructures & MEP',
      financialCapacityCrores: 1400.0,
      maxConcurrentProjects: 6,
      safetyRating: 'GRADE_A',
      riskScore: 14.2,
      historicalCostOverrunAvg: 3.4,
      historicalDelayAvgMonths: 1.6,
      onTimeCompletionRate: 92.5,
      qualityAuditScore: 94.8,
      totalProjectsCompleted: 14,
      totalProjectsOngoing: 2,
      blacklisted: false,
      notes: 'Premier aviation infrastructure vendor with exceptional track record in terminal building MEP and fast-track execution.',
      historyRecords: {
        create: [
          {
            projectName: 'Vijayawada International Airport Terminal Phase 1',
            sector: 'Civil Aviation',
            state: 'Andhra Pradesh',
            clientAgency: 'AAI',
            contractValueCrores: 246.0,
            finalCostCrores: 251.2,
            costOverrunPercent: 2.1,
            plannedDurationMonths: 24.0,
            actualDurationMonths: 25.5,
            delayMonths: 1.5,
            completionYear: 2023,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Delivered LEED Gold terminal building ahead of peak operational deadline with zero safety violations.'
          },
          {
            projectName: 'Dholera Greenfield International Airport - Cargo Complex',
            sector: 'Civil Aviation',
            state: 'Gujarat',
            clientAgency: 'AAI',
            contractValueCrores: 310.0,
            finalCostCrores: 318.5,
            costOverrunPercent: 2.7,
            plannedDurationMonths: 28.0,
            actualDurationMonths: 29.0,
            delayMonths: 1.0,
            completionYear: 2024,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'High-speed automated cargo terminal delivered with advanced BMS integration.'
          },
          {
            projectName: 'Bhopal Raja Bhoj Airport Apron Extension',
            sector: 'Civil Aviation',
            state: 'Madhya Pradesh',
            clientAgency: 'AAI',
            contractValueCrores: 88.0,
            finalCostCrores: 92.4,
            costOverrunPercent: 5.0,
            plannedDurationMonths: 14.0,
            actualDurationMonths: 16.2,
            delayMonths: 2.2,
            completionYear: 2022,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'GOOD',
            safetyIncidents: 0,
            performanceSummary: 'Slight delay caused by unseasonal monsoon flooding; completed under budget contingency.'
          }
        ]
      }
    }
  });

  // 2. Larsen & Toubro Infrastructure (L&T)
  const lt = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-LT-1946-AAA' },
    update: {},
    create: {
      companyName: 'Larsen & Toubro Infrastructure Ltd',
      registrationNumber: 'IND-LT-1946-AAA',
      contactPerson: 'S. N. Subrahmanyan',
      contactEmail: 'infra-contact@larsentoubro.com',
      contactPhone: '+91 22 6752 5656',
      establishedYear: 1946,
      experienceYears: 42,
      specialization: 'Mega Expressways, High-Speed Rail, Bridges & Elevated Corridors, Ports',
      financialCapacityCrores: 12500.0,
      maxConcurrentProjects: 18,
      safetyRating: 'GRADE_A_PLUS',
      riskScore: 7.8,
      historicalCostOverrunAvg: 1.5,
      historicalDelayAvgMonths: 0.8,
      onTimeCompletionRate: 96.8,
      qualityAuditScore: 98.4,
      totalProjectsCompleted: 54,
      totalProjectsOngoing: 5,
      blacklisted: false,
      notes: 'Tier-1 national engineering conglomerate with unmatched heavy civil engineering capabilities and proven financial resilience.',
      historyRecords: {
        create: [
          {
            projectName: 'Delhi-Mumbai Expressway Package 4 (Vadodara Section)',
            sector: 'Roads & Highways',
            state: 'Gujarat',
            clientAgency: 'NHAI',
            contractValueCrores: 1450.0,
            finalCostCrores: 1462.0,
            costOverrunPercent: 0.8,
            plannedDurationMonths: 36.0,
            actualDurationMonths: 35.5,
            delayMonths: 0.0,
            completionYear: 2023,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Paved 8-lane expressway package 15 days ahead of schedule using automated stringless paving.'
          },
          {
            projectName: 'Mumbai Trans Harbour Link (MTHL) - Package 1 Marine Viaduct',
            sector: 'Roads & Bridges',
            state: 'Maharashtra',
            clientAgency: 'MMRDA',
            contractValueCrores: 3200.0,
            finalCostCrores: 3245.0,
            costOverrunPercent: 1.4,
            plannedDurationMonths: 48.0,
            actualDurationMonths: 49.2,
            delayMonths: 1.2,
            completionYear: 2024,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'India longest sea bridge marine deck segment erected with orthotropic steel deck technology.'
          },
          {
            projectName: 'Western Dedicated Freight Corridor (Rewari-Madar)',
            sector: 'Railways',
            state: 'Haryana / Rajasthan',
            clientAgency: 'DFCCIL',
            contractValueCrores: 2800.0,
            finalCostCrores: 2840.0,
            costOverrunPercent: 1.4,
            plannedDurationMonths: 42.0,
            actualDurationMonths: 43.0,
            delayMonths: 1.0,
            completionYear: 2022,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Heavy haul electrified double-line track automated mechanized track laying.'
          }
        ]
      }
    }
  });

  // 3. Afcons Infrastructure
  const afcons = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-AFCON-1959-A' },
    update: {},
    create: {
      companyName: 'Afcons Infrastructure Limited',
      registrationNumber: 'IND-AFCON-1959-A',
      contactPerson: 'K. Subramanian',
      contactEmail: 'tenders@afcons.com',
      contactPhone: '+91 22 6719 1000',
      establishedYear: 1959,
      experienceYears: 34,
      specialization: 'Underground Tunnels, Metro Rail, Deep Foundation Piling, Marine Works',
      financialCapacityCrores: 4800.0,
      maxConcurrentProjects: 10,
      safetyRating: 'GRADE_A',
      riskScore: 16.5,
      historicalCostOverrunAvg: 4.8,
      historicalDelayAvgMonths: 2.4,
      onTimeCompletionRate: 88.0,
      qualityAuditScore: 93.0,
      totalProjectsCompleted: 35,
      totalProjectsOngoing: 3,
      blacklisted: false,
      notes: 'Specialist in challenging geotechnical terrains, deep tunneling, and critical river crossings.',
      historyRecords: {
        create: [
          {
            projectName: 'Chenab Rail Bridge Arch Substructure & Foundations',
            sector: 'Railways',
            state: 'Jammu & Kashmir',
            clientAgency: 'Northern Railway',
            contractValueCrores: 950.0,
            finalCostCrores: 1012.0,
            costOverrunPercent: 6.5,
            plannedDurationMonths: 48.0,
            actualDurationMonths: 52.0,
            delayMonths: 4.0,
            completionYear: 2022,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'World highest railway arch foundation anchored in complex Himalayan limestone.'
          },
          {
            projectName: 'Kolkata Underwater Metro Tunnel (East-West Corridor)',
            sector: 'Urban Transit',
            state: 'West Bengal',
            clientAgency: 'KMRCL',
            contractValueCrores: 780.0,
            finalCostCrores: 815.0,
            costOverrunPercent: 4.5,
            plannedDurationMonths: 36.0,
            actualDurationMonths: 37.8,
            delayMonths: 1.8,
            completionYear: 2023,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Pioneering sub-aqueous tunnel bore under Hooghly river with zero water ingress incidents.'
          }
        ]
      }
    }
  });

  // 4. Dilip Buildcon Ltd
  const dilip = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-DBL-1987-B' },
    update: {},
    create: {
      companyName: 'Dilip Buildcon Limited',
      registrationNumber: 'IND-DBL-1987-B',
      contactPerson: 'Devendra Jain',
      contactEmail: 'contracts@dilipbuildcon.co.in',
      contactPhone: '+91 755 402 9999',
      establishedYear: 1987,
      experienceYears: 22,
      specialization: 'National Highways, State Highways EPC, Mining Overburden, Urban flyovers',
      financialCapacityCrores: 3500.0,
      maxConcurrentProjects: 9,
      safetyRating: 'GRADE_B',
      riskScore: 28.5,
      historicalCostOverrunAvg: 7.6,
      historicalDelayAvgMonths: 4.2,
      onTimeCompletionRate: 79.5,
      qualityAuditScore: 86.4,
      totalProjectsCompleted: 31,
      totalProjectsOngoing: 4,
      blacklisted: false,
      notes: 'High fleet mobilization speed, occasional delay vulnerabilities during peak monsoon road surfacing.',
      historyRecords: {
        create: [
          {
            projectName: 'Bundelkhand Expressway Package 6 EPC',
            sector: 'Roads & Highways',
            state: 'Uttar Pradesh',
            clientAgency: 'UPEIDA',
            contractValueCrores: 820.0,
            finalCostCrores: 865.0,
            costOverrunPercent: 5.5,
            plannedDurationMonths: 28.0,
            actualDurationMonths: 31.5,
            delayMonths: 3.5,
            completionYear: 2022,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'GOOD',
            safetyIncidents: 1,
            performanceSummary: 'Completed 4-lane greenfield corridor; slight delay in final wearing course overlay.'
          },
          {
            projectName: 'NH-44 Nagpur-Betul 4-Laning Section',
            sector: 'Roads & Highways',
            state: 'Madhya Pradesh',
            clientAgency: 'NHAI',
            contractValueCrores: 590.0,
            finalCostCrores: 648.0,
            costOverrunPercent: 9.8,
            plannedDurationMonths: 24.0,
            actualDurationMonths: 29.0,
            delayMonths: 5.0,
            completionYear: 2023,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'AVERAGE',
            safetyIncidents: 0,
            performanceSummary: 'Delays caused by forest clearance and quarry licensing disputes.'
          }
        ]
      }
    }
  });

  // 5. Tata Projects Limited
  const tata = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-TATA-1979-A' },
    update: {},
    create: {
      companyName: 'Tata Projects Limited',
      registrationNumber: 'IND-TATA-1979-A',
      contactPerson: 'Vinayak Pai',
      contactEmail: 'inquiries@tataprojects.com',
      contactPhone: '+91 22 6625 5678',
      establishedYear: 1979,
      experienceYears: 38,
      specialization: 'Smart City Civil, Power Substations, High-Capacity Water Transmission, Rapid Rail',
      financialCapacityCrores: 6200.0,
      maxConcurrentProjects: 14,
      safetyRating: 'GRADE_A_PLUS',
      riskScore: 9.5,
      historicalCostOverrunAvg: 2.1,
      historicalDelayAvgMonths: 1.1,
      onTimeCompletionRate: 94.2,
      qualityAuditScore: 96.5,
      totalProjectsCompleted: 44,
      totalProjectsOngoing: 4,
      blacklisted: false,
      notes: 'Benchmark digital construction practices with strict EHS adherence and computerized supply chain tracking.',
      historyRecords: {
        create: [
          {
            projectName: 'New Central Vista Secretariat Buildings Phase 1',
            sector: 'Urban Infrastructure',
            state: 'Delhi',
            clientAgency: 'CPWD',
            contractValueCrores: 1200.0,
            finalCostCrores: 1215.0,
            costOverrunPercent: 1.25,
            plannedDurationMonths: 24.0,
            actualDurationMonths: 24.8,
            delayMonths: 0.8,
            completionYear: 2023,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Smart BMS enabled green architectural landmark delivered within rigorous security zone protocols.'
          },
          {
            projectName: 'Prayagraj 765kV High Voltage Power Transmission Hub',
            sector: 'Power',
            state: 'Uttar Pradesh',
            clientAgency: 'POWERGRID',
            contractValueCrores: 480.0,
            finalCostCrores: 489.0,
            costOverrunPercent: 1.9,
            plannedDurationMonths: 20.0,
            actualDurationMonths: 21.0,
            delayMonths: 1.0,
            completionYear: 2024,
            completionStatus: 'COMPLETED_ON_TIME',
            qualityGrade: 'EXCELLENT',
            safetyIncidents: 0,
            performanceSummary: 'Gas-insulated substation engineered with computerized SCADA telemetry.'
          }
        ]
      }
    }
  });

  // 6. Apex InfraVentures Corp (HIGH RISK / CAUTION VENDOR)
  const apex = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-APEX-2016-D' },
    update: {},
    create: {
      companyName: 'Apex InfraVentures Corp',
      registrationNumber: 'IND-APEX-2016-D',
      contactPerson: 'Manoj Bajpayee (Managing Partner)',
      contactEmail: 'contact@apexinfraventures.in',
      contactPhone: '+91 94120 88765',
      establishedYear: 2016,
      experienceYears: 6,
      specialization: 'Minor Earthmoving, Rural Roads, Drain Reconstruction',
      financialCapacityCrores: 160.0,
      maxConcurrentProjects: 3,
      safetyRating: 'HIGH_RISK',
      riskScore: 78.4,
      historicalCostOverrunAvg: 34.6,
      historicalDelayAvgMonths: 13.8,
      onTimeCompletionRate: 38.0,
      qualityAuditScore: 61.2,
      totalProjectsCompleted: 6,
      totalProjectsOngoing: 4,
      blacklisted: false,
      notes: 'CRITICAL CAUTION: Overleveraged working capital, repeated dispute notices from PWD, 3 active arbitration disputes.',
      historyRecords: {
        create: [
          {
            projectName: 'State Highway 18 Chandausi Bypass Realignment',
            sector: 'Roads & Highways',
            state: 'Uttar Pradesh',
            clientAgency: 'MoRTH',
            contractValueCrores: 140.0,
            finalCostCrores: 194.0,
            costOverrunPercent: 38.6,
            plannedDurationMonths: 18.0,
            actualDurationMonths: 33.0,
            delayMonths: 15.0,
            completionYear: 2023,
            completionStatus: 'TERMINATED',
            qualityGrade: 'POOR',
            safetyIncidents: 4,
            performanceSummary: 'Severe sub-base settlement faults, default notice served by superintending engineer; partial bank guarantee invoked.'
          },
          {
            projectName: 'District Coal Feeder Link Road Pkg 2',
            sector: 'Coal Infrastructure',
            state: 'Jharkhand',
            clientAgency: 'BCCL',
            contractValueCrores: 85.0,
            finalCostCrores: 112.0,
            costOverrunPercent: 31.8,
            plannedDurationMonths: 12.0,
            actualDurationMonths: 24.5,
            delayMonths: 12.5,
            completionYear: 2022,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'AVERAGE',
            safetyIncidents: 2,
            performanceSummary: 'Labor strikes and equipment downtime resulted in over 12 months delay.'
          }
        ]
      }
    }
  });

  // 7. National Bridge & Piling Corp (GRADE_C / CONDITIONAL)
  const nbc = await prisma.contractorProfile.upsert({
    where: { registrationNumber: 'IND-NBC-2005-C' },
    update: {},
    create: {
      companyName: 'National Bridge & Piling Corp',
      registrationNumber: 'IND-NBC-2005-C',
      contactPerson: 'Harish Chandra',
      contactEmail: 'info@natbridgepiling.com',
      contactPhone: '+91 522 234 5678',
      establishedYear: 2005,
      experienceYears: 16,
      specialization: 'River Bridges, Rail Over Bridges (ROB), Foundation Piling',
      financialCapacityCrores: 550.0,
      maxConcurrentProjects: 5,
      safetyRating: 'GRADE_C',
      riskScore: 44.0,
      historicalCostOverrunAvg: 12.8,
      historicalDelayAvgMonths: 5.6,
      onTimeCompletionRate: 67.5,
      qualityAuditScore: 78.5,
      totalProjectsCompleted: 16,
      totalProjectsOngoing: 3,
      blacklisted: false,
      notes: 'Adequate technical competence for medium river bridges, requires strict milestone escrow monitoring.',
      historyRecords: {
        create: [
          {
            projectName: 'Yamuna River 4-Lane Bridge Approach Viaduct',
            sector: 'Roads & Bridges',
            state: 'Uttar Pradesh',
            clientAgency: 'NHAI',
            contractValueCrores: 210.0,
            finalCostCrores: 236.0,
            costOverrunPercent: 12.4,
            plannedDurationMonths: 24.0,
            actualDurationMonths: 29.5,
            delayMonths: 5.5,
            completionYear: 2023,
            completionStatus: 'COMPLETED_WITH_DELAY',
            qualityGrade: 'GOOD',
            safetyIncidents: 1,
            performanceSummary: 'Well foundation sinking delayed by hard boulder strata; structurally sound upon load test.'
          }
        ]
      }
    }
  });

  // Seed Live Project Assignments
  if (p40001) {
    await prisma.contractorProjectAssignment.create({
      data: {
        contractorProfileId: vanguard.id,
        projectId: p40001.id,
        packageTitle: 'Main Terminal Building & Apron Expansion Package A-1',
        allocatedBudgetCrores: 231.85,
        assignedDate: '2024-07-01',
        targetCompletionDate: '2025-08-01',
        status: 'ACTIVE',
        performanceScore: 91.5,
        notes: 'Substructure complete, superstructure progressing at 85% planned velocity.'
      }
    });

    // Create Pre-Award Evaluation for Vanguard on 40001
    await prisma.contractorEvaluation.create({
      data: {
        contractorProfileId: vanguard.id,
        projectId: p40001.id,
        safetyVerdict: 'SAFE',
        suitabilityScore: 93.5,
        capacityUtilizationPercent: 33.3,
        sectorExperienceMatch: true,
        predictedDelayRisk: 'LOW',
        predictedOverrunRisk: 'LOW',
        riskFactorsJson: JSON.stringify([
          'Specialist in civil aviation terminal building works',
          'Adequate financial bandwidth (utilizing 33% of ₹1400 Cr cap)',
          'Zero fatal safety incidents across 14 completed projects'
        ]),
        recommendationsJson: JSON.stringify([
          'Recommended for direct work order award',
          'Maintain bi-weekly milestone inspection by Field Officer',
          'Link progress milestone payments to verified physical progress'
        ])
      }
    });
  }

  if (p40000) {
    await prisma.contractorProjectAssignment.create({
      data: {
        contractorProfileId: lt.id,
        projectId: p40000.id,
        packageTitle: 'Civil Aviation Research Organisation Phase-II Mega Complex',
        allocatedBudgetCrores: 246.0,
        assignedDate: '2022-07-01',
        targetCompletionDate: '2026-06-01',
        status: 'ACTIVE',
        performanceScore: 95.0,
        notes: 'High-tech testing labs and aero-hangars under erection.'
      }
    });
  }

  // Create an evaluation example for Apex on a high-value project demonstrating the SAFETY WARNING
  if (allProjects.length > 2) {
    const targetProject = allProjects[2];
    await prisma.contractorEvaluation.create({
      data: {
        contractorProfileId: apex.id,
        projectId: targetProject.id,
        safetyVerdict: 'HIGH_RISK',
        suitabilityScore: 32.0,
        capacityUtilizationPercent: 133.3,
        sectorExperienceMatch: false,
        predictedDelayRisk: 'SEVERE',
        predictedOverrunRisk: 'MAJOR',
        riskFactorsJson: JSON.stringify([
          'Overloaded capacity: currently running 4 active projects vs 3 project limit (133% capacity utilization)',
          'High historical cost overrun average (34.6%) across past work',
          'Significant average past delay (13.8 months delay)',
          'Lack of proven domain experience in high-complexity infrastructure'
        ]),
        recommendationsJson: JSON.stringify([
          'DO NOT AWARD high-value or critical-path packages to this vendor',
          'Require clearance of ongoing project backlog before considering future bids',
          'If legally mandated to award, impose 100% additional bank guarantee and weekly escrow audits'
        ])
      }
    });
  }

  console.log('Seeded 7 rich Contractor Profiles with complete history, assignments, and safety evaluations.');
}

if (require.main === module) {
  seedContractors()
    .catch((e) => {
      console.error('Contractor seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
