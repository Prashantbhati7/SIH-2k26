"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/field/projects
router.get('/projects', auth_1.authenticateToken, (0, auth_1.requireRole)(['FIELD_OFFICER', 'PROJECT_MANAGER', 'MINISTER_POLICYMAKER']), async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            take: 20,
            include: {
                predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
                fieldUpdates: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        });
        return res.json({ projects });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch field officer projects' });
    }
});
// POST /api/field/updates
router.post('/updates', auth_1.authenticateToken, (0, auth_1.requireRole)(['FIELD_OFFICER', 'PROJECT_MANAGER']), async (req, res) => {
    try {
        const { projectId, updateDate, physicalProgress, milestoneStatus, issueType, issueDescription, evidenceUrl, remarks } = req.body;
        if (!projectId || !updateDate || physicalProgress === undefined) {
            return res.status(400).json({ error: 'projectId, updateDate, and physicalProgress are required' });
        }
        const officerId = req.user?.id || 'demo-field-id';
        const update = await prisma.fieldUpdate.create({
            data: {
                projectId,
                fieldOfficerId: officerId,
                updateDate,
                physicalProgress: parseFloat(physicalProgress),
                milestoneStatus: milestoneStatus || 'ON_TRACK',
                issueType: issueType || null,
                issueDescription: issueDescription || null,
                evidenceUrl: evidenceUrl || null,
                remarks: remarks || null,
                verificationStatus: 'VERIFIED'
            },
            include: { project: true, fieldOfficer: true }
        });
        if (req.user) {
            await prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'SUBMIT_FIELD_UPDATE',
                    entity: 'FieldUpdate',
                    entityId: update.id,
                    metadataJson: JSON.stringify({ projectId, physicalProgress, issueType })
                }
            });
        }
        return res.json({ message: 'Field update submitted successfully', update });
    }
    catch (error) {
        console.error('Submit field update error:', error);
        return res.status(500).json({ error: 'Failed to submit field update' });
    }
});
exports.default = router;
