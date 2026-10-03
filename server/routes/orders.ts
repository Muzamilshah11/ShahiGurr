import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';
import { generateUniqueOrderId } from '../utils/orderId.js';
import { sendOrderToGoogleSheets } from '../utils/googleSheets.js';

export const ordersRouter = Router();

// Order validation schema
const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Name is required (at least 2 characters)'),
  phone: z.string().min(10, 'Valid Pakistani phone number required (e.g. 03001234567)'),
  whatsapp: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Full street address is required'),
  deliveryInstructions: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  variantId: z.string().optional().nullable(),
  variantName: z.string().min(1, 'Product variant is required'),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive(),
  subtotal: z.number().nonnegative(),
  deliveryCharge: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  total: z.number().positive(),
  paymentMethod: z.enum(['cod', 'easypaisa', 'jazzcash', 'bank']).default('cod'),
  transactionId: z.string().optional().nullable(),
});

// POST /api/orders - Public customer checkout
ordersRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = createOrderSchema.parse(req.body);

    // Normalize phone number format (e.g. remove spaces, ensure standard 03xx format)
    let cleanPhone = validated.phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.startsWith('+92')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('92')) {
      cleanPhone = '0' + cleanPhone.slice(2);
    }

    let cleanWhatsapp = validated.whatsapp ? validated.whatsapp.replace(/[\s\-\(\)]/g, '') : null;
    if (cleanWhatsapp) {
      if (cleanWhatsapp.startsWith('+92')) {
        cleanWhatsapp = '0' + cleanWhatsapp.slice(3);
      } else if (cleanWhatsapp.startsWith('92')) {
        cleanWhatsapp = '0' + cleanWhatsapp.slice(2);
      }
    }

    const orderId = await generateUniqueOrderId();

    // Create in SQLite via Prisma
    const newOrder = await prisma.order.create({
      data: {
        orderId,
        customerName: validated.customerName.trim(),
        phone: cleanPhone,
        whatsapp: cleanWhatsapp || cleanPhone,
        city: validated.city.trim(),
        address: validated.address.trim(),
        deliveryInstructions: validated.deliveryInstructions?.trim() || null,
        email: validated.email?.trim() || null,
        variantId: validated.variantId || null,
        variantName: validated.variantName,
        quantity: validated.quantity,
        unitPrice: validated.unitPrice,
        subtotal: validated.subtotal,
        deliveryCharge: validated.deliveryCharge,
        discount: validated.discount,
        total: validated.total,
        paymentMethod: validated.paymentMethod,
        transactionId: validated.transactionId?.trim() || null,
        paymentStatus: validated.paymentMethod === 'cod' ? 'pending' : (validated.transactionId ? 'pending' : 'pending'),
        orderStatus: 'pending',
      },
    });

    // Create initial history log
    await prisma.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        status: 'pending',
        notes: `Order created online via website (${validated.paymentMethod.toUpperCase()})`,
        changedBy: 'Customer',
      },
    });

    // Non-blocking Google Sheets Dispatch (1.2s timeout, failure never blocks response)
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (settings?.sheetsWebhookUrl) {
      sendOrderToGoogleSheets(settings.sheetsWebhookUrl, {
        orderId: newOrder.orderId,
        customerName: newOrder.customerName,
        phone: newOrder.phone,
        whatsapp: newOrder.whatsapp,
        city: newOrder.city,
        address: newOrder.address,
        deliveryInstructions: newOrder.deliveryInstructions,
        variantName: newOrder.variantName,
        quantity: newOrder.quantity,
        unitPrice: newOrder.unitPrice,
        deliveryCharge: newOrder.deliveryCharge,
        discount: newOrder.discount,
        total: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        transactionId: newOrder.transactionId,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt.toISOString(),
      }).catch((err) => console.warn('Background sheets dispatch error:', err));
    }

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message, details: err.issues });
      return;
    }
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// GET /api/orders/track/:query - Public tracking by Order ID or Phone number
ordersRouter.get('/track/:query', async (req: Request, res: Response): Promise<void> => {
  try {
    let query = req.params.query.trim();
    if (!query) {
      res.status(400).json({ error: 'Please provide an Order ID or phone number' });
      return;
    }

    // Support numeric input like "482731" -> "ORDER-482731"
    if (/^\d{6}$/.test(query)) {
      query = `ORDER-${query}`;
    }

    // Clean phone query if applicable
    let cleanPhone = query.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.startsWith('+92')) cleanPhone = '0' + cleanPhone.slice(3);
    else if (cleanPhone.startsWith('92')) cleanPhone = '0' + cleanPhone.slice(2);

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderId: { equals: query } },
          { phone: { equals: cleanPhone } },
          { whatsapp: { equals: cleanPhone } },
        ],
      },
      include: {
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!orders || orders.length === 0) {
      res.status(404).json({ error: 'No order found matching this Order ID or phone number.' });
      return;
    }

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Order tracking error:', err);
    res.status(500).json({ error: 'Failed to retrieve tracking info' });
  }
});

