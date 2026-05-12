import { Link, useNavigate } from 'react-router-dom';
import { Plus, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Briefcase, Bell } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import TaiKhoanService from '../../services/taikhoan.service';
import NotificationDropdown from '../NotificationDropdown';
import * as ThongBaoApi from '../../services/thongbao.service';

type StoredUser = {
  tentaikhoan?: string;
  loaitaikhoan?: string;
  /** Họ tên bệnh nhân / nhân viên (do backend gắn khi đăng nhập). */
  hoten?: string;
};

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || !localStorage.getItem('token')) return null;
    const u = JSON.parse(raw) as StoredUser;
    return u?.tentaikhoan ? u : null;
  } catch {
    return null;
  }
}

/** Link nội bộ (admin / nhân viên). Không hiển thị với tài khoản client. */
function getInternalPortalLink(role: string | undefined): { to: string; label: string; icon: typeof LayoutDashboard } | null {
  switch (role) {
    case 'Admin':
      return { to: '/admin/dashboard', label: 'Trang quản trị', icon: LayoutDashboard };
    case 'Staff':
    case 'Bác sĩ':
      return { to: '/staff/home', label: 'Trang nhân viên', icon: Briefcase };
    default:
      return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  const refreshUnread = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUnreadCount(0);
      return;
    }
    try {
      const c = await ThongBaoApi.getUnreadCount();
      setUnreadCount(Number.isFinite(c) ? c : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') setUser(readStoredUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    void refreshUnread();
    const onUpd = () => void refreshUnread();
    window.addEventListener('thongbao:updated', onUpd);
    return () => window.removeEventListener('thongbao:updated', onUpd);
  }, [refreshUnread]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!isNotifOpen) return;
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isNotifOpen]);

  useEffect(() => {
    if (!mobileNotifOpen) return;
    const close = (e: MouseEvent) => {
      if (mobileNotifRef.current && !mobileNotifRef.current.contains(e.target as Node)) {
        setMobileNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [mobileNotifOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    TaiKhoanService.logout();
    setUser(null);
    setUserMenuOpen(false);
    setIsNotifOpen(false);
    setMobileNotifOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  const displayName =
    (user?.hoten && String(user.hoten).trim()) || user?.tentaikhoan || '';
  const portal = user ? getInternalPortalLink(user.loaitaikhoan) : null;
  const PortalMenuIcon = portal ? portal.icon : null;

  const closeMenus = () => {
    setUserMenuOpen(false);
    setIsOpen(false);
    setMobileNotifOpen(false);
    setIsNotifOpen(false);
  };

  return (
    <nav className="bg-[#0B2046] h-20 flex relative z-50">
      {/* Left Blue Section */}
      <div 
        className="flex-1 bg-[#0084FF] flex items-center justify-end" 
        style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0 100%)' }}
      >
        {/* Absolutely positioned container for Logo to align with max-w-7xl */}
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex items-center h-full">
            <Link to="/" className="flex items-center gap-2 text-white pointer-events-auto">
              <div className="bg-white p-1 rounded-sm flex items-center justify-center">
                <Plus className="h-5 w-5 text-[#0084FF]" strokeWidth={4} />
              </div>
              <span className="font-bold text-xl tracking-wide">TTH HOPITAL</span>
            </Link>
          </div>
        </div>
        
        {/* Links */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8 text-white text-sm font-medium pr-12 lg:pr-24 relative z-10">
          <Link to="/" className="hover:text-blue-200 transition-colors">Trang chủ</Link>
          <Link to="/about" className="hover:text-blue-200 transition-colors">Về chúng tôi</Link>
          <Link to="/doctors" className="hover:text-blue-200 transition-colors">Bác sĩ</Link>
          <Link to="/department" className="hover:text-blue-200 transition-colors">Chuyên khoa</Link>
          <Link to="/book-appointment" className="hover:text-blue-200 transition-colors">Đặt lịch</Link>
          <Link to="/medicalrecords" className="hover:text-blue-200 transition-colors">KQKB</Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/contact" className="hover:text-blue-200 transition-colors">
              Liên hệ
            </Link>
            {user ? (
              <div className="relative flex items-center" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen((v) => !v);
                    void refreshUnread();
                  }}
                  className={`relative p-1.5 rounded-md transition-colors ${
                    isNotifOpen ? 'bg-white/20 text-white' : 'text-white hover:bg-white/15 hover:text-blue-100'
                  }`}
                  aria-label="Thông báo"
                >
                  <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full border border-[#0084FF] leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </button>
                <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center pr-12 relative z-10">
          <button type="button" onClick={toggleMenu} className="text-white hover:text-blue-200 focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Right Dark Section */}
      <div className="hidden md:flex w-48 lg:w-64 shrink-0 items-center justify-center relative -ml-[30px]">
        {/* White Slanted Divider */}
        <div className="absolute left-0 top-0 h-full w-1 bg-white" style={{ transform: 'skewX(-20.5deg)', transformOrigin: 'bottom left' }}></div>
        {user ? (
          <div className="relative z-10 ml-4" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 max-w-full text-white text-sm font-medium hover:text-blue-200 px-4 py-2 rounded-full border border-white/25 bg-white/5"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[120px] lg:max-w-[200px]" title={displayName}>
                {displayName}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[220px] rounded-lg bg-white py-1 shadow-lg border border-slate-100 text-slate-800">
                {portal && PortalMenuIcon && (
                  <Link
                    to={portal.to}
                    onClick={closeMenus}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50 text-slate-800"
                  >
                    <PortalMenuIcon className="h-4 w-4 text-slate-500 shrink-0" />
                    {portal.label}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${portal ? 'border-t border-slate-100' : ''}`}
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-[#0084FF] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors ml-4 z-10">
            Đăng nhập
          </Link>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg md:hidden border-t border-slate-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#0084FF] hover:bg-blue-50">Trang chủ</Link>
            <Link to="/about" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#0084FF] hover:bg-blue-50">About</Link>
            <Link to="/department" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#0084FF] hover:bg-blue-50">Department</Link>
            <Link to="/pages" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#0084FF] hover:bg-blue-50">Pages</Link>
            <Link to="/blog" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#0084FF] hover:bg-blue-50">Blog</Link>
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-blue-50">
              <Link
                to="/contact"
                onClick={toggleMenu}
                className="text-base font-medium text-slate-700 hover:text-[#0084FF] flex-1 min-w-0"
              >
                Liên hệ
              </Link>
              {user ? (
                <div className="relative shrink-0" ref={mobileNotifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNotifOpen((v) => !v);
                      void refreshUnread();
                    }}
                    className={`relative p-2 rounded-lg border transition-colors ${
                      mobileNotifOpen
                        ? 'border-[#0084FF] bg-blue-50 text-[#0084FF]'
                        : 'border-slate-200 text-slate-600 hover:border-[#0084FF]/40 hover:bg-blue-50/50'
                    }`}
                    aria-label="Thông báo"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-0.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : null}
                  </button>
                  <NotificationDropdown
                    isOpen={mobileNotifOpen}
                    onClose={() => setMobileNotifOpen(false)}
                  />
                </div>
              ) : null}
            </div>
            {user ? (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <p className="px-3 text-sm text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-slate-800 truncate">{displayName}</span>
                </p>
                {portal && PortalMenuIcon && (
                  <Link
                    to={portal.to}
                    onClick={closeMenus}
                    className="flex w-full items-center justify-center gap-2 border border-slate-200 text-slate-800 px-6 py-3 rounded-full font-medium hover:bg-slate-50"
                  >
                    <PortalMenuIcon className="h-4 w-4" />
                    {portal.label}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 bg-slate-100 text-slate-800 px-6 py-3 rounded-full font-medium hover:bg-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={toggleMenu} className="block w-full text-center mt-4 bg-[#0084FF] text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
