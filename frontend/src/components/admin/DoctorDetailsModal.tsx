
import React from 'react';
import { X, Phone, Mail, Award, Briefcase, Stethoscope, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Doctor } from '../../../types';

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({ doctor, onClose }) => {
  if (!doctor) return null;

  return (
    <div style={{ marginTop: '0px' }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl rounded-[8px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <img src={doctor.avatar} alt={doctor.name} className="w-50 h-50 rounded-3xl border-4 border-white shadow-lg object-cover bg-white" />
            <div className={`absolute bottom-2 left-40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border-2 border-white ${
              doctor.status === 'Available' ? 'bg-emerald-500 text-white' : 
              doctor.status === 'Busy' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
            }`}>
              {doctor.status}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{doctor.name}</h3>
              <p className="text-blue-600 font-semibold flex items-center gap-2 mt-1">
                <Stethoscope size={16} /> {doctor.specialty}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs font-bold text-slate-400  tracking-widest mb-1 flex items-center gap-1">
                  <Award size={12} /> Học hàm
                </p>
                <p className="text-sm font-bold text-slate-700">{doctor.degree}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs font-bold text-slate-400  tracking-widest mb-1 flex items-center gap-1">
                  <Briefcase size={12} /> Chức vụ
                </p>
                <p className="text-sm font-bold text-slate-700">{doctor.experience}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded transition-colors group">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{doctor.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded transition-colors group">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700">{doctor.email}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                <Calendar size={18} /> Book Visit
              </button>
              <button className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded flex items-center justify-center gap-2 transition-all border border-slate-100">
                <MessageSquare size={18} /> Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsModal;
