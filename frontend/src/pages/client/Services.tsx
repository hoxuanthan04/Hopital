import ServiceCard from '../../components/client/ServiceCard';
import { HeartPulse, Brain, Bone, Baby, Stethoscope, Activity, Eye, Ear, Pill } from 'lucide-react';

export default function Services() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Services</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive range of medical services designed to meet your healthcare needs.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<HeartPulse className="h-8 w-8" />}
              title="Cardiology"
              description="Comprehensive care for your heart, including diagnostics, treatment, and preventive care."
            />
            <ServiceCard 
              icon={<Brain className="h-8 w-8" />}
              title="Neurology"
              description="Expert diagnosis and treatment of disorders affecting the nervous system and brain."
            />
            <ServiceCard 
              icon={<Bone className="h-8 w-8" />}
              title="Orthopedics"
              description="Specialized care for bones, joints, ligaments, tendons, and muscles."
            />
            <ServiceCard 
              icon={<Baby className="h-8 w-8" />}
              title="Pediatrics"
              description="Dedicated healthcare services for infants, children, and adolescents."
            />
            <ServiceCard 
              icon={<Stethoscope className="h-8 w-8" />}
              title="General Practice"
              description="Primary care services focusing on overall health and wellness for all ages."
            />
            <ServiceCard 
              icon={<Activity className="h-8 w-8" />}
              title="Emergency Care"
              description="24/7 emergency medical services for urgent health conditions and injuries."
            />
            <ServiceCard 
              icon={<Eye className="h-8 w-8" />}
              title="Ophthalmology"
              description="Comprehensive eye care, from routine exams to advanced surgical procedures."
            />
            <ServiceCard 
              icon={<Ear className="h-8 w-8" />}
              title="ENT"
              description="Specialized care for ear, nose, and throat conditions."
            />
            <ServiceCard 
              icon={<Pill className="h-8 w-8" />}
              title="Pharmacy"
              description="On-site pharmacy providing prescription medications and health advice."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
