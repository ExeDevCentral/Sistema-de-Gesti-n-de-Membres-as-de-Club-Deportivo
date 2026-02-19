require('dotenv').config();
const app = require('./app');
const connectDB = require('./database');
const config = require('./config');

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Seed initial data
        const { initAdmin } = require('./controllers/auth.controller');
        const { initSeedData } = require('./services/socios.service');

        await initAdmin();
        await initSeedData();

        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
            console.log(`Environment: ${config.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
