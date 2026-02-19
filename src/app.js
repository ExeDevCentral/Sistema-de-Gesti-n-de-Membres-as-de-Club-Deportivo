const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: config.isProduction,
}));
app.use(cors({
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased for dev/testing
    message: { message: 'Demasiados intentos de acceso, por favor intente de nuevo en 15 minutos.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const path = require('path');

// Standard Middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '10kb' })); // Limit body size

// Health check (para balanceadores y despliegue)
app.get('/health', async (req, res) => {
    const mongoose = require('mongoose');
    const dbOk = mongoose.connection.readyState === 1;
    res.status(dbOk ? 200 : 503).json({
        status: dbOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbOk ? 'connected' : 'disconnected'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/socios', require('./routes/socios.routes'));
app.use('/api/partidos', require('./routes/partidos.routes'));
app.use('/api/access', require('./routes/access.routes'));

// Error handling middleware
app.use(require('./middlewares/error.middleware'));

// Serve login explicitly if needed or fallback to index
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// SPA Fallback: Serve index.html for non-API requests
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
