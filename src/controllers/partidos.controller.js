const partidosService = require('../services/partidos.service');

const createPartido = async (req, res, next) => {
    try {
        const result = await partidosService.createPartido(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('Socio no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

const getPartidos = async (req, res, next) => {
    try {
        const result = await partidosService.getPartidos(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getPartidoById = async (req, res, next) => {
    try {
        const result = await partidosService.getPartidoById(req.params.id);
        if (!result) return res.status(404).json({ message: 'Partido no encontrado' });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const updatePartido = async (req, res, next) => {
    try {
        const result = await partidosService.updatePartido(req.params.id, req.body);
        if (!result) return res.status(404).json({ message: 'Partido no encontrado' });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const deletePartido = async (req, res, next) => {
    try {
        const result = await partidosService.deletePartido(req.params.id);
        if (!result) return res.status(404).json({ message: 'Partido no encontrado' });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPartido,
    getPartidos,
    getPartidoById,
    updatePartido,
    deletePartido
};
