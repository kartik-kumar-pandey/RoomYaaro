import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middlewares/validate.js';
import { globalLimiter } from './src/middlewares/rateLimits.js';
import { setupSocketHandlers } from './src/sockets/chat.socket.js';
import { verifyEmailConnection } from './src/services/email.service.js';
import logger from './src/utils/logger.js';

// Verify SMTP connection on startup
verifyEmailConnection();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// Security headers
app.use(helmet());

// CORS — restrict to known frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body size limits — prevent large payload DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter — broad scraping protection
app.use('/api', globalLimiter);

// Health check endpoints (rebranded to RoomYaaro)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'RoomYaaro API',
    tagline: 'Find Your Room. Find Your Yaar.',
    version: '1.0.0',
    status: 'Running 🚀',
    documentation: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RoomYaaro API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`RoomYaaro API running on port ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  });
});

export default app;
