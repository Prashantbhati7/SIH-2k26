"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/interventions
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { status, priority } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        const interventions = await prisma.intervention.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                project: true,
                assignedUser: true,
                warning: true
            }
        });
        return res.json({ interventions });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch interventions' });
    }
});
// POST /api/interventions
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), async (req, res) => {
    try {
        const { projectId, warningId, driver, recommendation, priority, assignedRole, assignedUserId, deadline, remarks } = req.body;
        if (!projectId || !recommendation) {
            return res.status(400).json({ error: 'projectId and recommendation are required' });
        }
        const intervention = await prisma.intervention.create({
            data: {
                projectId,
                warningId: warningId || null,
                driver: driver || 'SHAP_TOP_DRIVER',
                recommendation,
                priority: priority || 'HIGH',
                assignedRole: assignedRole || 'FIELD_OFFICER',
                assignedUserId: assignedUserId || null,
                deadline: deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: assignedUserId ? 'IN_PROGRESS' : 'PENDING',
                remarks: remarks || 'Assigned via VikasDrishti Intelligence'
            },
            include: { project: true, assignedUser: true }
        });
        if (warningId) {
            await prisma.earlyWarning.update({
                where: { id: warningId },
                data: { status: 'ACTION_ASSIGNED' }
            });
        }
        if (req.user) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'CREATE_INTERVENTION',
                    entity: 'Intervention',
                    entityId: intervention.id,
                    metadataJson: JSON.stringify({ projectId, assignedUserId, priority })
                }
            });
        }
        return res.json({ message: 'Intervention created successfully', intervention });
    }
    catch (error) {
        console.error('Create intervention error:', error);
        return res.status(500).json({ error: 'Failed to create intervention' });
    }
});
// PATCH /api/interventions/:id
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { status, remarks, assignedUserId, priority, deadline } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (remarks)
            updateData.remarks = remarks;
        if (assignedUserId)
            updateData.assignedUserId = assignedUserId;
        if (priority)
            updateData.priority = priority;
        if (deadline)
            updateData.deadline = deadline;
        const updated = await prisma.intervention.update({
            where: { id: req.params.id },
            data: updateData,
            include: { project: true, assignedUser: true }
        });
        if (req.user) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'UPDATE_INTERVENTION',
                    entity: 'Intervention',
                    entityId: updated.id,
                    metadataJson: JSON.stringify({ status, remarks })
                }
            });
        }
        return res.json({ message: 'Intervention updated', intervention: updated });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update intervention' });
    }
});
exports.default = router;
