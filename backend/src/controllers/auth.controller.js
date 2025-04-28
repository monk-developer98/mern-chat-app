import cloudinary from "../lib/cloudnary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      const { password, ...others } = newUser._doc;
      res
        .status(201)
        .json({ message: "User created successfully", user: others });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in Signup controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try { 
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { password: hashedPassword, ...others } = user._doc;
    
    generateToken(user._id, res);
    res.status(200).json({  message: "Login successful",user: others})

  } catch (error) {
    console.log("Error in Login controller", error.message);
    res.status(500).json({ message: "Internal server error" }); 
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0,});
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in Logout controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
    try {
      const  { profilePic } = req.body;
      const userId = req.user._id;

      if(!profilePic) {
        return res.status(400).json({ message: "Please provide a profile picture" });
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic)
      const updatedUser = await User.findByIdAndUpdate(userId, {
        profilePic: uploadResponse.secure_url,
      }, { new: true });
      
      res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.log("Error in updateProfile controller", error.message);
      res.status(500).json({ message: "Internal server error" });
      
    }
}

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}