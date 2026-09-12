import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import projectRoutes from './routes/projects';
import predictionRoutes from './routes/predictions';
import warningRoutes from './routes/warnings';
import interventionRoutes from './routes/interventions';
import fieldRoutes from './routes/field';
import contractorRoutes from './routes/contractor';
import uploadRoutes from './routes/upload';
import assistantRoutes from './routes/assistant';
import benchmarkRoutes from './routes/benchmark';
import reportRoutes from './routes/reports';
import modelRoutes from './routes/models';
import auditRoutes from './routes/audit';
import enrichmentRoutes from './routes/enrichment';
import whatifRoutes from './routes/whatif';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VikasDrishti Backend API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', enrichmentRoutes);
app.use('/api/projects', whatifRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/warnings', warningRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/field', fieldRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/data', uploadRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/enrichment', enrichmentRoutes);

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`VikasDrishti Backend API listening on port ${PORT}`);
  console.log(`==================================================`);
});
