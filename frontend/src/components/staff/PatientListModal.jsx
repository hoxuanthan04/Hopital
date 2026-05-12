import React from 'react';
import { X, Maximize } from 'lucide-react';

const PatientListModal = ({ isOpen, onClose, patientQueue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-7xl max-h-[100vh] min-h-[60vh] flex flex-col rounded shadow-xl border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 mb-10">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-700 uppercase text-xl tracking-wider py-2">
              Danh sách bệnh nhân đợi khám
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Nội dung bảng danh sách */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-bold uppercase text-[11px] border-b border-slate-200">STT</th>
                <th className="px-6 py-3 font-bold uppercase text-[11px] border-b border-slate-200">Mã BN</th>
                <th className="px-6 py-3 font-bold uppercase text-[11px] border-b border-slate-200">Họ và tên</th>
                <th className="px-6 py-3 font-bold uppercase text-[11px] border-b border-slate-200 text-center">Trạng thái</th>
                <th className="px-6 py-3 font-bold uppercase text-[11px] border-b border-slate-200 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patientQueue.map((pt) => (
                <tr key={pt.ma} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4  text-slate-400">{pt.stt}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{pt.ma}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{pt.ten}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      pt.tt === 'Đang khám' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {pt.tt}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="px-3 py-1.5 bg-orange-500 text-white rounded text-[11px] font-bold hover:bg-orange-600 shadow-sm">
                      Gọi số
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700">
                      Tiếp nhận
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-slate-200 text-slate-600 rounded font-bold text-sm mx-2"
          >
            Đóng
          </button>
          <button
            onClick={() => window.open('/staff/PatientQueueDisplay')}
            className="px-6 py-2 bg-slate-200 text-slate-600 rounded font-bold text-sm"
          >
            Hiển thị màn hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientListModal;