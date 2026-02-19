const { Parser } = require('json2csv');
const QRCode = require('qrcode');
const Socio = require('../models/socio.model');

// --- Helper Functions ---
const getNextNumeroSocio = async () => {
    const lastSocio = await Socio.findOne().sort({ numeroSocio: -1 });
    if (!lastSocio) return '1000';
    return String(Number(lastSocio.numeroSocio) + 1);
};

// --- Seed Data Initialization ---
const initSeedData = async () => {
    try {
        const count = await Socio.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} socios. Skipping seed.`);
            return;
        }

        console.log("Seeding Socios data...");

        const historicalFigures = [
            { nombre: 'Mario', apellido: 'Kempes', categoria: 'Vitalicio', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Mario_Kempes_1978.jpg/220px-Mario_Kempes_1978.jpg' },
            { nombre: 'Aldo Pedro', apellido: 'Poy', categoria: 'Vitalicio', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Aldo_Poy_1973.jpg/220px-Aldo_Poy_1973.jpg' },
            { nombre: 'Omar', apellido: 'Palma', categoria: 'Vitalicio', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Omar_Palma_Rosario_Central_1987.jpg/220px-Omar_Palma_Rosario_Central_1987.jpg' },
            { nombre: 'Edgardo', apellido: 'Bauza', categoria: 'Vitalicio', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Edgardo_Bauza_2016.jpg/220px-Edgardo_Bauza_2016.jpg' },
            { nombre: 'Marco', apellido: 'Ruben', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Marco_Ruben_2016.jpg/220px-Marco_Ruben_2016.jpg' },
            { nombre: 'Eduardo', apellido: 'Coudet', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Eduardo_Coudet.jpg/220px-Eduardo_Coudet.jpg' },
            { nombre: 'Cristian', apellido: 'González', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Kily_Gonzalez.jpg/220px-Kily_Gonzalez.jpg' },
            { nombre: 'César', apellido: 'Delgado', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cesar_Delgado.jpg/220px-Cesar_Delgado.jpg' },
            { nombre: 'Ángel', apellido: 'Di María', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Angel_Di_Maria_2018.jpg/220px-Angel_Di_Maria_2018.jpg' },
            { nombre: 'Giovani', apellido: 'Lo Celso', categoria: 'Activo', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Gio_Lo_Celso_2018.jpg/220px-Gio_Lo_Celso_2018.jpg' }
        ];

        let currentNumero = 1000;
        const sociosToCreate = [];

        // Add historical figures
        for (const [index, figure] of historicalFigures.entries()) {
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

            sociosToCreate.push({
                numeroSocio: String(currentNumero++),
                nombre: figure.nombre,
                apellido: figure.apellido,
                dni: `1000000${index}`,
                fechaNacimiento: new Date('1980-01-01'),
                email: `${figure.nombre.replace(/\s/g, '').toLowerCase()}.${figure.apellido.toLowerCase()}@central.com`,
                telefono: '341-0000000',
                direccion: 'Avellaneda y Génova',
                categoria: figure.categoria,
                estado: 'Activo',
                photoUrl: figure.photo,
                esAbonado: true,
                fechaVencimientoCuota: fechaVencimiento.toISOString().split('T')[0]
            });
        }

        // Add 90 more random socios
        const nombres = ['Juan', 'Pedro', 'Luis', 'Carlos', 'Jorge', 'Miguel', 'Fernando', 'Roberto', 'Diego', 'Martín'];
        const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];

        for (let i = 0; i < 90; i++) {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + Math.floor(Math.random() * 3) - 1);

            sociosToCreate.push({
                numeroSocio: String(currentNumero++),
                nombre,
                apellido,
                dni: `2${String(i).padStart(7, '0')}`,
                email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@central.com`,
                telefono: `341-${Math.floor(Math.random() * 9000000) + 1000000}`,
                categoria: Math.random() > 0.7 ? 'Vitalicio' : 'Activo',
                estado: Math.random() > 0.2 ? 'Activo' : 'Moroso',
                fechaVencimientoCuota: fechaVencimiento.toISOString().split('T')[0],
                esAbonado: Math.random() > 0.5
            });
        }

        await Socio.insertMany(sociosToCreate);
        console.log(`✅ Seeded ${sociosToCreate.length} socios successfully`);
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

