import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/contractor/tasks
router.get('/tasks', authenticateToken, requireRole(['CONTRACTOR', 'PROJECT_MANAGER', 'MINISTER_POLICYMAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.contractorTask.findMany({
      orderBy: { deadline: 'asc' },
      include: { project: true }
    });

    const targets = await prisma.monthlyTarget.findMany({
      orderBy: { month: 'desc' },
      take: 12,
      include: { project: true }
    });

    const milestones = await prisma.milestone.findMany({
      orderBy: { plannedDate: 'asc' },
      include: { project: true }
    });

    return res.json({ tasks, targets, milestones });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch contractor tasks' });
  }
});

// PATCH /api/contractor/tasks/:id
router.patch('/tasks/:id', authenticateToken, requireRole(['CONTRACTOR', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const { completed, status, remarks } = req.body;

    const updateData: any = {};
    if (completed !== undefined) updateData.completed = parseFloat(completed);
    if (status) updateData.status = status;
    if (remarks) updateData.remarks = remarks;

    const updated = await prisma.contractorTask.update({
      where: { id: req.params.id },
      data: updateData,
      include: { project: true }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CONTRACTOR_TASK',
          entity: 'ContractorTask',
          entityId: updated.id,
          metadataJson: JSON.stringify({ completed, status })
        }
      });
    }

    return res.json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update contractor task' });
  }
});

export default router;
