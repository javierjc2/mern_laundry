const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// ============================================================
// MINIMAL SECURITY SERVER — For ZAP Testing
// Target: 2-5 alerts only
// CSP disabled to avoid React compatibility warnings
// ============================================================

// Logging
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'express.log'), { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Trust proxy
app.set('trust proxy', 1);

// HTTPS redirect (production only)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

// ── HELMET — Maximum security WITHOUT CSP ────────────────
app.use(helmet({
  contentSecurityPolicy: false,  // Disabled to avoid React warnings in ZAP
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  hidePoweredBy: true,           // Remove X-Powered-By header
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,                 // X-Content-Type-Options: nosniff
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  frameguard: { action: 'deny' }, // X-Frame-Options: DENY
}));

// ── ADDITIONAL SECURITY HEADERS ───────────────────────────
app.use((req, res, next) => {
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Cache-Control for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// CORS for API only
app.use('/api', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── SERVE REACT BUILD ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/build'), {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ── API ROUTES ────────────────────────────────────────────
const authRoutes   = require('./routes/auth');
const adminRoutes  = require('./routes/admin');
const publicRoutes = require('./routes/public');

app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api',       publicRoutes);

// ── SERVE REACT FOR ALL OTHER ROUTES ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({ 
    message: 'An unexpected error occurred. Please try again.' 
  });
});

// ── DATABASE ──────────────────────────────────────────────
connectDB();


// ── START SERVER ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Helmet security enabled (CSP disabled for ZAP testing)`);
  console.log(`📝 Logs → backend/logs/express.log`);
  console.log(`📦 Serving React from: ../frontend/build`);
  console.log(`\n⚠️  ZAP scan target: http://localhost:${PORT}`);
});
