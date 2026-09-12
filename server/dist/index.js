"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const projects_1 = __importDefault(require("./routes/projects"));
const predictions_1 = __importDefault(require("./routes/predictions"));
const warnings_1 = __importDefault(require("./routes/warnings"));
const interventions_1 = __importDefault(require("./routes/interventions"));
const field_1 = __importDefault(require("./routes/field"));
const contractor_1 = __importDefault(require("./routes/contractor"));
const upload_1 = __importDefault(require("./routes/upload"));
const assistant_1 = __importDefault(require("./routes/assistant"));
const benchmark_1 = __importDefault(require("./routes/benchmark"));
const reports_1 = __importDefault(require("./routes/reports"));
const models_1 = __importDefault(require("./routes/models"));
const audit_1 = __importDefault(require("./routes/audit"));
const enrichment_1 = __importDefault(require("./routes/enrichment"));
const whatif_1 = __importDefault(require("./routes/whatif"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'VikasDrishti Backend API',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/projects', enrichment_1.default);
app.use('/api/projects', whatif_1.default);
app.use('/api/predictions', predictions_1.default);
app.use('/api/warnings', warnings_1.default);
app.use('/api/interventions', interventions_1.default);
app.use('/api/field', field_1.default);
app.use('/api/contractor', contractor_1.default);
app.use('/api/data', upload_1.default);
app.use('/api/assistant', assistant_1.default);
app.use('/api/benchmark', benchmark_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/models', models_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/enrichment', enrichment_1.default);
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`VikasDrishti Backend API listening on port ${PORT}`);
    console.log(`==================================================`);
});
