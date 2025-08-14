import User from "../../../DB/models/user-model.js";
import bcrypt from "bcryptjs";

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const EditUserDataById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, image, email, password, phoneNumbers, addresses, age } =
      req.body;

    user.username = username || user.username;
    user.image = image || user.image;
    user.email = email || user.email;
    user.phoneNumbers = phoneNumbers || user.phoneNumbers;
    user.addresses = addresses || user.addresses;
    user.age = age || user.age;
    if (password) {
      const UpdatedPassword = await bcrypt.hash(password, 10);
      user.password = UpdatedPassword || user.password;
    }
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
};
