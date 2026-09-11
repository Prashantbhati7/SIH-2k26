"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/contractor/tasks
router.get('/tasks', auth_1.authenticateToken, (0, auth_1.requireRole)(['CONTRACTOR', 'PROJECT_MANAGER', 'MINISTER_POLICYMAKER']), async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch contractor tasks' });
    }
});
// PATCH /api/contractor/tasks/:id
router.patch('/tasks/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['CONTRACTOR', 'PROJECT_MANAGER']), async (req, res) => {
    try {
        const { completed, status, remarks } = req.body;
        const updateData = {};
        if (completed !== undefined)
            updateData.completed = parseFloat(completed);
        if (status)
            updateData.status = status;
        if (remarks)
            updateData.remarks = remarks;
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update contractor task' });
    }
});
exports.default = router;
