const bcrypt = require("bcryptjs"); // Changed to bcryptjs
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  const { email, password, firstName, lastName, username } = req.body;
  try {
    // Now using bcryptjs's hash function
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Duplicate key error:", error);
      res.status(409).json({ message: "Username or email already exists." });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred. Please try again later." });
    }
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Now using bcryptjs's compare function
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
