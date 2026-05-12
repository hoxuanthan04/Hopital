import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { 
  LayoutDashboard, 
  BookCheck,
  HandCoins,
  CalendarCheck2, 
  Eye, 
  Settings, 
  LogOut,
  DoorOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate(); // Hook để điều hướng

  const menuItems = [
    { name: 'Trang chủ', path: '/staff/home', icon: LayoutDashboard },
    { name: 'Khám bệnh', path: '/staff/patientqueue', icon: Eye },
    { name: 'Tiếp nhận', path: '/staff/registerexamination', icon: DoorOpen },
    { name: 'Lịch khám', path: '/staff/appointmentsmanager', icon: BookCheck },
    { name: 'Thanh toán', path: '/staff/invoicemanagement', icon: HandCoins },
    { name: 'Lịch làm việc cá nhân', path: '/staff/my-schedule', icon: CalendarCheck2 },
    { name: 'Cài đặt', path: '/staff/settings', icon: Settings },
  ];

  // Hàm xử lý đăng xuất dành cho nhân viên
  const handleLogout = () => {
    // 1. Xóa sạch dấu vết đăng nhập
    localStorage.removeItem('token');
    localStorage.setItem('user', ''); // Hoặc removeItem
    localStorage.clear(); // Xóa sạch tất cả nếu cần chắc chắn

    // 2. Đẩy người dùng về trang login
    // replace: true để xóa lịch sử, ngăn nhấn nút Back quay lại trang staff
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-50">
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
                ? 'bg-blue-50 text-blue-600 font-medium ' 
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
          onClick={handleLogout} // Gọi hàm logout ở đây
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all w-full px-3 py-3 rounded-lg"
        >
          <LogOut size={22} />
          {isOpen && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;