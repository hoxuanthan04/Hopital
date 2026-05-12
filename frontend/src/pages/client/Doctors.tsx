import DoctorCard from '../../components/client/DoctorCard';

export default function Doctors() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-[#0B2046] py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Bác sĩ của chúng tôi</h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Gặp gỡ đội ngũ chuyên gia y tế có trình độ cao và giàu kinh nghiệm, luôn tận tâm vì sức khỏe của bạn.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <DoctorCard 
              name="Dr. Amanda Lee"
              specialty="General Practitioner"
              image="https://images.unsplash.com/photo-1527613426496-228bb8ccf146?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. Robert Taylor"
              specialty="Surgeon"
              image="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. Jessica Martinez"
              specialty="Dermatologist"
              image="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=800&auto=format&fit=crop"
            />
            <DoctorCard 
              name="Dr. David Kim"
              specialty="Ophthalmologist"
              image="https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=800&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
