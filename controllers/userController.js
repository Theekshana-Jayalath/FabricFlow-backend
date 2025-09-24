import User from "../Model/UserModel.js";

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Add user
const addUsers = async (req, res) => {
  const { name, gmail, age, address, phone, gender, dob } = req.body;
  try {
    const user = new User({ name, gmail, age, address, phone, gender, dob });
    await user.save();
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(400).json({ message: "Unable to add user", error: err });
  }
};

// ✅ Get user by ID
const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Update user
const updateUser = async (req, res) => {
  const { name, gmail, age, address, phone, gender, dob } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, gmail, age, address, phone, gender, dob },
      { new: true } // return updated document
    );
    if (!user) return res.status(404).send({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Unable to update user", error: err });
  }
};

// ✅ Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send({ message: "User not found" });
    return res.status(200).json({ message: "User deleted", user });
  } catch (err) {
    return res.status(500).json({ message: "Unable to delete user", error: err });
  }
};

export default { getAllUsers, addUsers, getById, updateUser, deleteUser };
