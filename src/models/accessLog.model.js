const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
    socio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Socio',
        required: true
    },
    granted: {
        type: Boolean,
        required: true
    },
    reason: String,
    carnetStatus: String,
    cuotasStatus: String,
    checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for querying logs
accessLogSchema.index({ socio: 1, timestamp: -1 });
accessLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
