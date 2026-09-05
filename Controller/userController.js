import User from "../model/user.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(["-password", "-__v"]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
