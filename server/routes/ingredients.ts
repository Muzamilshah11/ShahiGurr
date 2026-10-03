import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const ingredientsRouter = Router();

// GET /api/ingredients
ingredientsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, ingredients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// GET /api/ingredients/all (admin)
ingredientsRouter.get('/all', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, ingredients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// POST /api/ingredients
ingredientsRouter.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, urduName, description, urduDescription, iconName, sortOrder, isActive } = req.body;
    const count = await prisma.ingredient.count();

    const created = await prisma.ingredient.create({
      data: {
        name,
        urduName,
        description,
        urduDescription,
        iconName: iconName || 'Sparkles',
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({ success: true, ingredient: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PATCH /api/ingredients/:id
ingredientsRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

    const updated = await prisma.ingredient.update({
      where: { id },
      data,
    });

    res.json({ success: true, ingredient: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// DELETE /api/ingredients/:id
ingredientsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.ingredient.delete({ where: { id } });
    res.json({ success: true, message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});
