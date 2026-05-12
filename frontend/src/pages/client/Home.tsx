import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, Brain, Bone, Baby, Stethoscope, Activity, CheckCircle2 } from 'lucide-react';
import ServiceCard from '../../components/client/ServiceCard';

const HERO_IMAGES = [
  "https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg",
  "https://images.pexels.com/photos/35996177/pexels-photo-35996177.jpeg",
  "https://images.pexels.com/photos/2398970/pexels-photo-2398970.jpeg",
  "https://images.pexels.com/photos/5736109/pexels-photo-5736109.jpeg",
  "https://images.pexels.com/photos/5383960/pexels-photo-5383960.jpeg"
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] lg:h-[800px] flex items-center overflow-hidden bg-slate-50">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          {HERO_IMAGES.map((img, index) => (
            <img 
              key={img}
              src={img} 
              alt={`Medical Professional ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover object-center md:object-right transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}
          {/* Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-3/4 lg:w-2/3 z-10"></div>
        </div>

        {/* Decorative Wave Pattern */}
        <div className="absolute top-0 left-0 w-full h-full z-10 opacity-10 pointer-events-none overflow-hidden">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-blue-600 stroke-current fill-none stroke-[0.1]">
              <path d="M-10,20 C30,50 60,-10 110,30" />
              <path d="M-10,30 C30,60 60,0 110,40" />
              <path d="M-10,40 C30,70 60,10 110,50" />
              <path d="M-10,50 C30,80 60,20 110,60" />
              <path d="M-10,60 C30,90 60,30 110,70" />
              <path d="M-10,70 C30,100 60,40 110,80" />
           </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 relative z-20 w-full">
          <div className="max-w-2xl">
            <h2 className="text-[#0084FF] font-bold text-lg md:text-xl mb-4 tracking-wide">
              Y Tế & Sức Khỏe
            </h2>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0B2046] leading-[1.15] mb-6">
              Dịch vụ chăm sóc<br />
              sức khỏe chuyên nghiệp<br />
              và thân thiện
            </h1>
            <p className="text-slate-600 text-lg md:text-xl mb-10 max-w-lg">
              Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao cho bạn và gia đình.
            </p>
            <Link to="/book-appointment" className="inline-flex items-center gap-2 bg-[#0084FF] text-white px-8 py-3.5 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
              Đặt lịch ngay
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-[#0084FF] w-8' : 'bg-slate-300/70 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Dịch vụ của chúng tôi</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Dịch vụ y tế chất lượng cao dành cho bạn</h3>
            <p className="text-slate-600 text-lg">
              Chúng tôi cung cấp nhiều dịch vụ y tế nhằm đảm bảo bạn và gia đình nhận được sự chăm sóc tốt nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<HeartPulse className="h-8 w-8" />}
              title="Tim mạch"
              description="Chăm sóc toàn diện cho tim, bao gồm chẩn đoán, điều trị và phòng ngừa."
            />
            <ServiceCard 
              icon={<Brain className="h-8 w-8" />}
              title="Thần kinh"
              description="Chẩn đoán và điều trị các bệnh liên quan đến hệ thần kinh và não."
            />
            <ServiceCard 
              icon={<Bone className="h-8 w-8" />}
              title="Chỉnh hình"
              description="Điều trị các vấn đề về xương, khớp, dây chằng, gân và cơ."
            />
            <ServiceCard 
              icon={<Baby className="h-8 w-8" />}
              title="Nhi khoa"
              description="Dịch vụ chăm sóc sức khỏe dành cho trẻ sơ sinh, trẻ em và thanh thiếu niên."
            />
            <ServiceCard 
              icon={<Stethoscope className="h-8 w-8" />}
              title="Khám tổng quát"
              description="Dịch vụ chăm sóc sức khỏe tổng thể cho mọi lứa tuổi."
            />
            <ServiceCard 
              icon={<Activity className="h-8 w-8" />}
              title="Cấp cứu"
              description="Dịch vụ cấp cứu y tế 24/7 cho các trường hợp khẩn cấp."
            />
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Xem tất cả dịch vụ
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/33419523/pexels-photo-33419523.jpeg" 
                alt="Medical Team" 
                className="rounded shadow-xl object-cover h-[500px] w-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -right-8 -bottom-8 bg-blue-600 text-white p-8 rounded shadow-xl hidden md:block max-w-xs">
                <h4 className="text-2xl font-bold mb-2">Hơn 15 năm</h4>
                <p className="text-blue-100">Kinh nghiệm trong việc cung cấp các dịch vụ chăm sóc sức khỏe chất lượng cao.</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Về chúng tôi</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Chúng tôi luôn đảm bảo mang đến dịch vụ y tế tốt nhất cho sức khỏe của bạn</h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Bệnh viện của chúng tôi cung cấp cơ sở vật chất hiện đại cùng đội ngũ bác sĩ giàu kinh nghiệm nhằm mang lại dịch vụ chăm sóc sức khỏe chất lượng cao cho bệnh nhân.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Đội ngũ bác sĩ chất lượng cao</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Trang thiết bị y tế hiện đại</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Ưu đãi cho các dịch vụ điều trị</span>
                </li>
              </ul>
              
              <Link to="/about" className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section Preview */}
      {/* <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Đội ngũ bác sĩ</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Gặp gỡ đội ngũ bác sĩ chuyên nghiệp của chúng tôi</h3>
            </div>
            <Link to="/doctors" className="inline-flex justify-center items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-semibold hover:bg-slate-200 transition-colors shrink-0">
              Xem tất cả bác sĩ
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <DoctorCard 
              name="Dr. Sarah Jenkins"
              specialty="Cardiologist"
              image="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. Michael Chen"
              specialty="Neurologist"
              image="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. Emily Rodriguez"
              specialty="Pediatrician"
              image="https://images.unsplash.com/photo-1594824436998-058d01e6da39?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. James Wilson"
              specialty="Orthopedics"
              image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop"
            />
          </div>
        </div>
      </section> */}
      
      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Bạn cần bác sĩ để kiểm tra sức khỏe?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Hãy đặt lịch hẹn để nhận được sự hỗ trợ từ các bác sĩ chuyên gia của chúng tôi. 
            Chúng tôi luôn sẵn sàng mang đến cho bạn dịch vụ chăm sóc sức khỏe tốt nhất.
          </p>
          <Link to="/contact" className="inline-flex justify-center items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">
            Đặt lịch khám
          </Link>
        </div>
      </section>
    </div>
  );
}
