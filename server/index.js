require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const { shopifyAuth } = require('./middleware/shopifyAuth');
const { verifyRequest } = require('./middleware/verifyRequest');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const marketplaceRoutes = require('./routes/marketplace');
const webhookRoutes = require('./routes/webhooks');
const salesChannelRoutes = require('./routes/salesChannels');
const productCatalogRoutes = require('./routes/productCatalogs');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.HOST,
  credentials: true
}));
app.use(cookieParser());

// Webhook routes (must be before JSON parser for raw body access)
app.use('/api/webhooks', webhookRoutes);

// JSON parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (no verification needed)
app.use('/api/auth', authRoutes);

// Protected API routes
app.use('/api/products', verifyRequest, productRoutes);
app.use('/api/orders', verifyRequest, orderRoutes);
app.use('/api/marketplace', verifyRequest, marketplaceRoutes);
app.use('/api/sales-channels', verifyRequest, salesChannelRoutes);
app.use('/api/product-catalogs', verifyRequest, productCatalogRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Database sync and server start
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
