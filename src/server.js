const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const topperRoutes = require('./routes/topperRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const contactRoutes = require('./routes/contactRoutes');
const homeRoutes = require('./routes/homeRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Initialize database connection
const connectDB = require('./config/db');
let dbConnected = false;

const initializeDB = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Enhanced CORS Configuration for server.js
const allowedOrigins = [
  'https://masters-frontend-testing.vercel.app',
  'https://masters-backend-testing-r6vw.vercel.app', // ← Add your backend domain
  /^https:\/\/masters-frontend-testing.*\.vercel\.app$/, // Frontend preview deployments
  /^https:\/\/masters-backend-testing.*\.vercel\.app$/, // Backend preview deployments
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`🔍 Request origin: ${origin}`);
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        console.log('✅ No origin - allowing');
        return callback(null, true);
      }
      
      // Check allowed origins
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        console.log(`✅ Origin allowed: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`❌ CORS blocked request from: ${origin}`);
      return callback(new Error(`CORS blocked: ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Rate limiting (reduced for serverless)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for serverless
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await initializeDB();
  next();
});

// Health check endpoint (should be first)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Masters Academy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Masters Academy API',
    status: 'running'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/toppers', topperRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/gallery', galleryRoutes);

// Error handling middleware
app.use(errorHandler);

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  if (err.message.includes('CORS blocked')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Request blocked by CORS policy'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;