import Supplier from "../Model/SupplierModel.js";

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    return res.status(200).json(suppliers); // return array directly
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new supplier
export const addSuppliers = async (req, res) => {
  const { supplierId, name, contact } = req.body;

  try {
    const newSupplier = new Supplier({ supplierId, name, contact });
    const savedSupplier = await newSupplier.save();
    return res.status(201).json(savedSupplier); // 201 for creation
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate contact error", keyValue: err.keyValue });
    }
    return res.status(500).json({ message: "Unable to add supplier" });
  }
};

// Get supplier by ID
export const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json(supplier);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update supplier details
export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { supplierId, name, contact } = req.body;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { supplierId, name, contact },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Unable to update supplier details" });
    }

    return res.status(200).json(updatedSupplier);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate contact error", keyValue: err.keyValue });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Unable to delete supplier details" });
    }
    return res.status(200).json({ message: "Supplier deleted successfully", deletedSupplier });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};