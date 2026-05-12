import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration and redirect to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B2046] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Background" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2046]/80 to-[#0084FF]/80"></div>
        </div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <Link to="/" className="flex items-center gap-2 text-white mb-12 inline-flex">
            <div className="bg-white p-1.5 rounded-sm flex items-center justify-center">
              <Plus className="h-6 w-6 text-[#0084FF]" strokeWidth={4} />
            </div>
            <span className="font-bold text-2xl tracking-wide">JHC Clinic</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Tham gia cộng đồng của chúng tôi để nhận được dịch vụ chăm sóc sức khỏe tốt nhất.
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Tạo tài khoản để thuận tiện quản lý lịch khám, xem hồ sơ y tế và kết nối với đội ngũ bác sĩ hàng đầu.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-blue-200">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-[#0B2046]" src="https://images.unsplash.com/photo-1594824436998-d8362c4ce9ac?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
            </div>
            <p>Trusted by 10,000+ patients</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <h2 className="text-3xl font-bold text-[#0B2046] mb-3">Create an account</h2>
            <p className="text-slate-500">Please fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#0084FF] focus:ring-[#0084FF] border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                I agree to the <a href="#" className="text-[#0084FF] hover:underline">Terms of Service</a> and <a href="#" className="text-[#0084FF] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0084FF] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0084FF] transition-all mt-6"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#0084FF] hover:text-blue-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
