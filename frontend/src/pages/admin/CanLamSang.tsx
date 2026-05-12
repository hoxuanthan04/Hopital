import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Info, Trash2, 
  MoreHorizontal, Activity, 
  CheckCircle2, AlertCircle
} from 'lucide-react';
import CanLamSangService from '../../services/canlamsang.service';
import CanLamSangModal from '../../components/admin/CanLamSangModal';
// Import component phân trang
import Pagination from '../../components/admin/Pagination'; 

const CanLamSang = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await CanLamSangService.getAll();
      setServices(data);
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ cận lâm sàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Lọc dữ liệu
  const filteredServices = services.filter(item => 
    item.tendichvu.toLowerCase().includes(search.toLowerCase()) ||
    item.loaidichvu.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán dữ liệu hiển thị cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

  // Điều khiển Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedService(null);
    setModalOpen(true);
  };

  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedService(item);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedService(item);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (modalMode === 'add') {
        await CanLamSangService.create(data);
        alert("Thêm dịch vụ thành công!");
      } else {
        await CanLamSangService.update(data.madichvu, data);
        alert("Cập nhật thành công!");
      }
      setModalOpen(false);
      fetchServices();
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await CanLamSangService.delete(id);
        fetchServices();
      } catch (error) {
        alert("Lỗi khi xóa dữ liệu");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden ">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-row justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên dịch vụ, loại hình..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-slate-500 rounded outline-none text-sm transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button   
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95">
            <Plus size={20} /> Thêm dịch vụ
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="py-4 px-6">Tên dịch vụ</th>
                <th className="py-4 px-4">Phân loại</th>
                <th className="py-4 px-4">Đơn giá (VNĐ)</th>
                <th className="py-4 px-4">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.madichvu} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-6">
                      <p className="text-sm text-slate-500 leading-none mb-1">{item.tendichvu}</p>
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2.5 py-1 text-sm text-slate-500">
                        {item.loaidichvu}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <p className="text-sm text-slate-500">
                        {new Intl.NumberFormat('vi-VN').format(item.gia)}
                      </p>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        {item.trangthai === 'Đang hoạt động' ? (
                          <><CheckCircle2 size={14} className="text-slate-500" /> <span className="text-sm text-slate-500">Hoạt động</span></>
                        ) : (
                          <><AlertCircle size={14} className="text-slate-300" /> <span className="text-sm text-slate-300 ">Tạm ngưng</span></>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenView(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Info size={18} />
                        </button>
                        <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-amber-600">
                          <MoreHorizontal size={18} /> 
                        </button>
                        <button onClick={() => handleDelete(item.madichvu)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-10 text-center text-slate-400 text-sm">Không tìm thấy dữ liệu phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gọi component phân trang mới */}
        {!loading && filteredServices.length > 0 && (
          <Pagination
            totalItems={filteredServices.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CanLamSangModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave}
        initialData={selectedService}
        mode={modalMode}
      />
    </div>
  );
};

export default CanLamSang;