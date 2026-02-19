const accessService = require('../services/access.service');

const getAccessStatus = async (req, res, next) => {
    try {
        const result = await accessService.checkStadiumAccess(req.params.socioId, req.user?.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getLogs = async (req, res, next) => {
    try {
        const logs = await accessService.getAccessLogs(req.query);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAccessStatus,
    getLogs
};
