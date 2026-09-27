import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
    next();
  };
}
