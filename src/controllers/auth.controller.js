const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const { validationResult } = require('express-validator');

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Create Token
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Autenticación exitosa',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'El usuario o email ya existe' });
        }

        const newUser = new User({
            username,
            email,
            password,
            role: role || 'operator'
        });

        await newUser.save();

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Seed initial admin if not exists
const initAdmin = async () => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 0) {
            const admin = new User({
                username: config.ADMIN_USER,
                email: 'admin@central.com',
                password: config.ADMIN_PASS,
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Initial admin user created');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// module exports at the bottom

module.exports = {
    login,
    register,
    initAdmin
};
