import mongoose from "mongoose";
const Schema = mongoose.Schema;

const materialSchema = new Schema({
  materialId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0, // default value to avoid null
  },
  reOrderLevel: {
    type: Number,
    default: 2000, // default value to avoid validation errors
    immutable:true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0, // default value
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupplierModel",
  },
});

export default mongoose.model("MaterialModel", materialSchema);
