import mongoose from "mongoose";

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  empId: {
    type: String,
    required: true,
    unique: true, // each employee should have a unique ID
  },
  empName: {
    type: String,
    required: true,
  },
  empPhone: {
    type: String, // store as string to allow +, -, spaces
  },
  jobPosition: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "terminated"], // you can adjust statuses
    default: "active",
  },
  address: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "employee",
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: null,
  },
  age: {
    type: Number,
  },
}, { timestamps: true }); // adds createdAt & updatedAt automatically

export default mongoose.model("EmployeeModel", employeeSchema);
