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

// ✅ EXPLICIT CORS MIDDLEWARE (PRIORITY - RUNS FIRST)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'https://masters-frontend-testing.vercel.app',
    'https://masters-backend-testing-r6vw.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes(origin) || 
                   /^https:\/\/masters-frontend-testing.*\.vercel\.app$/.test(origin) ||
                   /^https:\/\/masters-backend-testing.*\.vercel\.app$/.test(origin);
  
  if (isAllowed || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`✅ Handling OPTIONS preflight from: ${origin}`);
    return res.status(204).end();
  }
  
  console.log(`🔄 Request: ${req.method} ${req.path} from: ${origin}`);
  next();
});

// ✅ BACKUP CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS check for origin: ${origin}`);
    
    const allowedOrigins = [
      'https://masters-frontend-testing.vercel.app',
      'https://masters-backend-testing-r6vw.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ No origin - allowing');
      return callback(null, true);
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Exact match allowed: ${origin}`);
      return callback(null, true);
    }
    
    // Check regex patterns for preview deployments
    if (/^https:\/\/masters-frontend-testing.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/masters-backend-testing.*\.vercel\.app$/.test(origin)) {
      console.log(`✅ Preview deployment allowed: ${origin}`);
      return callback(null, true);
    }
    
    console.warn(`❌ CORS blocked: ${origin}`);
    callback(null, false); // Don't throw error, just deny
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler as additional backup
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🔧 Explicit OPTIONS handler for: ${origin}`);
  
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(204).send();
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
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Masters Academy API',
    status: 'running',
    cors: 'enabled'
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
  
  if (err.message && err.message.includes('CORS')) {
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