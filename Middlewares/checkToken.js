import jwt from "jsonwebtoken";

const checkToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
};

export default checkToken;