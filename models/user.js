import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['user', 'employee', 'admin'] },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Common details
  age: { type: Number },
  address: { type: String },
  phone: { type: String },
  gender: { type: String },
  dob: { type: Date },

  // Employee specific details
  empId: { type: String },
  jobPosition: { type: String },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model("User", userSchema);