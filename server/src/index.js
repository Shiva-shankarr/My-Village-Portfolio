require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware');
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const videosRoutes = require('./routes/videos');
const updatesRoutes = require('./routes/updates');
const dashboardRoutes = require('./routes/dashboard');
const healthRoutes = require('./routes/health');
const errorLoggingRoutes = require('./routes/error-logging');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const defaultOrigins = ['http://localhost:3000'];
const envOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header) and configured origins.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Friendly root route for uptime checks and manual browser visits
app.get('/', (req, res) => {
  res.json({
    message: 'Village Portfolio API is running',
    health: '/api/health'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/error-logging', errorLoggingRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
