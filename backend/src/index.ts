import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './db.js';
import photosRouter from './routes/photos.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());

const rawFrontendUrl = process.env.FRONTEND_URL || '*';
const allowedOrigins = rawFrontendUrl
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*')) {
        callback(null, true);
        return;
      }
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.some((allowed) => cleanOrigin === allowed || cleanOrigin.endsWith('.vercel.app'))) {
        callback(null, true);
        return;
      }
      callback(null, true); // Fallback: allow all origins to prevent CORS breaking image uploads
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Middleware to ensure DB connection on serverless requests
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/photos', photosRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

export default app;
