const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const socioController = require('../controllers/socios.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Order matters! Specific routes before parameter routes (/:id)

// Statistics & Collections
router.get('/estadisticas', socioController.getEstadisticas);
router.get('/morosos', socioController.getMorosos);
router.get('/ranking/antiguedad', socioController.getRankingAntiguedad);
router.get('/export', verifyToken, isAdmin, socioController.exportSocios);

// CRUD
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 500 }),
    query('q').optional().trim().escape()
], socioController.getSocios);

router.get('/:id', socioController.getSocioById);

router.post('/', verifyToken, [
    body('nombre').notEmpty().trim().escape(),
    body('apellido').notEmpty().trim().escape(),
    body('dni').notEmpty().isString().isLength({ min: 7, max: 10 }),
    body('email').isEmail().normalizeEmail(),
    body('categoria').optional().isIn(['Activo', 'Vitalicio', 'Cadete', 'Adherente', 'Jugador', 'DT', 'Hincha']),
    body('rol').optional().trim().escape(),
    body('estado').optional().isIn(['Activo', 'Suspendido', 'Moroso', 'Baja'])
], socioController.createSocio);

router.put('/:id', verifyToken, [
    body('nombre').optional().trim().escape(),
    body('apellido').optional().trim().escape(),
    body('dni').optional().isString().isLength({ min: 7, max: 10 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('categoria').optional().isIn(['Activo', 'Vitalicio', 'Cadete', 'Adherente', 'Jugador', 'DT', 'Hincha']),
    body('rol').optional().trim().escape(),
    body('estado').optional().isIn(['Activo', 'Suspendido', 'Moroso', 'Baja'])
], socioController.updateSocio);

router.delete('/:id', verifyToken, isAdmin, socioController.deleteSocio);
// Specific Actions
router.patch('/:id/suspender', verifyToken, socioController.suspendSocio);
router.patch('/:id/reactivar', verifyToken, socioController.reactivateSocio);
router.patch('/:id/categoria', verifyToken, socioController.changeCategoria);
router.post('/:id/pagar', verifyToken, socioController.payCuota);
router.get('/:id/qr', verifyToken, socioController.getSocioQR);

module.exports = router;
