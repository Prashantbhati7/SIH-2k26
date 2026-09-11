"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/audit
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
        return res.json({ logs });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});
exports.default = router;
