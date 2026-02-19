const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

router.post('/login', [
    body('username').notEmpty().trim().escape(),
    body('password').notEmpty()
], authController.login);

router.post('/register', [
    body('username').isLength({ min: 4 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'operator'])
], authController.register);

module.exports = router;
