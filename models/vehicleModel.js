import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['Truck', 'Van', 'Car', 'Motorcycle'],
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive', 'Under Maintenance', 'Out of Service'],
        default: 'Active'
    },
    assignedDriverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ assignedDriverId: 1 });

// Virtual for checking if vehicle is assigned
vehicleSchema.virtual('isAssigned').get(function() {
    return this.assignedDriverId !== null;
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
