import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const faqsRouter = Router();

// GET /api/faqs - Public
faqsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// GET /api/faqs/all - Admin
faqsRouter.get('/all', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all FAQs' });
  }
});

// POST /api/faqs
faqsRouter.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, urduQuestion, answer, urduAnswer, sortOrder, isActive } = req.body;
    const count = await prisma.fAQ.count();

    const created = await prisma.fAQ.create({
      data: {
        question,
        urduQuestion,
        answer,
        urduAnswer,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({ success: true, faq: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// PATCH /api/faqs/:id
faqsRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

    const updated = await prisma.fAQ.update({
      where: { id },
      data,
    });

    res.json({ success: true, faq: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// DELETE /api/faqs/:id
faqsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});
