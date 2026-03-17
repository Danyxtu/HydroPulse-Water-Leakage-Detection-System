import { Router } from 'express';
import prisma from '../utils/prisma.js';

const router = Router();

// GET: Current Usage (Pie Chart)
router.get('/current', async (req, res) => {
  try {
    const zones = await prisma.zone.findMany();
    const totalVol = zones.reduce((acc, z) => acc + z.totalVolume, 0);
    
    const stats = zones.map(z => ({
      value: z.totalVolume || 0.1,
      color: z.zoneId === '1' ? '#FF8A8A' : (z.zoneId === '2' ? '#69B3FF' : '#86F086'),
      text: totalVol > 0 ? `${((z.totalVolume / totalVol) * 100).toFixed(1)}%` : '0%',
    }));

    res.json({
      success: true,
      data: {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estimatedVolume: `${totalVol.toFixed(1)}L`,
        stats: stats,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch usage' });
  }
});

export default router;
