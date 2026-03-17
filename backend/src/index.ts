import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { startMqttSync } from './services/mqttSync.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Start Services ---
startMqttSync();

// --- API Routes ---
app.use('/api', apiRouter);

// Root Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING AT http://192.168.254.184:${PORT}`);
});
