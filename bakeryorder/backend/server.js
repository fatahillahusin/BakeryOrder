const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BakeryOrder API is running', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('🍞 ========================================');
  console.log('🍰  BakeryOrder Server Started!');
  console.log('🍞 ========================================');
  console.log(`🌐 API:      http://localhost:3000/api`);
  console.log(`🖥️  Frontend: http://localhost:3000`);
  console.log('🍞 ========================================');
  console.log('');
});

module.exports = app;
