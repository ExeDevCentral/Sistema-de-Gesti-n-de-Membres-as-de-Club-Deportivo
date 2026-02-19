const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidos.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', partidosController.getPartidos);
router.get('/:id', partidosController.getPartidoById);
router.post('/', verifyToken, partidosController.createPartido);
router.put('/:id', verifyToken, partidosController.updatePartido);
router.delete('/:id', verifyToken, isAdmin, partidosController.deletePartido);

module.exports = router;
