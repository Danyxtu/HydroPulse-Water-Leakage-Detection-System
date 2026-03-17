import { Router } from 'express';
import prisma from '../utils/prisma.js';

const router = Router();

// GET: All Zones
router.get('/', async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { zoneId: 'asc' } });
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch zones' });
  }
});

// POST: Create a new Zone
router.post('/', async (req, res) => {
  try {
    const { zoneId, name, threshold } = req.body;
    const zone = await prisma.zone.create({
      data: { zoneId, name, threshold: threshold || 5.0, status: 'Inactive' },
    });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create zone' });
  }
});

// PATCH: Update a Zone
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, threshold } = req.body;
    const zone = await prisma.zone.update({
      where: { id },
      data: { name, threshold },
    });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update zone' });
  }
});

// DELETE: Remove a Zone
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.zone.delete({ where: { id } });
    res.json({ success: true, data: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete zone' });
  }
});

export default router;
