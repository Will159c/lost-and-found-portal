import jwt from "jsonwebtoken";


export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.isAdmin !== true || req.user.organization === "null") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
}