const express = require('express');
const router = express.Router();
const accessController = require('../controllers/access.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Access Control - Protected
router.get('/logs', verifyToken, isAdmin, accessController.getLogs);
router.get('/:socioId', verifyToken, accessController.getAccessStatus);

module.exports = router;
