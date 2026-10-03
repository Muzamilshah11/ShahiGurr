import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const nutritionRouter = Router();

// GET /api/nutrition
nutritionRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    let nutrition = await prisma.nutrition.findUnique({
      where: { id: 'default-nutrition' },
    });

    if (!nutrition) {
      nutrition = await prisma.nutrition.create({
        data: { id: 'default-nutrition' },
      });
    }

    res.json({ success: true, nutrition });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nutrition info' });
  }
});

// PATCH /api/nutrition
nutritionRouter.patch('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await prisma.nutrition.upsert({
      where: { id: 'default-nutrition' },
      update: req.body,
      create: {
        id: 'default-nutrition',
        ...req.body,
      },
    });

    res.json({ success: true, nutrition: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update nutrition info' });
  }
});
