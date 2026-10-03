import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const variantsRouter = Router();

// GET /api/variants
variantsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, variants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
});

// POST /api/variants
variantsRouter.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      urduName,
      weight,
      price,
      originalPrice,
      discount,
      stock,
      badge,
      urduBadge,
      description,
      urduDescription,
      isDefault,
      isActive,
      sortOrder,
    } = req.body;

    const count = await prisma.productVariant.count();

    const created = await prisma.productVariant.create({
      data: {
        productId: 'default-product',
        name,
        urduName,
        weight,
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        discount: Number(discount || 0),
        stock: Number(stock || 100),
        badge: badge || null,
        urduBadge: urduBadge || null,
        description: description || null,
        urduDescription: urduDescription || null,
        isDefault: Boolean(isDefault),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
      },
    });

    // If marked default, unmark other defaults
    if (isDefault) {
      await prisma.productVariant.updateMany({
        where: { id: { not: created.id } },
        data: { isDefault: false },
      });
    }

    res.status(201).json({ success: true, variant: created });
  } catch (err) {
    console.error('Create variant error:', err);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// PATCH /api/variants/:id
variantsRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.originalPrice !== undefined) data.originalPrice = Number(data.originalPrice);
    if (data.discount !== undefined) data.discount = Number(data.discount);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
    if (data.isDefault !== undefined) data.isDefault = Boolean(data.isDefault);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
    });

    if (data.isDefault) {
      await prisma.productVariant.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    res.json({ success: true, variant: updated });
  } catch (err) {
    console.error('Update variant error:', err);
    res.status(500).json({ error: 'Failed to update variant' });
  }
});

// DELETE /api/variants/:id
variantsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.productVariant.delete({ where: { id } });
    res.json({ success: true, message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete variant' });
  }
});
