import Material from "../Model/MaterialModel.js";

// Get all materials
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find().populate("supplierId", "name");
    if (!materials) {
      return res.status(404).json({ message: "Materials not found" });
    }
    return res.status(200).json({ materials });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new material
export const addMaterials = async (req, res) => {
  const { materialId, name, unit, unitPrice, reOrderLevel, quantity, supplierId } = req.body;

  try {
    const materials = new Material({
      materialId,
      name,
      unit,
      unitPrice,
      reOrderLevel,
      quantity,
      supplierId,
    });

    await materials.save();
    return res.status(200).json({ materials });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "unable to add materals" });
  }
};

// Get material by ID
export const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    return res.status(200).json({ material });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update material details
export const updateMaterial = async (req, res) => {
  const id = req.params.id;
  const { materialId, name, unit, unitPrice, reOrderLevel, quantity, supplierId } = req.body;

  try {
    let materials = await Material.findByIdAndUpdate(
      id,
      {
        materialId,
        name,
        unit,
        unitPrice,
        reOrderLevel,
        quantity,
        supplierId,
      },
      { new: true }
    );

    if (!materials) {
      return res.status(404).json({ message: "Unabe to Update Material Details" });
    }

    await materials.save();
    return res.status(200).json({ materials });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete material details
export const deleteMaterial = async (req, res) => {
  const id = req.params.id;

  try {
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ message: "Unabe to Delete Material Details" });
    }
    return res.status(200).json({ material });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};