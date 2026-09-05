// Runs after checkToken. Rejects a valid token that belongs to the other role.
const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: `Only a ${role} can use this route` });
  }
  next();
};

export default checkRole;
