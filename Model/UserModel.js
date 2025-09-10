import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gmail: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  age: {
    type: Number,
  },
  address: {
    type: String,
  },
  phone: {
    type: String, // store as string to allow +, -, spaces
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"], // limit to these options
    default: null,
  },
  dob: {
    type: Date, // date of birth
  },
}, { timestamps: true }); // adds createdAt & updatedAt automatically

export default mongoose.model("UserModel", userSchema);
