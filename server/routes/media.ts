import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const mediaRouter = Router();

// GET /api/media - Get all media items
mediaRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const media = await prisma.productMedia.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, media });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/media/upload - Upload image or video file from device (base64)
mediaRouter.post('/upload', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataUrl, fileName } = req.body;
    if (!dataUrl) {
      res.status(400).json({ error: 'No file data provided' });
      return;
    }

    // Match data URI scheme (e.g. data:image/jpeg;base64,... or data:video/mp4;base64,...)
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a URL, return it
      if (dataUrl.startsWith('http') || dataUrl.startsWith('/')) {
        res.json({ success: true, url: dataUrl });
        return;
      }
      res.status(400).json({ error: 'Invalid file format' });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('quicktime')) ext = 'mov';

    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, fileName: safeName, mimeType });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload media file' });
  }
});

// POST /api/media - Add a new media item
mediaRouter.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, urduTitle, imageUrl, category, isHero, isVideo, sortOrder } = req.body;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image / Media URL is required' });
      return;
    }

    const count = await prisma.productMedia.count();

    const created = await prisma.productMedia.create({
      data: {
        productId: 'default-product',
        title: title || 'Artisanal Gurr Showcase',
        urduTitle: urduTitle || 'گُڑ کی تصویر',
        imageUrl: imageUrl.trim(),
        category: category || 'showcase',
        isHero: Boolean(isHero),
        isVideo: Boolean(isVideo),
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
      },
    });

    if (isHero) {
      await prisma.productMedia.updateMany({
        where: { id: { not: created.id } },
        data: { isHero: false },
      });
    }

    res.status(201).json({ success: true, media: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create media item' });
  }
});

// PATCH /api/media/:id - Update an existing media item
mediaRouter.patch('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder);
    if (data.isHero !== undefined) data.isHero = Boolean(data.isHero);
    if (data.isVideo !== undefined) data.isVideo = Boolean(data.isVideo);

    const updated = await prisma.productMedia.update({
      where: { id },
      data,
    });

    if (data.isHero) {
      await prisma.productMedia.updateMany({
        where: { id: { not: id } },
        data: { isHero: false },
      });
    }

    res.json({ success: true, media: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update media item' });
  }
});

// DELETE /api/media/:id - Delete media item
mediaRouter.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.productMedia.delete({ where: { id } });
    res.json({ success: true, message: 'Media item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media item' });
  }
});
