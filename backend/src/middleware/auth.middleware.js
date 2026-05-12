import jwt from "jsonwebtoken";

const JWT_SECRET = "your_super_secret_key";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Không tìm thấy token. Truy cập bị từ chối." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào request để dùng ở controller tiếp theo
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

/** Chỉ các role được liệt kê (ví dụ requireRole('Admin')). */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }
    next();
  };