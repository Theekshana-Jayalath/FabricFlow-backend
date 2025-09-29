import mongoose from "mongoose";
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  purchaseId: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupplierModel",
    required: true,
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MaterialModel",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PurchaseModel", purchaseSchema);
