import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
      },
      shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      }
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      size: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    expectedDeliveryDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'COD'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED'],
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
