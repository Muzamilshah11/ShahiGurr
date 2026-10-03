import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const benefitsRouter = Router();

// GET /api/benefits
benefitsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const benefits = await prisma.benefit.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, benefits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

// GET /api/benefits/all (admin)
benefitsRouter.get('/all', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const benefits = await prisma.benefit.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, benefits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

// POST /api/benefits
benefitsRouter.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, urduTitle, description, urduDescription, iconName, sortOrder, isActive } = req.body;
    const count = await prisma.benefit.count();

    const created = await prisma.benefit.create({
      data: {
        title,
        urduTitle,
        description,
        urduDescription,
        iconName: iconName || 'CheckCircle',
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({ success: true, benefit: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create benefit' });
  }
});

// PATCH /api/benefits/:id
benefitsRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

    const updated = await prisma.benefit.update({
      where: { id },
      data,
    });

    res.json({ success: true, benefit: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update benefit' });
  }
});

// DELETE /api/benefits/:id
benefitsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.benefit.delete({ where: { id } });
    res.json({ success: true, message: 'Benefit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete benefit' });
  }
});
