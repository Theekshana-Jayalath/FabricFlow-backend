import mongoose from "mongoose";
const { Schema } = mongoose;

const distributionSchema = new Schema(
  {
    distributionId: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeModel", // Changed from "Driver" to "EmployeeModel"
      required: true,
    },
    assignedBy: {
      type: String, // Admin or user who assigned
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    deliveryStatus: {
      type: String,
      enum: ["ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"],
      default: "ASSIGNED",
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Distribution = mongoose.model("Distribution", distributionSchema);

export default Distribution;
