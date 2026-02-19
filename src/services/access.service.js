const Socio = require('../models/socio.model');
const AccessLog = require('../models/accessLog.model');

// --- Stadium Access Logic ---
const checkStadiumAccess = async (socioId, checkedBy = null) => {
    try {
        const socio = await Socio.findById(socioId);

        if (!socio) {
            return {
                isApto: false,
                message: 'Socio no encontrado',
                carnetStatus: 'N/A',
                cuotasStatus: 'N/A'
            };
        }

        // Check 1: Carnet Activo (Estado)
        const carnetActivo = socio.estado === 'Activo';
        const carnetStatus = carnetActivo ? 'Activo' : socio.estado;

        // Check 2: Cuotas al Día (fechaVencimientoCuota)
        const todayStr = new Date().toISOString().split('T')[0];
        const vencimientoStr = new Date(socio.fechaVencimientoCuota).toISOString().split('T')[0];
        const cuotasAlDia = vencimientoStr >= todayStr;
        const cuotasStatus = cuotasAlDia ? 'Al día' : 'Deuda pendiente';

        // Final Decision
        const isApto = carnetActivo && cuotasAlDia;

        // Log access attempt
        await AccessLog.create({
            socio: socioId,
            granted: isApto,
            reason: isApto ? 'Acceso permitido' : `Carnet: ${carnetStatus}, Cuotas: ${cuotasStatus}`,
            carnetStatus,
            cuotasStatus,
            checkedBy
        });

        return {
            isApto,
            message: isApto ? 'PUEDE INGRESAR AL ESTADIO' : 'NO PUEDE INGRESAR',
            carnetStatus,
            cuotasStatus,
            socio: {
                id: socio._id,
                numeroSocio: socio.numeroSocio,
                nombre: socio.nombre,
                apellido: socio.apellido,
                categoria: socio.categoria,
                photoUrl: socio.photoUrl,
                fechaVencimientoCuota: socio.fechaVencimientoCuota
            }
        };
    } catch (error) {
        throw new Error(`Error checking access: ${error.message}`);
    }
};

// --- Access Logs (paginado) ---
const getAccessLogs = async (filters = {}) => {
    try {
        const query = {};
        const page = Math.max(1, parseInt(filters.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
        const skip = (page - 1) * limit;

        if (filters.socioId) query.socio = filters.socioId;
        if (filters.from || filters.to) {
            query.timestamp = {};
            if (filters.from) query.timestamp.$gte = new Date(filters.from);
            if (filters.to) query.timestamp.$lte = new Date(filters.to);
        }

        const total = await AccessLog.countDocuments(query);
        const pages = Math.ceil(total / limit) || 1;
        const data = await AccessLog.find(query)
            .populate('socio', 'nombre apellido numeroSocio')
            .populate('checkedBy', 'username')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        return { data, page, pages, total };
    } catch (error) {
        throw new Error(`Error fetching access logs: ${error.message}`);
    }
};

module.exports = {
    checkStadiumAccess,
    getAccessLogs
};
