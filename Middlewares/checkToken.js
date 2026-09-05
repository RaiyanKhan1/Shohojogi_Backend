import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

// The browser sends the token cookie automatically. Verify it and put the
// payload on req.user so controllers know who is asking.
const checkToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Invalid token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
    if (err) {
      res.clearCookie("token", cookieOptions);
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

export default checkToken;
