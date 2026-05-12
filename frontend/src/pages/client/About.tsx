import { CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-[#0B2046] py-20 border-b border-slate-100 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Về chúng tôi</h1>
          <p className="text-lg text-white max-w-2xl mx-auto ">
            Tìm hiểu thêm về sứ mệnh, tầm nhìn và đội ngũ tận tâm đứng sau các dịch vụ chăm sóc sức khỏe đẳng cấp của chúng tôi.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Dedicated to Providing the Best Healthcare</h3>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                Founded in 2005, HealthCare has grown from a small community clinic to a comprehensive medical center. Our journey has been driven by a singular mission: to provide accessible, high-quality healthcare to everyone.
              </p>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                We believe in a patient-centric approach, where your health and well-being are at the core of everything we do. Our team of specialists, nurses, and support staff work tirelessly to ensure you receive the best possible care in a comfortable and safe environment.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Our Mission</h4>
                    <p className="text-sm text-slate-600">To improve the health of the people we serve.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Our Vision</h4>
                    <p className="text-sm text-slate-600">To be the healthcare provider of choice.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop" 
                alt="Hospital Building" 
                className="rounded-2xl object-cover h-64 w-full"
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" 
                alt="Medical Equipment" 
                className="rounded-2xl object-cover h-64 w-full mt-8"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">15+</div>
              <div className="text-slate-300 font-medium">Years of Experience</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">50+</div>
              <div className="text-slate-300 font-medium">Medical Specialists</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">20k+</div>
              <div className="text-slate-300 font-medium">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">100%</div>
              <div className="text-slate-300 font-medium">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
