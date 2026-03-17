import { Router } from 'express';
import zoneRoutes from './zoneRoutes.js';
import usageRoutes from './monitoringRoutes.js';
import logRoutes from './logRoutes.js';
import commandRoutes from './commandRoutes.js';

const router = Router();

// Mount individual routes
router.use('/zones', zoneRoutes);
router.use('/usage', usageRoutes);
router.use('/logs', logRoutes);
router.use('/detection', commandRoutes);

// Health check inside the API router
router.get('/health', (req, res) => {
  res.json({ status: 'API online', timestamp: new Date() });
});

export default router;
