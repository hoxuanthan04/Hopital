import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-[#0B2046] py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Liên hệ</h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào, muốn đặt lịch hẹn hoặc cần hỗ trợ khẩn cấp.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Liên hệ với chúng tôi</h2>
              <p className="text-slate-600 mb-10 leading-relaxed">
                Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc về dịch vụ. Hãy liên hệ với chúng tôi và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Địa chỉ</h4>
                    <p className="text-slate-600">123 Healthcare Ave, Medical City, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Số điện thoại</h4>
                    <p className="text-slate-600">+1 (555) 123-4567</p>
                    <p className="text-slate-600">+1 (555) 987-6543 (Emergency)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Địa chỉ Email</h4>
                    <p className="text-slate-600">info@healthcare.com</p>
                    <p className="text-slate-600">support@healthcare.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Thời gian làm việc</h4>
                    <p className="text-slate-600">Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                    <p className="text-slate-600">Thứ 7: 9:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white p-8 rounded shadow-lg border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Gửi tin nhắn cho chúng tôi</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">Họ</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Nguyễn Văn"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">Tên</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="A"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="nguyenvana@gmail.com"
                  />
                </div>
                
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Lời nhắn</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-4 py-3 rounded border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                  ></textarea>
                </div>
                
                <button 
                  type="button" 
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
