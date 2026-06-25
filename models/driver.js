import mongoose from "mongoose";

const driverSchema = mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true, 
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    vehicleAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle", 
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model("driver",driverSchema)

export default Driver;
