import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/audit
router.get('/', authenticateToken, requireRole(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
