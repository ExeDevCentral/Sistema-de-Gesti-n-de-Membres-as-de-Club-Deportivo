const { validationResult } = require('express-validator');
const sociosService = require('../services/socios.service');

const getSocios = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { q, page, limit, estado, categoria } = req.query;
        const result = await sociosService.getSocios({ q, page, limit, estado, categoria });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getSocioById = async (req, res, next) => {
    try {
        const socio = await sociosService.getSocioById(req.params.id);
        if (!socio) {
            const error = new Error('Socio not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(socio);
    } catch (error) {
        next(error);
    }
};

const createSocio = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newSocio = await sociosService.createSocio(req.body);
        res.status(201).json(newSocio);
    } catch (error) {
        next(error);
    }
};

const updateSocio = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updatedSocio = await sociosService.updateSocio(req.params.id, req.body);
        if (!updatedSocio) {
            const error = new Error('Socio not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(updatedSocio);
    } catch (error) {
        next(error);
    }
};

const deleteSocio = async (req, res, next) => {
    try {
        const deleted = await sociosService.deleteSocio(req.params.id);
        if (!deleted) {
            const error = new Error('Socio not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// --- New Endpoints Handlers ---

const suspendSocio = async (req, res, next) => {
    try {
        const { motivo } = req.body;
        const socio = await sociosService.suspendSocio(req.params.id, motivo || 'Suspensión administrativa', req.user ? req.user.username : 'admin');
        res.json(socio);
    } catch (error) {
        next(error);
    }
};

const reactivateSocio = async (req, res, next) => {
    try {
        const { motivo } = req.body;
        const socio = await sociosService.reactivateSocio(req.params.id, motivo || 'Reactivación', req.user ? req.user.username : 'admin');
        res.json(socio);
    } catch (error) {
        next(error);
    }
};

const getMorosos = async (req, res, next) => {
    try {
        const morosos = await sociosService.getMorosos();
        res.json(morosos);
    } catch (error) {
        next(error);
    }
};

const changeCategoria = async (req, res, next) => {
    try {
        const { categoria } = req.body;
        if (!categoria) {
            const error = new Error('Categoria is required');
            error.statusCode = 400;
            throw error;
        }
        const socio = await sociosService.changeCategoria(req.params.id, categoria);
        res.json(socio);
    } catch (error) {
        next(error);
    }
};

const getEstadisticas = async (req, res, next) => {
    try {
        const stats = await sociosService.getEstadisticas();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

const payCuota = async (req, res, next) => {
    try {
        const { meses } = req.body;
        const result = await sociosService.payCuota(req.params.id, meses || 1);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getSocioQR = async (req, res, next) => {
    try {
        const qr = await sociosService.generateSocioQR(req.params.id);
        res.json({ qr });
    } catch (error) {
        next(error);
    }
};

const getRankingAntiguedad = async (req, res, next) => {
    try {
        const ranking = await sociosService.getRankingAntiguedad();
        res.json(ranking);
    } catch (error) {
        next(error);
    }
};

const exportSocios = async (req, res, next) => {
    try {
        const csvData = await sociosService.exportSociosToCSV(req.query);
        const fileName = `socios-${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.status(200).send(csvData);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSocios,
    getSocioById,
    createSocio,
    updateSocio,
    deleteSocio,
    suspendSocio,
    reactivateSocio,
    getMorosos,
    changeCategoria,
    getEstadisticas,
    payCuota,
    getSocioQR,
    getRankingAntiguedad,
    exportSocios
};
