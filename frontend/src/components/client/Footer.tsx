import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">TTH Hopital</span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Chúng tôi cung cấp dịch vụ y tế chất lượng cao, chú trọng đến sự chăm sóc bệnh nhân và ứng dụng công nghệ y tế hiện đại.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Điều hướng nhanh</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">Về chúng thôi</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Dịch vụ</Link></li>
              <li><Link to="/doctors" className="hover:text-blue-400 transition-colors">Bác sĩ</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Dịch vụ</h3>
            <ul className="space-y-4">
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Cardiology</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Neurology</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Orthopedics</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Pediatrics</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Dental Care</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Thông tin liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <span>123 Healthcare Ave, Medical City, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>info@healthcare.com</span>
              </li>
            </ul>
          </div>
        </div>
        

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} HealthCare. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
