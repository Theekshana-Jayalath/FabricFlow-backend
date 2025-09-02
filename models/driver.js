import mongoose from "mongoose";
const { Schema } = mongoose;   // ✅ extract Schema

const driverSchema = new Schema(
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
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true, 
      unique: true,
    },
    licenseNo: {
      type: String,
      required: true,
      unique: true,
    },
    nic: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true, 
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
   
    
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema); // ✅ capitalize model name

export default Driver;
