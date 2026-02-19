require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/rosario-central',
    JWT_SECRET: process.env.JWT_SECRET || 'mi_secreto_super_seguro_123',
    NODE_ENV: process.env.NODE_ENV || 'development',
    isProduction,
    // En producción usar ej: https://tu-dominio.com (sin barra final)
    CORS_ORIGIN: process.env.CORS_ORIGIN || (isProduction ? '' : '*'),
    ADMIN_USER: process.env.ADMIN_USER || 'admin',
    ADMIN_PASS: process.env.ADMIN_PASS || 'admin123'
};
