import React, { useState } from 'react';
import { 
  Search, CreditCard, DollarSign, Receipt, 
  ChevronLeft, ChevronRight, CheckCircle, 
  Wallet, Landmark, Printer, MoreVertical, Filter
} from 'lucide-react';

const MOCK_INVOICES = [
  { mahoadon: 1, mabenhnhan: 101, hoten: 'Nguyễn Văn A', danhsachdichvu: 'Khám nội, Xét nghiệm máu', tongtien: 550000, sotienbaohiemchitra: 440000, thuctracuabenhnhan: 110000, trangthai: 'Chưa thanh toán' },
  { mahoadon: 2, mabenhnhan: 102, hoten: 'Trần Thị B', danhsachdichvu: 'Siêu âm 4D, Chụp X-Quang', tongtien: 850000, sotienbaohiemchitra: 0, thuctracuabenhnhan: 850000, trangthai: 'Đã thanh toán' },
  { mahoadon: 3, mabenhnhan: 105, hoten: 'Lê Văn C', danhsachdichvu: 'Khám nhi, Nội soi', tongtien: 1200000, sotienbaohiemchitra: 960000, thuctracuabenhnhan: 240000, trangthai: 'Chưa thanh toán' },
];

const Payments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hệ thống Thanh toán</h2>
          <p className="text-sm text-slate-500">Quản lý hóa đơn, đối soát bảo hiểm và thực hiện thu phí.</p>
        </div>
        <div className="flex gap-3 text-sm font-bold">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Hôm nay: 12,450,000đ
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo mã hóa đơn, tên bệnh nhân..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 border border-slate-100 text-slate-500 font-semibold rounded-2xl hover:bg-slate-50">
            <Filter size={18} /> Trạng thái
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="py-5 px-6">Mã HD / Bệnh nhân</th>
                <th className="py-5 px-4">Dịch vụ sử dụng</th>
                <th className="py-5 px-4 text-right">Tổng tiền</th>
                <th className="py-5 px-4 text-right text-emerald-600">Bảo hiểm chi</th>
                <th className="py-5 px-4 text-right font-black">Thực thu</th>
                <th className="py-5 px-4 text-center">Trạng thái</th>
                <th className="py-5 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.mahoadon} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="font-bold text-slate-800">#INV-00{inv.mahoadon}</div>
                    <div className="text-xs text-slate-400 font-medium">{inv.hoten} (ID: {inv.mabenhnhan})</div>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-xs text-slate-600 line-clamp-1 italic">{inv.danhsachdichvu}</p>
                  </td>
                  <td className="py-5 px-4 text-right text-sm text-slate-400 line-through">
                    {inv.tongtien.toLocaleString()}đ
                  </td>
                  <td className="py-5 px-4 text-right text-sm font-semibold text-emerald-600">
                    -{inv.sotienbaohiemchitra.toLocaleString()}đ
                  </td>
                  <td className="py-5 px-4 text-right font-black text-slate-900">
                    {inv.thuctracuabenhnhan.toLocaleString()}đ
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                      inv.trangthai === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.trangthai}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    {inv.trangthai === 'Chưa thanh toán' ? (
                      <button 
                        onClick={() => openPaymentModal(inv)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                      >
                        Thu tiền
                      </button>
                    ) : (
                      <button className="p-2 text-slate-400 hover:text-indigo-600"><Printer size={18}/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Hiển thị 1-10 trong số 120 hóa đơn</p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50"><ChevronLeft size={18}/></button>
            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">1</button>
            <button className="px-4 py-2 text-slate-400 text-xs font-bold hover:bg-slate-50 rounded-xl transition-colors">2</button>
            <button className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Receipt size={24} />
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800">Xác nhận thanh toán</h3>
                <p className="text-sm text-slate-500">Hóa đơn: #INV-00{selectedInvoice.mahoadon}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bệnh nhân:</span>
                  <span className="font-bold text-slate-800">{selectedInvoice.hoten}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-slate-200/60">
                  <span className="font-bold text-slate-500">Số tiền cần thu:</span>
                  <span className="font-black text-indigo-600">{selectedInvoice.thuctracuabenhnhan.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phương thức thanh toán</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Tiền mặt', icon: <Wallet size={18}/> },
                    { id: 'Chuyển khoản', icon: <Landmark size={18}/> },
                    { id: 'Thẻ / VNPay', icon: <CreditCard size={18}/> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        paymentMethod === method.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {method.icon}
                      <span className="text-[10px] font-bold">{method.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                <CheckCircle size={20} />
                Hoàn tất thu phí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

// Thêm X vào import lucide-react ở dòng đầu tiên
import { X } from 'lucide-react';