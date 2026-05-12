import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Info, Trash2, 
  MoreHorizontal, CheckCircle2, XCircle
} from 'lucide-react';
import VattuService from '../../services/vattu.service';
import SupplyModal from '../../components/admin/SupplyModal';
import Pagination from '../../components/admin/Pagination';

const Supplies = () => {
  const [supplies, setSupplies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const data = await VattuService.getAll();
      setSupplies(data);
    } catch (error) {
      console.error("Lỗi khi tải vật tư:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  // Logic lọc dữ liệu
  const filteredSupplies = supplies.filter(item => 
    item.tenvattu.toLowerCase().includes(search.toLowerCase()) ||
    item.nhasanxuat.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán dữ liệu hiển thị cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSupplies.slice(indexOfFirstItem, indexOfLastItem);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [selectedSupply, setSelectedSupply] = useState(null);

  // 1. Mở modal thêm mới
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedSupply(null);
    setModalOpen(true);
  };

  // 2. Mở modal xem chi tiết
  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedSupply(item);
    setModalOpen(true);
  };

  // 3. Mở modal chỉnh sửa
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedSupply(item);
    setModalOpen(true);
  };

  // 4. Hàm Save chung cho cả Add và Edit
  const handleSaveSupply = async (data) => {
    try {
      if (modalMode === 'add') {
        await VattuService.create(data);
        alert("Thêm thành công!");
      } else {
        await VattuService.update(data.mavattu, data);
        alert("Cập nhật thành công!");
      }
      setModalOpen(false);
      fetchSupplies(); // Reload data
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vật tư này?")) {
      try {
        await VattuService.delete(id);
        fetchSupplies();
      } catch (error) {
        alert("Lỗi khi xóa dữ liệu");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Thanh công cụ */}
        <div className="p-6 border-b border-slate-50 flex flex-row justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên vật tư, nhà sản xuất..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded outline-none text-sm transition-all"
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
            <Plus size={20} /> Thêm vật tư mới
          </button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                <th className="py-4 px-6">Tên vật tư / Thuốc</th>
                <th className="py-4 px-6">Nhà sản xuất</th>
                <th className="py-4 px-4">Loại</th>
                <th className="py-4 px-4">Giá bán</th>
                <th className="py-4 px-4">Nhà sản xuất</th>
                <th className="py-4 px-4 text-center">Web</th>
                <th className="py-4 px-4">Công dụng</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="8" className="py-12 text-center text-slate-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : currentItems.map((item) => (
                <tr key={item.mavattu} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-slate-500 leading-none mb-1">{item.tenvattu}</p>
                      </div>
                    </div>
                  </td><td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{item.hangsanxuat}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm text-slate-500">
                      {item.loaivattu}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm text-slate-500">
                      {item.giaban}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {item.nhasanxuat}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.chophepbanweb ? (
                      <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle size={18} className="text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{item.congdung}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenView(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Info size={18} />
                      </button>
                      <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-amber-600">
                        <MoreHorizontal size={18} /> 
                      </button>
                      <button 
                        onClick={() => handleDelete(item.mavattu)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gọi component phân trang dùng chung */}
        {!loading && filteredSupplies.length > 0 && (
          <Pagination
            totalItems={filteredSupplies.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      
      <SupplyModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveSupply}
        initialData={selectedSupply}
        mode={modalMode}
      />
    </div>
  );
};

export default Supplies;