// GET /api/orders - Admin list with pagination, search, status, and date filters
ordersRouter.get('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim() || '';
    const status = (req.query.status as string)?.trim() || 'all';
    const paymentStatus = (req.query.paymentStatus as string)?.trim() || 'all';
    const dateRange = (req.query.dateRange as string)?.trim() || 'all';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {};

    if (status && status !== 'all') {
      where.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    // Date range filtering
    const now = new Date();
    if (dateRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: todayStart };
    } else if (dateRange === 'yesterday') {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: yesterdayStart, lt: yesterdayEnd };
    } else if (dateRange === 'last7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (dateRange === 'last30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: thirtyDaysAgo };
    } else if (dateRange === 'custom' && startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Search filtering
    if (search) {
      where.OR = [
        { orderId: { contains: search } },
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
        { trackingNumber: { contains: search } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          statusHistory: {
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Calculate aggregated metrics for dashboard
    const allOrders = await prisma.order.findMany({
      select: { total: true, orderStatus: true, paymentStatus: true, createdAt: true },
    });

    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = allOrders.filter((o) => o.orderStatus === 'pending').length;
    const confirmedOrdersCount = allOrders.filter((o) => o.orderStatus === 'confirmed').length;
    const dispatchedOrdersCount = allOrders.filter((o) => o.orderStatus === 'dispatched').length;
    const deliveredOrdersCount = allOrders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelledOrdersCount = allOrders.filter((o) => o.orderStatus === 'cancelled').length;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= todayStart);
    const todayRevenue = todayOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        pendingCount: pendingOrdersCount,
        confirmedCount: confirmedOrdersCount,
        dispatchedCount: dispatchedOrdersCount,
        deliveredCount: deliveredOrdersCount,
        cancelledCount: cancelledOrdersCount,
        todayCount: todayOrders.length,
        todayRevenue,
        avgOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
      },
    });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/export - CSV export with UTF-8 BOM
ordersRouter.get('/export', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string)?.trim() || 'all';
    const where: any = {};
    if (status && status !== 'all') {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Build CSV with UTF-8 BOM
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'WhatsApp',
      'City',
      'Address',
      'Variant',
      'Quantity',
      'Unit Price (PKR)',
      'Subtotal (PKR)',
      'Delivery (PKR)',
      'Discount (PKR)',
      'Total (PKR)',
      'Payment Method',
      'Transaction ID',
      'Payment Status',
      'Order Status',
      'Courier',
      'Tracking Number',
      'Dispatch Notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map((o) => [
      escapeCsv(o.orderId),
      escapeCsv(new Date(o.createdAt).toLocaleString('en-PK')),
      escapeCsv(o.customerName),
      escapeCsv(o.phone),
      escapeCsv(o.whatsapp || o.phone),
      escapeCsv(o.city),
      escapeCsv(o.address),
      escapeCsv(o.variantName),
      escapeCsv(o.quantity),
      escapeCsv(o.unitPrice),
      escapeCsv(o.subtotal),
      escapeCsv(o.deliveryCharge),
      escapeCsv(o.discount),
      escapeCsv(o.total),
      escapeCsv(o.paymentMethod.toUpperCase()),
      escapeCsv(o.transactionId || ''),
      escapeCsv(o.paymentStatus.toUpperCase()),
      escapeCsv(o.orderStatus.toUpperCase()),
      escapeCsv(o.courierName || ''),
      escapeCsv(o.trackingNumber || ''),
      escapeCsv(o.dispatchNotes || ''),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="gurr_orders_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/orders/:orderId - Fetch single order
ordersRouter.get('/:orderId', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: req.params.orderId },
      include: {
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get order details' });
  }
});

// PATCH /api/orders/:orderId - Update order details / status / courier
ordersRouter.patch('/:orderId', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const {
      orderStatus,
      paymentStatus,
      courierName,
      trackingNumber,
      dispatchNotes,
      customerName,
      phone,
      whatsapp,
      city,
      address,
      deliveryInstructions,
      historyNote,
    } = req.body;

    const existing = await prisma.order.findUnique({ where: { orderId } });
    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { orderId },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(courierName !== undefined && { courierName }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(dispatchNotes !== undefined && { dispatchNotes }),
        ...(customerName && { customerName }),
        ...(phone && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(city && { city }),
        ...(address && { address }),
        ...(deliveryInstructions !== undefined && { deliveryInstructions }),
      },
      include: {
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    // Record history entry if status changed or explicit note provided
    if (orderStatus && orderStatus !== existing.orderStatus) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: existing.id,
          status: orderStatus,
          notes: historyNote || `Status updated to ${orderStatus}${courierName ? ` via ${courierName}` : ''}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}`,
          changedBy: req.adminUser?.username || 'Admin',
        },
      });
    } else if (historyNote) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: existing.id,
          status: updated.orderStatus,
          notes: historyNote,
          changedBy: req.adminUser?.username || 'Admin',
        },
      });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:orderId - Delete an order
ordersRouter.delete('/:orderId', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const existing = await prisma.order.findUnique({ where: { orderId } });

    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await prisma.order.delete({ where: { orderId } });
    res.json({ success: true, message: `Order ${orderId} deleted successfully.` });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// POST /api/orders/reset - Danger zone: reset demo orders
ordersRouter.post('/reset', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.order.deleteMany({});

    res.json({ success: true, message: 'All orders have been reset successfully.' });
  } catch (err) {
    console.error('Reset orders error:', err);
    res.status(500).json({ error: 'Failed to reset orders' });
  }
});
