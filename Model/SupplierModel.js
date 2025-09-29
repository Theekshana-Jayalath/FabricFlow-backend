import mongoose from "mongoose";
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
  supplierId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("SupplierModel", supplierSchema);
