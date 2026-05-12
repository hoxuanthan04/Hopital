import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Check, X, Filter, 
  Eye, Loader2, ChevronDown
} from 'lucide-react';
import * as DKHKService from '../../services/dangkyhenkham.service'; 
// Import component phân trang
import Pagination from '../../components/admin/Pagination'; 

const AppointmentsManager: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Các state phục vụ bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Logic phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await DKHKService.getAllAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: number, currentItem: any, newStatus: string) => {
    try {
      const updatedData = { ...currentItem, trangthai: newStatus };
      await DKHKService.updateAppointment(id, updatedData);
      setAppointments(prev => 
        prev.map(item => item.id === id ? { ...item, trangthai: newStatus } : item)
      );
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  // --- LOGIC LỌC ĐA ĐIỀU KIỆN ---
  const filteredData = appointments.filter(app => {
    const matchesSearch = app.hoten.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.sodienthoai.includes(searchTerm);
    const matchesDate = filterDate ? app.ngaykham.includes(filterDate) : true;
    const matchesStatus = filterStatus === 'Tất cả' ? true : app.trangthai === filterStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Tính toán dữ liệu hiển thị cho trang hiện tại
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset về trang 1 mỗi khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên bệnh nhân hoặc số điện thoại..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-blue-500 rounded outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-transparent focus:border-blue-500 rounded outline-none appearance-none text-sm font-medium text-slate-600 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded outline-none focus:border-blue-500 text-sm font-medium text-slate-600"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          {(searchTerm || filterDate || filterStatus !== 'Tất cả') && (
            <button 
              onClick={() => {setSearchTerm(''); setFilterDate(''); setFilterStatus('Tất cả');}}
              className="px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded transition-colors"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Appointment List / Table */}
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="py-5 px-6">Bệnh nhân</th>
                <th className="py-5 px-6">Số điện thoại</th>
                <th className="py-5 px-4">Ngày hẹn khám</th>
                <th className="py-5 px-4">Giờ khám</th>
                <th className="py-5 px-4">Dịch vụ</th>
                <th className="py-5 px-4">Lý do</th>
                <th className="py-5 px-4 text-center">Trạng thái</th>
                <th className="py-5 px-6 text-right">Hành động xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search size={40} className="opacity-20" />
                      <p>Không tìm thấy lịch hẹn nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-2 px-6">
                      <p className="text-sm text-slate-500 leading-none mb-1">{app.hoten}</p>
                    </td>
                    <td className="py-2 px-6">
                      <p className="text-sm text-slate-500">{app.sodienthoai}</p>
                    </td>
                    <td className="py-2 px-4">
                      <div className="text-sm text-slate-500">
                        {new Date(app.ngaykham).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="text-sm text-slate-400">{app.giokham}</div>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span className="text-sm text-slate-500 block">{app.loaikham}</span>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span className="text-sm text-slate-500 line-clamp-1">{app.lydokham}</span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1.5 rounded text-sm font-medium tracking-tight ${
                        app.trangthai === 'Đã xác nhận' ? 'text-slate-600' : 
                        app.trangthai === 'Đã hủy' ? 'text-slate-400' : 'text-amber-400'
                      }`}>
                        {app.trangthai}
                      </span>
                    </td>
                    <td className="py-2 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(app.id, app, 'Đã xác nhận')}
                          disabled={app.trangthai === 'Đã xác nhận'}
                          className={`p-2.5 rounded transition-all ${
                            app.trangthai === 'Đã xác nhận' 
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-emerald-600 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, app, 'Đã hủy')}
                          disabled={app.trangthai === 'Đã hủy'}
                          className={`p-2.5 rounded transition-all ${
                            app.trangthai === 'Đã hủy'
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-rose-600 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          <X size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-100 mx-1" />
                        <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded transition-all">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Gọi component phân trang mới */}
        {!loading && filteredData.length > 0 && (
          <Pagination
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentsManager;