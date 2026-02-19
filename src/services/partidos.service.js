const Partido = require('../models/partido.model');
const Socio = require('../models/socio.model');

const createPartido = async (partidoData) => {
    try {
        // Validate socio existence
        const socio = await Socio.findById(partidoData.socioId);
        if (!socio) {
            const error = new Error('Socio no encontrado');
            error.statusCode = 404;
            throw error;
        }

        const newPartido = new Partido(partidoData);
        return await newPartido.save();
    } catch (error) {
        throw new Error(`Error al crear partido: ${error.message}`);
    }
};

const getPartidos = async (filters = {}) => {
    try {
        const query = {};
        if (filters.socioId) query.socioId = filters.socioId;
        if (filters.status) query.status = filters.status;

        return await Partido.find(query)
            .populate('socioId', 'nombre apellido numeroSocio')
            .sort({ date: 1 });
    } catch (error) {
        throw new Error(`Error al obtener partidos: ${error.message}`);
    }
};

const getPartidoById = async (id) => {
    try {
        return await Partido.findById(id).populate('socioId', 'nombre apellido numeroSocio');
    } catch (error) {
        throw new Error(`Error al obtener partido: ${error.message}`);
    }
};

const updatePartido = async (id, updates) => {
    try {
        return await Partido.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } catch (error) {
        throw new Error(`Error al actualizar partido: ${error.message}`);
    }
};

const deletePartido = async (id) => {
    try {
        return await Partido.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error al eliminar partido: ${error.message}`);
    }
};

module.exports = {
    createPartido,
    getPartidos,
    getPartidoById,
    updatePartido,
    deletePartido
};
