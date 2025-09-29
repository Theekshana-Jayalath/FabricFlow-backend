import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        shippingAddress: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            postalCode: String,
            country: String
        }
    },
    items: [{
        productId: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['PROCESSING', 'COMPLETED', 'CANCELLED', 'SHIPPED', 'DELIVERED'],
        default: 'PROCESSING'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    statusUpdateDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate delivery date and set up automatic status update
orderSchema.pre('save', function(next) {
    // Calculate delivery date (7 days after order date) if not already set
    if (!this.deliveryDate && this.orderDate) {
        const deliveryDate = new Date(this.orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        this.deliveryDate = deliveryDate;
    }
    
    // Update statusUpdateDate when status changes
    if (this.isModified('orderStatus')) {
        this.statusUpdateDate = new Date();
    }
    
    next();
});

// Static method to update orders to COMPLETED after 5 days
orderSchema.statics.updateExpiredOrders = async function() {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    try {
        const result = await this.updateMany(
            {
                orderDate: { $lte: fiveDaysAgo },
                orderStatus: 'PROCESSING'
            },
            {
                $set: {
                    orderStatus: 'COMPLETED',
                    statusUpdateDate: new Date()
                }
            }
        );
        
        console.log(`Updated ${result.modifiedCount} orders to COMPLETED status`);
        return result;
    } catch (error) {
        console.error('Error updating expired orders:', error);
        throw error;
    }
};

// Instance method to check if order should be completed
orderSchema.methods.shouldBeCompleted = function() {
    const fiveDaysAfterOrder = new Date(this.orderDate);
    fiveDaysAfterOrder.setDate(fiveDaysAfterOrder.getDate() + 5);
    
    return new Date() >= fiveDaysAfterOrder && this.orderStatus === 'PROCESSING';
};

// Instance method to auto-complete if eligible
orderSchema.methods.autoCompleteIfEligible = async function() {
    if (this.shouldBeCompleted()) {
        this.orderStatus = 'COMPLETED';
        this.statusUpdateDate = new Date();
        await this.save();
        return true;
    }
    return false;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;