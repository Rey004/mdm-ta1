require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isMemoryMode } = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Inventory Management API',
    version: '1.0.0',
    status: 'online',
    database: isMemoryMode() ? 'In-Memory Store (Fallback)' : 'MongoDB',
    endpoints: {
      products: '/api/products',
      lowStockAlerts: '/api/products/alerts/low-stock',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isMemoryMode() ? 'In-Memory Fallback' : 'Connected to MongoDB',
    isMemoryMode: isMemoryMode(),
  });
});

// API Routes
app.use('/api/products', productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Inventory Express Backend running on http://localhost:${PORT}`);
  console.log(`📊 Mode: ${isMemoryMode() ? 'In-Memory Mock/Fallback' : 'MongoDB Production'}`);
  console.log(`📡 Endpoints active at http://localhost:${PORT}/api/products`);
  console.log(`====================================================`);
});
