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

// ✅ TRUST PROXY - CRITICAL FOR VERCEL
app.set('trust proxy', 1);

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
      console.error('❌ Database connection failed:', error.message);
    }
  }
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// ✅ DIRECT CORS HEADERS - Replace the CORS middleware in server.js
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🔍 CORS Request: ${req.method} ${req.url} from origin: ${origin || 'no-origin'}`);
  
  const allowedOrigins = [
    'https://masters-frontend-testing.vercel.app',
    'https://masters-backend-testing-r6vw.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  // Check if origin is allowed
  const isExactMatch = allowedOrigins.includes(origin);
  const isPreviewMatch = origin && (
    /^https:\/\/masters-frontend-testing.*\.vercel\.app$/.test(origin) ||
    /^https:\/\/masters-backend-testing.*\.vercel\.app$/.test(origin)
  );
  
  const isAllowed = isExactMatch || isPreviewMatch || !origin;
  
  if (isAllowed) {
    const allowOrigin = origin || 'https://masters-frontend-testing.vercel.app';
    console.log(`✅ Setting CORS headers for origin: ${allowOrigin}`);
    
    // Use more direct header setting
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    console.log(`📤 CORS headers set for: ${allowOrigin}`);
  } else {
    console.log(`❌ CORS blocked origin: ${origin}`);
  }
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`🔧 Handling OPTIONS preflight from: ${origin}`);
    
    // Send response immediately with explicit headers
    if (isAllowed) {
      const allowOrigin = origin || 'https://masters-frontend-testing.vercel.app';
      res.writeHead(204, {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      });
      console.log(`✅ OPTIONS response sent with CORS headers for: ${allowOrigin}`);
      return res.end();
    } else {
      return res.status(403).end();
    }
  }
  
  next();
});

// Rate limiting - Fixed for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  // Fix for Vercel proxy headers
  skip: (req) => {
    // Skip rate limiting if there are proxy header issues
    return false;
  },
  keyGenerator: (req) => {
    return req.ip || 'anonymous';
  }
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check called');
  res.status(200).json({
    status: 'OK',
    message: 'Masters Academy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    version: '2.0'
  });
});

app.get('/', (req, res) => {
  console.log('🏠 Root endpoint called');
  res.status(200).json({
    message: 'Masters Academy API',
    status: 'running',
    cors: 'enabled',
    version: '2.0'
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  
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