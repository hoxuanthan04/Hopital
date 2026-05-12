import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  User, 
  CalendarCheck2, 
  Package, 
  Settings, 
  LogOut,
  Home, 
  Settings2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate(); // Khởi tạo hook điều hướng

  const menuItems = [
    { name: 'Trang chủ', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bệnh nhân', path: '/admin/patients', icon: Users },
    { name: 'Lịch khám', path: '/admin/appointments', icon: Calendar },
    { name: 'Nhân viên', path: '/admin/customers', icon: Stethoscope },
    { name: 'Phòng', path: '/admin/rooms', icon: Home },
    { name: 'Dịch vụ', path: '/admin/subclinical', icon: Settings2 },
    { name: 'Tài khoản', path: '/admin/accounts', icon: User },
    { name: 'Chuyên khoa', path: '/admin/departments', icon: Stethoscope },
    { name: 'Vật tư thuốc', path: '/admin/inventory', icon: Package },
    { name: 'Lịch làm việc', path: '/admin/schedules', icon: CalendarCheck2 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    // 1. Xóa các thông tin xác thực
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Điều hướng về trang Login
    // Dùng replace: true để người dùng không thể nhấn nút "Back" quay lại trang Admin
    navigate('/login', { replace: true });
    
    // 3. Tùy chọn: Refresh lại trang để xóa sạch state cũ (nếu cần)
    // window.location.reload(); 
  };

  return (
    <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${isOpen ? 'w-55' : 'w-18'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-4 gap-3 border-b border-slate-50">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl">+</span>
        </div>
        {isOpen && <span className="text-blue-600 font-bold text-xl tracking-tight">TTH Hospital</span>}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-3 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded transition-all ${
                isActive  
                ? 'bg-blue-50 text-slate-900 font-medium ' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon size={22} className="shrink-0" />
            {isOpen && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={handleLogout} // Gọi hàm logout khi nhấn
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors w-full  rounded-lg hover:bg-red-50"
        >
          <LogOut size={22} />
          {isOpen && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;