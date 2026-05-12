import React from 'react';
import { Heart, Brain, Baby, Activity, Eye, Smile, Stethoscope, Microscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const departments = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Expert care for your heart and cardiovascular system with state-of-the-art technology and experienced specialists.',
    icon: Heart,
    color: 'bg-red-50 text-red-500',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Comprehensive diagnosis and treatment for disorders of the nervous system, brain, and spinal cord.',
    icon: Brain,
    color: 'bg-purple-50 text-purple-500',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Dedicated healthcare for infants, children, and adolescents in a friendly and comforting environment.',
    icon: Baby,
    color: 'bg-green-50 text-green-500',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Specialized treatment for bone, joint, and muscle conditions to restore your mobility and quality of life.',
    icon: Activity,
    color: 'bg-orange-50 text-orange-500',
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    description: 'Advanced eye care services ranging from routine vision exams to complex surgical procedures.',
    icon: Eye,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    id: 'dentistry',
    name: 'Dentistry',
    description: 'Complete dental care including preventive, restorative, and cosmetic treatments for a healthy smile.',
    icon: Smile,
    color: 'bg-teal-50 text-teal-500',
  },
  {
    id: 'primary-care',
    name: 'Primary Care',
    description: 'Your first point of contact for general health concerns, regular check-ups, and preventive care.',
    icon: Stethoscope,
    color: 'bg-indigo-50 text-indigo-500',
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    description: 'Accurate and timely diagnostic testing services to support your medical care and treatment plans.',
    icon: Microscope,
    color: 'bg-pink-50 text-pink-500',
  }
];

export default function Department() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#0B2046] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Chuyên khoa y tế</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Chúng tôi cung cấp nhiều dịch vụ y tế chuyên khoa để mang đến sự chăm sóc sức khỏe toàn diện cho bạn và gia đình.
          </p>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div key={dept.id} className="bg-white rounded shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col">
                <div className={`w-14 h-14 rounded flex items-center justify-center mb-6 ${dept.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0B2046] mb-3">{dept.name}</h3>
                <p className="text-slate-600 mb-6 flex-grow">{dept.description}</p>
                <Link 
                  to={`/book-appointment?dept=${dept.id}`}
                  className="inline-flex items-center gap-2 text-[#0084FF] font-medium group-hover:gap-3 transition-all mt-auto"
                >
                  Book Appointment <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-[#0084FF] rounded p-8 md:p-12 text-center text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="text-left max-w-2xl relative z-10">
            <h2 className="text-3xl font-bold mb-4">Bạn không chắc mình cần liên hệ với bộ phận nào?</h2>
            <p className="text-blue-100 text-lg">Our primary care physicians can help diagnose your condition and refer you to the right specialist for your specific needs.</p>
          </div>
          <div className="shrink-0 relative z-10">
            <Link to="/contact" className="inline-block bg-white text-[#0084FF] px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">
              Contact Us Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
