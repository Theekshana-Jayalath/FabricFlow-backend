import Purchase from "../Model/PurchaseModel.js";

// Get all purchases
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplierId", "name")
      .populate("materialId", "name");

    if (!purchases) {
      return res.status(404).json({ message: "Purchases not found" });
    }

    return res.status(200).json({ purchases });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new purchase
export const addPurchase = async (req, res) => {
  const { purchaseId, supplierId, materialId, quantity, unitPrice, date } = req.body;

  try {
    const totalCost = quantity * unitPrice;
    const purchase = new Purchase({
      purchaseId,
      supplierId,
      materialId,
      quantity,
      unitPrice,
      totalCost,
      date,
    });

    await purchase.save();
    return res.status(200).json({ purchase });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Unable to add purchase" });
  }
};

// Get purchase by ID
export const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const purchase = await Purchase.findById(id)
      .populate("supplierId", "name")
      .populate("materialId", "name");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    return res.status(200).json({ purchase });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update purchase details
export const updatePurchase = async (req, res) => {
  const id = req.params.id;
  const { purchaseId, supplierId, materialId, quantity, unitPrice, date } = req.body;

  try {
    const totalCost = quantity * unitPrice;
    let purchase = await Purchase.findByIdAndUpdate(
      id,
      { purchaseId, supplierId, materialId, quantity, unitPrice, totalCost, date },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ message: "Unable to update purchase details" });
    }

    await purchase.save();
    return res.status(200).json({ purchase });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete purchase
export const deletePurchase = async (req, res) => {
  const id = req.params.id;

  try {
    const purchase = await Purchase.findByIdAndDelete(id);
    if (!purchase) {
      return res.status(404).json({ message: "Unable to delete purchase" });
    }

    return res.status(200).json({ purchase });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};