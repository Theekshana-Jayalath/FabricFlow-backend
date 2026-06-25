import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  registrationNo: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  capacity: { type: Number },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  status: { 
    type: String, 
    enum: ['Available', 'In Use', 'Maintenance', 'Out of Service'],
    default: 'Available'
  },
  assignedDriver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'driver',
    default: null 
  }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);