"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/warnings
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { status, severity, category } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (severity)
            where.severity = severity;
        if (category)
            where.category = category;
        const warnings = await prisma.earlyWarning.findMany({
            where,
            orderBy: { detectedAt: 'desc' },
            include: {
                project: true,
                interventions: true
            }
        });
        return res.json({ warnings });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch warnings' });
    }
});
// PATCH /api/warnings/:id
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const warning = await prisma.earlyWarning.findUnique({
            where: { id: req.params.id },
            include: { project: true, interventions: true }
        });
        if (!warning)
            return res.status(404).json({ error: 'Warning not found' });
        return res.json({ warning });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch warning detail' });
    }
});
// PATCH /api/warnings/:id/status
router.patch('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status)
            return res.status(400).json({ error: 'status is required' });
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update warning status' });
    }
});
exports.default = router;
