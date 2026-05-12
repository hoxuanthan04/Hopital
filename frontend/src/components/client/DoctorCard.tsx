import { Facebook, Twitter, Linkedin } from 'lucide-react';

interface DoctorCardProps {
  name: string;
  specialty: string;
  image: string;
}

export default function DoctorCard({ name, specialty, image }: DoctorCardProps) {
  return (
    <div className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <div className="flex space-x-3">
            <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-slate-900 mb-1">{name}</h3>
        <p className="text-blue-600 font-medium">{specialty}</p>
      </div>
    </div>
  );
}
