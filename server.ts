import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { ordersRouter } from './server/routes/orders.js';
import { productRouter } from './server/routes/product.js';
import { settingsRouter } from './server/routes/settings.js';
import { variantsRouter } from './server/routes/variants.js';
import { mediaRouter } from './server/routes/media.js';
import { ingredientsRouter } from './server/routes/ingredients.js';
import { benefitsRouter } from './server/routes/benefits.js';
import { nutritionRouter } from './server/routes/nutrition.js';
import { reviewsRouter } from './server/routes/reviews.js';
import { faqsRouter } from './server/routes/faqs.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust reverse proxy (Cloud Run / AI Studio load balancer)
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security & CORS configuration
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for public order creation
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
  message: { error: 'Too many order requests from this IP. Please try again after 15 minutes.' },
});

// API Routes
app.use('/api/orders', orderLimiter, ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/benefits', benefitsRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/faqs', faqsRouter);

// Static uploads directory for media uploaded by admin
const publicUploads = path.resolve(__dirname, 'public/uploads');
app.use('/uploads', express.static(publicUploads));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const fs = await import('fs');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve and transform index.html for all non-API GET requests in dev mode
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Central Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'An internal server error occurred',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Khyber Gurr Co. server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
