
import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';

interface ShareContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PATIENTS = [
  { id: '1', name: 'Elizabeth Polson', avatar: 'https://picsum.photos/seed/p1/40/40', selected: true },
  { id: '2', name: 'EG Subramani', avatar: 'https://picsum.photos/seed/p5/40/40', selected: true },
  { id: '3', name: 'John David', avatar: 'https://picsum.photos/seed/p2/40/40', selected: true },
  { id: '4', name: 'Krishtav Rajan', avatar: 'https://picsum.photos/seed/p3/40/40', selected: true },
  { id: '5', name: 'Sumanth Tinson', avatar: 'https://picsum.photos/seed/p4/40/40', selected: false },
  { id: '6', name: 'Ranjan Maari', avatar: 'https://picsum.photos/seed/p6/40/40', selected: false },
];

const ShareContentModal: React.FC<ShareContentModalProps> = ({ isOpen, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(PATIENTS.filter(p => p.selected).map(p => p.id));
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const togglePatient = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const filteredPatients = PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ marginTop: '0px' }} className=" fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ">
      <div className="bg-white w-full max-w-md rounded-[16px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Share Education Content</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Patient's Name"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 max-h-[400px]">
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="flex items-center justify-between py-2 cursor-pointer group"
                onClick={() => togglePatient(patient.id)}
              >
                <div className="flex items-center gap-4">
                  <img src={patient.avatar} alt="" className="w-12 h-12 rounded-full border border-slate-100" />
                  <span className="font-semibold text-slate-700">{patient.name}</span>
                </div>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedIds.includes(patient.id) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-white border-slate-200'
                }`}>
                  {selectedIds.includes(patient.id) && <Check size={14} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            Assign Ed Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareContentModal;
