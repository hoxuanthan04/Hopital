import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Lấy dữ liệu từ localStorage
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // 1. Kiểm tra đăng nhập
  if (!token || !user) {
    // Lưu lại vị trí đang cố truy cập để sau khi login xong có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra phân quyền (Role-based access)
  if (allowedRoles && !allowedRoles.includes(user.loaitaikhoan)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Nếu thỏa mãn mọi điều kiện, cho phép truy cập vào các route con
  return <Outlet />;
};

export default ProtectedRoute;