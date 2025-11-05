import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/boookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const app = express();
const port = 3000;

async function startServer() {
  try {
    await connectDB();
    console.log("✅ Database connected");

    // ✅ STRIPE WEBHOOK FIRST (only raw body, no JSON parsing)
    app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

    // ✅ Other middlewares AFTER webhook (to avoid consuming raw body)
    app.use(cors());
    app.use(express.json());
    app.use(clerkMiddleware());

    // ✅ API routes
    app.get('/', (req, res) => res.send('Server is live!'));
    app.use('/api/inngest', serve({ client: inngest, functions }));
    app.use('/api/show', showRouter);
    app.use('/api/booking', bookingRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/user', userRouter);

    // ✅ Error handler
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    });

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();
