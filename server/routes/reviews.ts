import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const reviewsRouter = Router();

// GET /api/reviews - List active reviews (public)
reviewsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/all - List all reviews (admin)
reviewsRouter.get('/all', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all reviews' });
  }
});

// POST /api/reviews - Submit review (public or admin)
reviewsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      urduCustomerName,
      city,
      urduCity,
      rating,
      comment,
      urduComment,
      isVerified,
      isDemo,
      dateText,
      isActive,
    } = req.body;

    if (!customerName || !city || !comment) {
      res.status(400).json({ error: 'Name, city, and review message are required' });
      return;
    }

    const count = await prisma.review.count();

    const created = await prisma.review.create({
      data: {
        customerName: customerName.trim(),
        urduCustomerName: urduCustomerName?.trim() || null,
        city: city.trim(),
        urduCity: urduCity?.trim() || null,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: comment.trim(),
        urduComment: urduComment?.trim() || null,
        isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
        isDemo: isDemo !== undefined ? Boolean(isDemo) : false,
        dateText: dateText || 'Just now',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: count + 1,
      },
    });

    res.status(201).json({ success: true, review: created });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PATCH /api/reviews/:id
reviewsRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.rating !== undefined) data.rating = Number(data.rating);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);
    if (data.isVerified !== undefined) data.isVerified = Boolean(data.isVerified);
    if (data.isDemo !== undefined) data.isDemo = Boolean(data.isDemo);
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);

    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    res.json({ success: true, review: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id
reviewsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});
