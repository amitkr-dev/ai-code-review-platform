/**
 * ============================================
 * AI Code Review Platform — Server Entry Point
 * ============================================
 * Initializes Express app, connects to MongoDB,
 * registers middleware, routes, and error handlers.
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import route modules
const authRoutes = require('./src/routes/auth.routes');
const reviewRoutes = require('./src/routes/review.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Security Middleware ---------- */
app.use(helmet()); // Sets HTTP security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

/* ---------- Rate Limiting ---------- */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter for auth routes
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/* ---------- Body Parsing ---------- */
app.use(express.json({ limit: '50kb' })); // Limit payload size for code submissions

/* ---------- Request Logging (dev) ---------- */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} — ${new Date().toISOString()}`);
    next();
  });
}

/* ---------- API Routes ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);

/* ---------- Health Check ---------- */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date() });
});

/* ---------- Root Route ---------- */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'AI Code Review Platform API',
    status: 'Running',
    version: '1.0.0',
    health: '/api/health',
    documentation: 'Coming Soon'
  });
});

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/* ---------- Database Connection & Server Start ---------- */

// MongoDB connection options optimized for API servers
const mongooseOptions = {
  // Connection pool configuration
  maxPoolSize: 50,              // Max connections; handles peak concurrent requests (API server workload)
  minPoolSize: 10,              // Min connections; pre-warmed for traffic spikes
  maxIdleTimeMS: 300000,        // 5 minutes; release unused connections on stable servers
  
  // Timeout settings (in milliseconds)
  connectTimeoutMS: 10000,      // 10 seconds; fail fast if connection can't be established
  socketTimeoutMS: 45000,       // 45 seconds; prevent hanging queries
  serverSelectionTimeoutMS: 5000, // 5 seconds; quick failover on replica set topology changes
  
  // Reconnection settings
  retryWrites: true,            // Retry transient write failures (requires replica set)
  retryReads: true,             // Retry transient read failures
  autoIndex: process.env.NODE_ENV !== 'production', // Only build indexes in development
  
  // Connection monitoring
  family: 4,                     // Force IPv4 (prevents IPv6 issues on some systems)
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Log connection pool info in development
    if (process.env.NODE_ENV !== 'production') {
      const client = mongoose.connection.getClient();
      console.log(`📊 Connection Pool: min=${mongooseOptions.minPoolSize}, max=${mongooseOptions.maxPoolSize}`);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Handle connection events for monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Disconnected from MongoDB. Mongoose will auto-reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Reconnected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});