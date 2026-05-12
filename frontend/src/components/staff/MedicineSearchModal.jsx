import React, { useMemo, useState } from 'react';
import { Search, X, Plus, Pill } from 'lucide-react';

/**
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(med: { mavattu: number; ten: string; dv: string; lieudung?: string; cachdung?: string }) => void} onAddMedicine
 * @param {{ mavattu: number; tenvattu?: string; loaivattu?: string; huongdansudung?: string; congdung?: string }[]} medicines
 */
const MedicineSearchModal = ({ isOpen, onClose, onAddMedicine, medicines = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = Array.isArray(medicines) ? medicines : [];
    if (!q) return list;
    return list.filter((m) => {
      const name = String(m?.tenvattu ?? '').toLowerCase();
      const cd = String(m?.congdung ?? '').toLowerCase();
      return name.includes(q) || cd.includes(q);
    });
  }, [medicines, searchTerm]);

  if (!isOpen) return null;

  const pickUnit = (m) => {
    const hd = String(m?.huongdansudung ?? '').trim();
    if (hd.length <= 20 && hd.length > 0) return hd;
    return 'Đơn vị';
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl flex flex-col rounded-lg shadow-2xl overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-100">
          <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wider flex items-center gap-2">
            <Pill size={18} /> Chọn thuốc từ danh mục
          </h3>
          <button type="button" onClick={onClose} className="hover:bg-slate-200 rounded-full p-1 transition-colors text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Tên thuốc, công dụng..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md shadow-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
          {filteredMedicines.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => (
                <button
                  key={med.mavattu}
                  type="button"
                  className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center group transition-colors"
                  onClick={() =>
                    onAddMedicine({
                      mavattu: med.mavattu,
                      ten: med.tenvattu || `Thuốc #${med.mavattu}`,
                      sl: 1,
                      dv: pickUnit(med),
                      lieudung: '',
                      cachdung: med.huongdansudung ? String(med.huongdansudung).slice(0, 200) : '',
                    })
                  }
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{med.tenvattu}</p>
                    <p className="text-xs text-slate-500 italic truncate">
                      {med.loaivattu || 'Thuốc'} — {med.congdung || '—'}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold group-hover:bg-blue-600 group-hover:text-white shrink-0">
                    <Plus size={14} /> Chọn
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 italic text-sm">
              {medicines.length === 0
                ? 'Chưa có thuốc trong danh mục (loại «thuốc»).'
                : 'Không tìm thấy thuốc khớp từ khóa.'}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-100 flex justify-end bg-slate-50">
          <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-bold text-sm hover:underline">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineSearchModal;
