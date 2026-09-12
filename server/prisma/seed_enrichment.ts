import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEnrichmentDemoData() {
  console.log('Seeding Enrichment Intelligence candidate feature catalog...');

  const FULL_CATALOG = [
    {
      featureCode: 'PROGRESS_VELOCITY',
      featureName: 'Weekly Physical Progress Velocity',
      description: 'Change in physical progress percentage over a weekly reporting period.',
      targetRelevance: 'DELAY',
      collectionRole: 'FIELD_OFFICER',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: '% / Week',
      sourceType: 'FIELD_UPDATE',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'MILESTONE_SLIPPAGE_DAYS',
      featureName: 'Milestone Slippage Days',
      description: 'Difference between planned milestone completion date and current forecast/actual completion date.',
      targetRelevance: 'DELAY',
      collectionRole: 'FIELD_OFFICER',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: 'Days',
      sourceType: 'INSPECTION',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'ACTIVITY_COMPLETION_RATE',
      featureName: 'Activity Completion Rate',
      description: 'Completed planned execution activities relative to activities scheduled on the baseline plan.',
      targetRelevance: 'DELAY',
      collectionRole: 'CONTRACTOR',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: '% Completed',
      sourceType: 'CONTRACTOR_TASK',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'CRITICAL_ACTIVITY_STATUS',
      featureName: 'Critical Activity Execution Status',
      description: 'Current execution status of critical-path activities (On Track, Delayed, At Risk).',
      targetRelevance: 'DELAY',
      collectionRole: 'FIELD_OFFICER',
      cadence: 'WEEKLY',
      inputType: 'TEXT',
      unit: 'Status',
      sourceType: 'INSPECTION',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'SITE_STOPPAGE_DAYS',
      featureName: 'Site Stoppage Days',
      description: 'Number of full or partial site work stoppage days due to weather, ROW, or local disputes.',
      targetRelevance: 'RISK',
      collectionRole: 'FIELD_OFFICER',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: 'Days',
      sourceType: 'SITE_LOG',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'UNRESOLVED_ISSUE_AGE_DAYS',
      featureName: 'Unresolved Issue Age Days',
      description: 'Age in days of the oldest unresolved execution or site constraint issue.',
      targetRelevance: 'RISK',
      collectionRole: 'PROJECT_MANAGER',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: 'Days',
      sourceType: 'FIELD_UPDATE',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'PAYMENT_PENDING_DAYS',
      featureName: 'Contractor Payment Pending Days',
      description: 'Average days contractor RA bills remain unpaid past the due date.',
      targetRelevance: 'COST',
      collectionRole: 'CONTRACTOR',
      cadence: 'WEEKLY',
      inputType: 'NUMBER',
      unit: 'Days',
      sourceType: 'CONTRACTOR_TASK',
      sectorScope: 'ALL'
    },
    {
      featureCode: 'EXPENDITURE_PROGRESS_GAP',
      featureName: 'Expenditure vs Progress Variance Gap',
      description: 'Percentage difference between cumulative financial expenditure progression and physical progress.',
      targetRelevance: 'COST',
      collectionRole: 'PROJECT_MANAGER',
      cadence: 'MONTHLY',
      inputType: 'NUMBER',
      unit: '% Gap',
      sourceType: 'FIELD_UPDATE',
      sectorScope: 'ALL'
    }
  ];

  for (const item of FULL_CATALOG) {
    await prisma.enrichmentFeatureCatalog.upsert({
      where: { featureCode: item.featureCode },
      update: item,
      create: item
    });
  }

  const proj40001 = await prisma.project.findUnique({ where: { projectCode: 40001 } });
  const allCatalog = await prisma.enrichmentFeatureCatalog.findMany();

  if (proj40001 && allCatalog.length > 0) {
    const item1 = allCatalog.find(c => c.featureCode === 'MILESTONE_SLIPPAGE_DAYS') || allCatalog[0];
    const item2 = allCatalog.find(c => c.featureCode === 'PROGRESS_VELOCITY') || allCatalog[1];

    const rec1 = await prisma.enrichmentRecommendation.upsert({
      where: { id: 'rec_demo_40001_1' },
      update: { status: 'ACCEPTED', selected: true },
      create: {
        id: 'rec_demo_40001_1',
        projectId: proj40001.id,
        featureCatalogId: item1.id,
        triggerDriver: 'physical_progress',
        reason: 'Physical progress is a major SHAP driver. Milestone slippage magnitude is not directly observed in monthly CUF snapshots.',
        currentDataGap: 'Frequency and magnitude of milestone slippage between monthly cycles.',
        targetRelevance: 'DELAY',
        priority: 'HIGH',
        feasibility: 'HIGH',
        recommendationScore: 92.0,
        status: 'ACCEPTED',
        selected: true
      }
    });

    const rec2 = await prisma.enrichmentRecommendation.upsert({
      where: { id: 'rec_demo_40001_2' },
      update: { status: 'ACCEPTED', selected: true },
      create: {
        id: 'rec_demo_40001_2',
        projectId: proj40001.id,
        featureCatalogId: item2.id,
        triggerDriver: 'physical_progress',
        reason: 'Physical progress is a top risk driver. Weekly progress velocity provides early indication of work slowdowns.',
        currentDataGap: 'Interim weekly progress rate prior to monthly reporting.',
        targetRelevance: 'DELAY',
        priority: 'HIGH',
        feasibility: 'HIGH',
        recommendationScore: 88.0,
        status: 'ACCEPTED',
        selected: true
      }
    });

    const plan1 = await prisma.enrichmentCollectionPlan.upsert({
      where: { id: 'plan_demo_40001_1' },
      update: { status: 'ACTIVE' },
      create: {
        id: 'plan_demo_40001_1',
        projectId: proj40001.id,
        recommendationId: rec1.id,
        assignedRole: 'FIELD_OFFICER',
        cadence: 'WEEKLY',
        startDate: '2026-03-01',
        expectedObservations: 12,
        status: 'ACTIVE'
      }
    });

    const plan2 = await prisma.enrichmentCollectionPlan.upsert({
      where: { id: 'plan_demo_40001_2' },
      update: { status: 'ACTIVE' },
      create: {
        id: 'plan_demo_40001_2',
        projectId: proj40001.id,
        recommendationId: rec2.id,
        assignedRole: 'FIELD_OFFICER',
        cadence: 'WEEKLY',
        startDate: '2026-03-01',
        expectedObservations: 12,
        status: 'ACTIVE'
      }
    });

    await prisma.enrichmentObservation.upsert({
      where: { id: 'obs_demo_40001_1' },
      update: {},
      create: {
        id: 'obs_demo_40001_1',
        projectId: proj40001.id,
        featureCatalogId: item1.id,
        collectionPlanId: plan1.id,
        collectorUserId: 'field-user-id',
        observedAt: '2026-03-10',
        valueNumeric: 14.0,
        unit: 'Days',
        source: 'FIELD_INSPECTION',
        evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7',
        remarks: 'Milestone 2 delayed due to temporary cement supply delay on site.',
        verificationStatus: 'PENDING'
      }
    });

    await prisma.enrichmentObservation.upsert({
      where: { id: 'obs_demo_40001_2' },
      update: {},
      create: {
        id: 'obs_demo_40001_2',
        projectId: proj40001.id,
        featureCatalogId: item2.id,
        collectionPlanId: plan2.id,
        collectorUserId: 'field-user-id',
        observedAt: '2026-03-11',
        valueNumeric: 1.25,
        unit: '% / Week',
        source: 'FIELD_INSPECTION',
        evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7',
        remarks: 'Physical progress velocity measured at 1.25% for Week 2.',
        verificationStatus: 'PENDING'
      }
    });

    const covId = `${proj40001.id}_${item1.id}`;
    await prisma.enrichmentCoverage.upsert({
      where: { id: covId },
      update: { observedCount: 2, coveragePercent: 17.0 },
      create: {
        id: covId,
        projectId: proj40001.id,
        featureCatalogId: item1.id,
        period: '2026-Q1',
        expectedCount: 12,
        observedCount: 2,
        validCount: 2,
        missingCount: 10,
        coveragePercent: 17.0
      }
    });
  }

  console.log('Seeded demo candidate features:', await prisma.enrichmentFeatureCatalog.count());
}

seedEnrichmentDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
