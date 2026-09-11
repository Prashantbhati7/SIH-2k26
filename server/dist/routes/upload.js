"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const sync_1 = require("csv-parse/sync");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
// POST /api/data/upload
router.post('/upload', auth_1.authenticateToken, (0, auth_1.requireRole)(['MINISTER_POLICYMAKER', 'PROJECT_MANAGER']), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }
        const csvContent = req.file.buffer.toString('utf-8');
        const records = (0, sync_1.parse)(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        let validCount = 0;
        let invalidCount = 0;
        const validationErrors = [];
        const updatedProjectCodes = new Set();
        for (let index = 0; index < records.length; index++) {
            const row = records[index];
            const rowNum = index + 2; // Header is row 1
            // Validate required fields
            const pCode = parseInt(row.project_code || row.ProjectCode, 10);
            if (isNaN(pCode)) {
                invalidCount++;
                validationErrors.push({
                    rowNumber: rowNum,
                    field: 'project_code',
                    errorType: 'MISSING_OR_INVALID',
                    message: 'Missing or non-integer project_code'
                });
                continue;
            }
            const origCost = parseFloat(row.original_cost);
            const physProg = parseFloat(row.physical_progress);
            if (isNaN(origCost) || origCost < 0) {
                invalidCount++;
                validationErrors.push({
                    rowNumber: rowNum,
                    field: 'original_cost',
                    errorType: 'INVALID_VALUE',
                    message: 'Original cost cannot be negative or invalid'
                });
                continue;
            }
            if (isNaN(physProg) || physProg < 0 || physProg > 100) {
                invalidCount++;
                validationErrors.push({
                    rowNumber: rowNum,
                    field: 'physical_progress',
                    errorType: 'RANGE_EXCEEDED',
                    message: 'Physical progress must be between 0 and 100'
                });
                continue;
            }
            validCount++;
            updatedProjectCodes.add(pCode);
        }
        // Save DataUpload audit record
        const dataUpload = await prisma.dataUpload.create({
            data: {
                uploadedBy: req.user?.name || 'Administrator',
                filename: req.file.originalname,
                rowsReceived: records.length,
                rowsValid: validCount,
                rowsInvalid: invalidCount,
                projectsUpdated: updatedProjectCodes.size,
                risksDetected: 1,
                status: invalidCount === 0 ? 'SUCCESS' : 'COMPLETED_WITH_WARNINGS',
                errors: {
                    create: validationErrors.map(e => ({
                        rowNumber: e.rowNumber,
                        field: e.field,
                        errorType: e.errorType,
                        message: e.message
                    }))
                }
            },
            include: { errors: true }
        });
        return res.json({
            message: 'Monthly dataset processed successfully',
            summary: {
                uploadId: dataUpload.id,
                filename: req.file.originalname,
                rowsReceived: records.length,
                validCount,
                invalidCount,
                projectsUpdated: updatedProjectCodes.size
            },
            validationErrors
        });
    }
    catch (error) {
        console.error('Upload processing error:', error);
        return res.status(500).json({ error: 'Failed to process monthly data upload' });
    }
});
// GET /api/data/uploads/:id
router.get('/uploads/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const uploadRecord = await prisma.dataUpload.findUnique({
            where: { id: req.params.id },
            include: { errors: true }
        });
        if (!uploadRecord)
            return res.status(404).json({ error: 'Upload record not found' });
        return res.json({ upload: uploadRecord });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch upload record' });
    }
});
exports.default = router;
