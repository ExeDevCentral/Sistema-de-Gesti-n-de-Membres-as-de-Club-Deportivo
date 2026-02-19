const mongoose = require('mongoose');

const socioSchema = new mongoose.Schema({
    numeroSocio: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    dni: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    telefono: String,
    direccion: String,
    fechaNacimiento: Date,
    categoria: {
        type: String,
        enum: ['Activo', 'Vitalicio', 'Cadete', 'Adherente'],
        default: 'Activo'
    },
    rol: {
        type: String,
        trim: true
    },
    estado: {
        type: String,
        enum: ['Activo', 'Suspendido', 'Moroso', 'Baja'],
        default: 'Activo',
        index: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    fechaBaja: Date,
    fechaVencimientoCuota: {
        type: Date,
        required: true
    },
    esAbonado: {
        type: Boolean,
        default: false
    },
    photoUrl: String,
    historialEstados: [{
        estado: String,
        motivo: String,
        fecha: { type: Date, default: Date.now },
        usuario: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for search
socioSchema.index({ nombre: 'text', apellido: 'text' });

// Virtual for full name
socioSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombre} ${this.apellido}`;
});

// Method to check if socio is moroso
socioSchema.methods.isMoroso = function () {
    const today = new Date().toISOString().split('T')[0];
    return this.fechaVencimientoCuota < today;
};

module.exports = mongoose.model('Socio', socioSchema);
