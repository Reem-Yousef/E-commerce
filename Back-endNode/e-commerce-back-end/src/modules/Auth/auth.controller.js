import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../DB/models/user-model.js";

/* -------------------------------- Register -------------------------------- */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, phoneNumbers, addresses, age } =
      req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumbers,
      addresses,
      age,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ errors: messages });
    }
    next(error);
  }
};

/* ---------------------------------- Login --------------------------------- */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.isLoggedIn = true;
    await user.save();
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

/* ---------------------------------- LogOut --------------------------------- */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    console.log(userId);
    if (userId) {
      await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
