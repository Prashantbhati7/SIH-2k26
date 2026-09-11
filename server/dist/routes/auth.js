"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'vikasdrishti_secret_key_2026_sih';
// POST /api/auth/login
router.post('/login', async (req, res) => {
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
        const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
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
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to process login' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// POST /api/auth/logout
router.post('/logout', auth_1.authenticateToken, async (req, res) => {
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
exports.default = router;
