import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const settingsRouter = Router();

// GET /api/settings - Store configuration
settingsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: 'default' },
      });
    }

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PATCH /api/settings - Admin update store configuration
settingsRouter.patch('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, updatedAt, ...updateData } = req.body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    res.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

// POST /api/settings/test-sheets - Test Google Sheets webhook
settingsRouter.post('/test-sheets', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      res.status(400).json({ error: 'Valid URL is required' });
      return;
    }

    const testPayload = {
      orderId: 'ORDER-TEST99',
      customerName: 'Khyber Gurr Test Customer',
      phone: '03001234567',
      city: 'Islamabad',
      address: 'Test Street, Sector F-6',
      variantName: '1kg Classic Pack',
      quantity: 1,
      unitPrice: 1199,
      deliveryCharge: 0,
      discount: 0,
      total: 1199,
      paymentMethod: 'COD',
      paymentStatus: 'TEST',
      orderStatus: 'TEST_PING',
      createdAt: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      res.json({ success: true, message: 'Google Sheets webhook test succeeded!' });
    } else {
      res.status(400).json({ error: `Webhook returned status ${response.status}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: `Connection failed: ${err.message || 'Timeout'}` });
  }
});
