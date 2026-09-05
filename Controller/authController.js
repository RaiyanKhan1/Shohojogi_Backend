import User from "../model/user.js";
import { hashPassword, comparePassword } from "../utils/helpers.js";




export const signup = (role) => async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required" });
  }

  try {
    const otherUser = await User.findOne({ email }).select("email");

    if (otherUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();

  
   

    return res.status(201).json({
      message: `New ${role} added successfully`,
   
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already in use" });
    }
    return res.status(400).json({ error: err.message });
  }
};

export const login = (role) => async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email, role }).select("-__v");

    if (!user) {
      return res.status(404).json({ error: `No ${role} found with this email` });
    }

    const isSame = await comparePassword(password, user.password);
    if (!isSame) {
      return res.status(400).json({ error: "Wrong password" });
    }

   
  

    return res.status(200).json({
      
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const logout = (req, res) => {

  return res.status(200).json({ message: "Logout successful" });
};
