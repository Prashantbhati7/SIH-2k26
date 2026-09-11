import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/warnings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, severity, category } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (severity) where.severity = severity as string;
    if (category) where.category = category as string;

    const warnings = await prisma.earlyWarning.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      include: {
        project: true,
        interventions: true
      }
    });

    return res.json({ warnings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch warnings' });
  }
});

// PATCH /api/warnings/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const warning = await prisma.earlyWarning.findUnique({
      where: { id: req.params.id },
      include: { project: true, interventions: true }
    });
    if (!warning) return res.status(404).json({ error: 'Warning not found' });
    return res.json({ warning });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch warning detail' });
  }
});

// PATCH /api/warnings/:id/status
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const updated = await prisma.earlyWarning.update({
      where: { id: req.params.id },
      data: { status }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_WARNING_STATUS',
          entity: 'EarlyWarning',
          entityId: updated.id,
          metadataJson: JSON.stringify({ status })
        }
      });
    }

    return res.json({ message: 'Warning status updated', warning: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update warning status' });
  }
});

export default router;
