const mongoose = require('mongoose');

const partidoSchema = new mongoose.Schema({
    socioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Socio',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    rival: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Programado', 'Jugado', 'Cancelado'],
        default: 'Programado'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Partido', partidoSchema);
