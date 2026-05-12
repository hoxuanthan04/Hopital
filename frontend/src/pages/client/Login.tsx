import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import TaiKhoanService from '../../services/taikhoan.service'; // Đảm bảo đường dẫn này đúng

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập từ Service
      const response = await TaiKhoanService.login(username, password);
      const user = response.user;

      // 2. Điều hướng dựa trên loại tài khoản (Role-based Routing)
      // Bạn có thể thay đổi path cho khớp với App.tsx của bạn
      switch (user.loaitaikhoan) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'Bác sĩ':
          navigate('/staff/home');
          break;
        case 'Staff':
          navigate('/staff/home');
          break;
        case 'client':
          navigate(
            fromPath && fromPath !== '/login' ? fromPath : '/'
          );
          break;
        default:
          navigate('/'); // Mặc định về trang chủ nếu không khớp
          break;
      }
    } catch (err: any) {
      // 3. Xử lý hiển thị lỗi từ Backend
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B2046] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Background" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2046]/80 to-[#0084FF]/80"></div>
        </div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <Link to="/" className="flex items-center gap-2 text-white mb-12 inline-flex">
            <div className="bg-white p-1.5 rounded flex items-center justify-center">
              <Plus className="h-6 w-6 text-[#0084FF]" strokeWidth={4} />
            </div>
            <span className="font-bold text-2xl tracking-wide">JHC Clinic</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Chào mừng bạn quay trở lại hệ thống chăm sóc sức khỏe.
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Truy cập hồ sơ y tế, đặt lịch khám và kết nối với bác sĩ của bạn một cách an toàn và tiện lợi.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-blue-200">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1594824436998-d8362c4ce9ac?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
            </div>
            <p>Hơn 10.000 bệnh nhân tin tưởng sử dụng.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link to="/" className="flex items-center gap-2 text-[#0B2046]">
              <div className="bg-[#0084FF] p-1.5 rounded-sm flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" strokeWidth={4} />
              </div>
              <span className="font-bold text-2xl tracking-wide">JHC Clinic</span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0B2046] mb-3">Đăng nhập</h2>
            <p className="text-slate-500">Vui lòng nhập thông tin đăng nhập để truy cập tài khoản của bạn.</p>
          </div>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded animate-shake">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="Tên tài khoản hệ thống"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0084FF] focus:ring-[#0084FF] border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#0084FF] hover:text-blue-600 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-[#0084FF] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0084FF] transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <a href="/register" className="font-medium text-[#0084FF] hover:text-blue-600 transition-colors">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}