// Initialize seed data
// Seeding function moved to exports

// --- CRUD Operations ---
const getSocios = async (filters = {}) => {
    try {
        const query = {};
        const { q, page = 1, limit = 20, estado, categoria } = filters;

        // Filtering
        if (estado) query.estado = estado;
        if (categoria) query.categoria = categoria;

        // Search
        if (q) {
            query.$or = [
                { nombre: { $regex: q, $options: 'i' } },
                { apellido: { $regex: q, $options: 'i' } },
                { dni: { $regex: q, $options: 'i' } },
                { numeroSocio: { $regex: q, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Socio.countDocuments(query);
        const pages = Math.ceil(total / Number(limit));

        const data = await Socio.find(query)
            .sort({ numeroSocio: 1 })
            .skip(skip)
            .limit(Number(limit));

        return {
            data,
            total,
            page: Number(page),
            pages
        };
    } catch (error) {
        throw new Error(`Error fetching socios: ${error.message}`);
    }
};

const getSocioById = async (id) => {
    try {
        return await Socio.findById(id);
    } catch (error) {
        throw new Error(`Error fetching socio: ${error.message}`);
    }
};

const ROLES_AS_CATEGORIA = ['Jugador', 'DT', 'Hincha'];

const normalizeCategoriaRol = (body) => {
    const out = { ...body };
    const cat = (out.categoria || '').trim();
    if (ROLES_AS_CATEGORIA.includes(cat)) {
        out.rol = out.rol || cat;
        out.categoria = 'Activo';
    }
    return out;
};

const createSocio = async (socioData) => {
    try {
        socioData = normalizeCategoriaRol(socioData);

        // Explicit unique DNI check
        const existingDni = await Socio.findOne({ dni: socioData.dni });
        if (existingDni) {
            const error = new Error('El DNI ingresado ya pertenece a otro socio');
            error.statusCode = 400;
            throw error;
        }

        const numeroSocio = await getNextNumeroSocio();

        // Set default fechaVencimientoCuota if not provided
        if (!socioData.fechaVencimientoCuota) {
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            socioData.fechaVencimientoCuota = fechaVencimiento.toISOString().split('T')[0];
        }

        const newSocio = new Socio({
            ...socioData,
            numeroSocio
        });

        return await newSocio.save();
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            throw new Error(`${field} already exists`);
        }
        throw new Error(`Error creating socio: ${error.message}`);
    }
};

const updateSocio = async (id, updates) => {
    try {
        updates = normalizeCategoriaRol(updates);
        const socio = await Socio.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!socio) {
            throw new Error('Socio not found');
        }

        return socio;
    } catch (error) {
        throw new Error(`Error updating socio: ${error.message}`);
    }
};

const deleteSocio = async (id) => {
    try {
        const socio = await Socio.findByIdAndUpdate(
            id,
            {
                estado: 'Baja',
                fechaBaja: new Date()
            },
            { new: true }
        );

        if (!socio) {
            throw new Error('Socio not found');
        }

        return socio;
    } catch (error) {
        throw new Error(`Error deleting socio: ${error.message}`);
    }
};

// --- Advanced Operations ---
const suspendSocio = async (id, motivo, usuario = 'system') => {
    try {
        const socio = await Socio.findById(id);
        if (!socio) throw new Error('Socio not found');

        socio.estado = 'Suspendido';
        socio.historialEstados.push({
            estado: 'Suspendido',
            motivo,
            usuario,
            fecha: new Date()
        });

        return await socio.save();
    } catch (error) {
        throw new Error(`Error suspending socio: ${error.message}`);
    }
};

const reactivateSocio = async (id, motivo, usuario = 'system') => {
    try {
        const socio = await Socio.findById(id);
        if (!socio) throw new Error('Socio not found');

        socio.estado = 'Activo';
        socio.historialEstados.push({
            estado: 'Activo',
            motivo,
            usuario,
            fecha: new Date()
        });

        return await socio.save();
    } catch (error) {
        throw new Error(`Error reactivating socio: ${error.message}`);
    }
};

const changeCategoria = async (id, nuevaCategoria) => {
    try {
        return await Socio.findByIdAndUpdate(
            id,
            { categoria: nuevaCategoria },
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw new Error(`Error changing categoria: ${error.message}`);
    }
};

const payCuota = async (id, mesCount = 1) => {
    try {
        const socio = await Socio.findById(id);
        if (!socio) throw new Error('Socio no encontrado');

        // Advanced logic: if current expiration is in the past, start from today
        // If it's in the future, add to it
        const currentVencimiento = new Date(socio.fechaVencimientoCuota);
        const today = new Date();

        let baseDate = currentVencimiento > today ? currentVencimiento : today;
        baseDate.setMonth(baseDate.getMonth() + mesCount);

        socio.fechaVencimientoCuota = baseDate.toISOString().split('T')[0]; // Ensure date is stored as YYYY-MM-DD

        // Add history entry
        socio.historialEstados.push({
            estado: socio.estado,
            motivo: `Pago de ${mesCount} cuota(s)`,
            usuario: 'SISTEMA_PAGOS',
            fecha: new Date()
        });

        if (socio.estado === 'Moroso') {
            socio.estado = 'Activo';
        }

        return await socio.save();
    } catch (error) {
        throw new Error(`Error processing payment: ${error.message}`);
    }
};

// --- QR Generation ---
const generateSocioQR = async (id) => {
    try {
        const socio = await Socio.findById(id);
        if (!socio) throw new Error('Socio no encontrado');

        // QR Data contains basic info for verification
        const qrData = JSON.stringify({
            id: socio._id,
            nombre: `${socio.nombre} ${socio.apellido}`,
            numeroSocio: socio.numeroSocio,
            validUntil: socio.fechaVencimientoCuota
        });

        return await QRCode.toDataURL(qrData);
    } catch (error) {
        throw new Error(`Error generating QR: ${error.message}`);
    }
};

// --- Statistics ---
const getEstadisticas = async () => {
    try {
        const total = await Socio.countDocuments();
        const activos = await Socio.countDocuments({ estado: 'Activo' });
        const morosos = await Socio.countDocuments({ estado: 'Moroso' });
        const vitalicios = await Socio.countDocuments({ categoria: 'Vitalicio' });
        const bajas = await Socio.countDocuments({ estado: 'Baja' });

        return {
            total,
            activos,
            morosos,
            vitalicios,
            bajas
        };
    } catch (error) {
        throw new Error(`Error fetching statistics: ${error.message}`);
    }
};

const getMorosos = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        return await Socio.find({
            fechaVencimientoCuota: { $lt: today },
            estado: { $ne: 'Baja' }
        }).sort({ fechaVencimientoCuota: 1 });
    } catch (error) {
        throw new Error(`Error fetching morosos: ${error.message}`);
    }
};

const getRankingAntiguedad = async () => {
    try {
        return await Socio.find({ estado: { $ne: 'Baja' } })
            .sort({ fechaAlta: 1 })
            .limit(10);
    } catch (error) {
        throw new Error(`Error fetching ranking: ${error.message}`);
    }
};

const exportSociosToCSV = async (filters = {}) => {
    try {
        const query = {};
        if (filters.estado) query.estado = filters.estado;
        if (filters.categoria) query.categoria = filters.categoria;

        const socios = await Socio.find(query).sort({ numeroSocio: 1 });

        const fields = [
            { label: 'Número Socio', value: 'numeroSocio' },
            { label: 'Nombre', value: 'nombre' },
            { label: 'Apellido', value: 'apellido' },
            { label: 'DNI', value: 'dni' },
            { label: 'Email', value: 'email' },
            { label: 'Categoría', value: 'categoria' },
            { label: 'Estado', value: 'estado' },
            { label: 'Fecha Alta', value: (row) => row.fechaAlta.toISOString().split('T')[0] },
            { label: 'Vencimiento Cuota', value: 'fechaVencimientoCuota' }
        ];

        const json2csvParser = new Parser({ fields });
        return json2csvParser.parse(socios);
    } catch (error) {
        throw new Error(`Error exporting to CSV: ${error.message}`);
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
    changeCategoria,
    payCuota,
    getEstadisticas,
    getMorosos,
    getRankingAntiguedad,
    exportSociosToCSV,
    generateSocioQR,
    initSeedData
};
