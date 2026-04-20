import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import residentRoutes from './routes/resident.routes';
import paymentRoutes from './routes/payment.routes';
import ticketRoutes from './routes/ticket.routes';
import announcementRoutes from './routes/announcement.routes';
import pollRoutes from './routes/poll.routes';
import adminRoutes from './routes/admin.routes';
import financeRoutes from './routes/finance.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import productionRoutes from './routes/production.routes';
import notificationRoutes from './routes/notification.routes';
import { startReminderScheduler } from './services/reminders.service';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://lobbix.co.il', 'https://www.lobbix.co.il']
      : ['http://localhost:3000', 'http://localhost:19006'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers (CSP off for inline UI)
app.use(cors()); // CORS

// Public pages routing:
//   /         → marketing landing page (landing.html)
//   /app      → the PWA (backend/public/index.html)
//   everything else → served by express.static from public/
const PUBLIC_DIR = path.resolve(__dirname, '../public');
app.get('/', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(PUBLIC_DIR, 'landing.html'));
});
app.get(['/app', '/app/'], (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
// Join-by-link: /join/CODE or /app/join/CODE both open the PWA with the
// invite code prefilled. The client inspects `location.pathname` in
// `detectJoinDeepLink()` and clears the URL afterwards.
app.get(['/join/:code', '/app/join/:code'], (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use(express.static(PUBLIC_DIR, {
  etag: false,
  lastModified: false,
  index: false, // don't auto-serve index.html on /
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
})); // Web UI — no-cache in dev
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(requestLogger); // Log all requests

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Public config — small JSON telling the frontend about environment
// capabilities. No secrets here; it's served to any client.
app.get('/api/config', (req: Request, res: Response) => {
  res.status(200).json({
    brand: 'Lobbix',
    version: '1.1.0',
    demoMode: process.env.DEMO_MODE === 'true',
    googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || null,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rate limiters — protect OTP/login from brute force + general abuse.
// In demo / development mode the limits are much looser so you can
// actually test the app without locking yourself out.
const isDemoOrDev =
  process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production';

const otpLimiter = rateLimit({
  windowMs: isDemoOrDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDemoOrDev ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Try again in a few minutes.' },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDemoOrDev ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
// Tighter limit on auth write endpoints (still permissive in demo)
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/google-demo', otpLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/v1', productionRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_building', (data: { buildingId: string }) => {
    socket.join(`building:${data.buildingId}`);
    console.log(`Socket ${socket.id} joined building ${data.buildingId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Kick off the payment-reminder scheduler so due_today / +1 / +7 / +30
// notifications are generated on a daily cadence without external cron.
startReminderScheduler(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: ${process.env.API_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { io };
