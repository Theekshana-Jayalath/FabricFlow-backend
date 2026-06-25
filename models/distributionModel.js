import mongoose from 'mongoose';

const distributionSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'driver',
    required: true 
  },
  assignedBy: { 
    type: String, 
    default: 'Admin'
  },
  notes: { 
    type: String 
  },
  deliveryStatus: {
    type: String,
    enum: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
    default: 'ASSIGNED'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Distribution', distributionSchema);