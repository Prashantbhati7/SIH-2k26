import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'vikasdrishti_secret_key_2026_sih';

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, ministry: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleCode: user.role.code,
      roleDisplayName: user.role.displayName,
      ministryId: user.ministryId,
      ministryName: user.ministry?.name || null,
      agencyId: user.agencyId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        metadataJson: JSON.stringify({ ip: req.ip, role: user.role.code })
      }
    });

    return res.json({
      token,
      user: payload
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to process login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, ministry: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleCode: user.role.code,
        roleDisplayName: user.role.displayName,
        ministryId: user.ministryId,
        ministryName: user.ministry?.name || null,
        agencyId: user.agencyId
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: req.user.id
      }
    });
  }
  return res.json({ message: 'Logged out successfully' });
});

export default router;
