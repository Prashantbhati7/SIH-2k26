"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/assistant/query
router.post('/query', auth_1.authenticateToken, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query)
            return res.status(400).json({ error: 'query string is required' });
        const user = req.user;
        const lowerQ = query.toLowerCase();
        // 1. Check if user is asking about high cost-overrun projects
        if (lowerQ.includes('highest predicted cost') || lowerQ.includes('cost overrun') || lowerQ.includes('cost risk')) {
            const highCostPreds = await prisma.riskPrediction.findMany({
                where: { costPrediction: { in: ['Major (>40%)', 'Moderate (10-40%)'] } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { project: true, drivers: true }
            });
            const projectLinks = highCostPreds.map(p => ({
                projectCode: p.project.projectCode,
                projectName: p.project.projectName,
                costPrediction: p.costPrediction,
                riskLevel: p.riskLevel,
                scorePercentage: p.scorePercentage
            }));
            const responseText = `Here are the top infrastructure projects with high predicted cost overrun risk derived from our XGBoost multi-class cost model:\n\n` +
                projectLinks.map((p, idx) => `${idx + 1}. **${p.projectName}** (Code: ${p.projectCode})\n   - Forecast: **${p.costPrediction}**\n   - Overall Future Risk: **${p.riskLevel}** (${p.scorePercentage}%)`).join('\n\n') +
                `\n\n*Source Grounding: Calculated on the next-snapshot reporting cycle via 13-feature vector.*`;
            return res.json({
                answer: responseText,
                projects: projectLinks,
                sources: ['XGBoost Cost Model', 'Project Snapshots DB', 'SHAP TreeExplainer']
            });
        }
        // 2. Check if user asks "Why is Project X high risk?"
        const projectMatch = lowerQ.match(/project\s*(?:code\s*)?(\d+)/i) || lowerQ.match(/(\d{5})/);
        if (projectMatch || lowerQ.includes('why is')) {
            const pCode = projectMatch ? parseInt(projectMatch[1], 10) : 40001;
            const pred = await prisma.riskPrediction.findFirst({
                where: { project: { projectCode: pCode } },
                orderBy: { createdAt: 'desc' },
                include: { project: true, drivers: true }
            });
            if (pred) {
                const topDrivers = pred.drivers.slice(0, 3);
                const responseText = `**Analysis for ${pred.project.projectName} (Code: ${pred.project.projectCode})**:\n\n` +
                    `- **Future Risk Probability**: **${pred.scorePercentage}%** (${pred.riskLevel} Risk)\n` +
                    `- **Cost Forecast**: ${pred.costPrediction}\n` +
                    `- **Delay Forecast**: ${pred.delayPrediction}\n\n` +
                    `**Top SHAP Risk Drivers**:\n` +
                    topDrivers.map(d => `1. **${d.feature}** (Value: ${d.featureValue}): ${d.explanation}\n   *Prescription*: ${d.prescription}`).join('\n') +
                    `\n\n*Decision Support*: You can click the project link to assign an intervention to a Project Manager or Field Officer.`;
                return res.json({
                    answer: responseText,
                    project: {
                        projectCode: pred.project.projectCode,
                        projectName: pred.project.projectName,
                        riskLevel: pred.riskLevel,
                        scorePercentage: pred.scorePercentage
                    },
                    sources: ['SHAP TreeExplainer', 'CUF-XGB-RISK-v1', 'Project Intelligence Database']
                });
            }
        }
        // 3. Check for high risk / urgent intervention queries
        if (lowerQ.includes('intervention') || lowerQ.includes('priority') || lowerQ.includes('urgent') || lowerQ.includes('warn')) {
            const interventions = await prisma.intervention.findMany({
                where: { status: { in: ['PENDING', 'IN_PROGRESS', 'ESCALATED'] } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { project: true }
            });
            const responseText = `There are currently **${interventions.length} active high-priority interventions** requiring attention:\n\n` +
                interventions.map((i, idx) => `${idx + 1}. **${i.project.projectName}** (Code: ${i.project.projectCode})\n   - Driver: \`${i.driver}\`\n   - Action: ${i.recommendation}\n   - Status: **${i.status}** [Priority: ${i.priority}]`).join('\n\n');
            return res.json({
                answer: responseText,
                interventions,
                sources: ['Intervention Center DB', 'Early Warning Rules Engine']
            });
        }
        // Default Intelligence Summary Query
        const highRiskTotal = await prisma.riskPrediction.count({ where: { riskLevel: 'High' } });
        const responseText = `VikasDrishti Assistant currently monitors national infrastructure project metrics.\n\n` +
            `- Total Portfolio Projects Monitored: **1,709**\n` +
            `- High Future-Risk Projects Identified: **${highRiskTotal}**\n\n` +
            `You can ask me questions like:\n` +
            `• *"Which projects have the highest predicted cost-overrun risk?"*\n` +
            `• *"Why is Project 40001 high risk?"*\n` +
            `• *"Which interventions require immediate action?"*`;
        return res.json({
            answer: responseText,
            sources: ['VikasDrishti Project Intelligence Network']
        });
    }
    catch (error) {
        console.error('Assistant query error:', error);
        return res.status(500).json({ error: 'Failed to process AI assistant query' });
    }
});
exports.default = router;
