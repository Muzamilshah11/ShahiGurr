import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const productRouter = Router();

// GET /api/product - Full product detail for customer & admin
productRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: 'default-product' },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
});

// PATCH /api/product - Update product details
productRouter.patch('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, urduName, tagline, urduTagline, description, urduDescription, active } = req.body;

    const updated = await prisma.product.upsert({
      where: { id: 'default-product' },
      update: {
        ...(name !== undefined && { name }),
        ...(urduName !== undefined && { urduName }),
        ...(tagline !== undefined && { tagline }),
        ...(urduTagline !== undefined && { urduTagline }),
        ...(description !== undefined && { description }),
        ...(urduDescription !== undefined && { urduDescription }),
        ...(active !== undefined && { active }),
      },
      create: {
        id: 'default-product',
        name: name || 'Premium Natural Gurr',
        urduName: urduName || 'پریمیم قدرتی گُڑ',
        tagline: tagline || 'Traditional Gurr with Premium Nuts',
        urduTagline: urduTagline || 'روایتی گُڑ معیاری میوہ جات کے ساتھ',
        description: description || 'Artisanal Pakistani Gurr',
        urduDescription: urduDescription || 'خالص روایتی دیسی گُڑ',
        active: active !== undefined ? active : true,
      },
    });

    res.json({ success: true, product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product details' });
  }
});
