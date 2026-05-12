import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Info,
  Trash2,
  Monitor,
  Settings,
  DoorOpen,
  Filter,
  Activity,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import PhongKhamService from '../../services/phongkham.service';
import ChuyenKhoaService from '../../services/chuyenkhoa.service';
import RoomModal from '../../components/admin/RoomModal';
// Import component phân trang
import Pagination from '../../components/admin/Pagination';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Đang hoạt động', label: 'Đang hoạt động' },
  { value: 'Sẵn sàng', label: 'Sẵn sàng' },
  { value: 'Trống', label: 'Trống' },
  { value: 'Đang sửa chữa', label: 'Đang sửa chữa' },
  { value: 'Bảo trì', label: 'Bảo trì' },
];

const MACHINE_FILTER_OPTIONS = [
  { value: 'all', label: 'Mã máy: tất cả' },
  { value: 'co', label: 'Đã gán mã máy' },
  { value: 'khong', label: 'Chưa gán mã máy' },
];

const Rooms = () => {
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState([]);
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMachuyenkhoa, setFilterMachuyenkhoa] = useState('');
  const [filterMachine, setFilterMachine] = useState('all');

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const [data, ckRows] = await Promise.all([
        PhongKhamService.getAll(),
        ChuyenKhoaService.getAll().catch(() => []),
      ]);
      setRooms(Array.isArray(data) ? data : []);
      setChuyenKhoaList(Array.isArray(ckRows) ? ckRows : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterMachuyenkhoa, filterMachine]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedRoom(null);
    setModalOpen(true);
  };

  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedRoom(item);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedRoom(item);
    setModalOpen(true);
  };

  const handleSaveRoom = async (data) => {
    try {
      if (modalMode === 'add') {
        await PhongKhamService.create(data);
        alert("Thêm phòng thành công!");
      } else {
        await PhongKhamService.update(data.maphong, data);
        alert("Cập nhật thành công!");
      }
      setModalOpen(false);
      fetchRooms();
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await PhongKhamService.delete(id);
        fetchRooms();
      } catch (error) {
        alert("Lỗi khi xóa phòng: " + error.message);
      }
    }
  };

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      if (q) {
        const blob = [
          r.tenphong,
          r.tenchuyenkhoa,
          r.chucnang,
          r.machuyenkhoa,
          r.mamayphong,
          r.tang,
          r.khu,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (filterStatus !== 'all') {
        if ((r.trangthai || '').trim() !== filterStatus) return false;
      }
      if (filterMachuyenkhoa !== '') {
        if (String(r.machuyenkhoa ?? '') !== filterMachuyenkhoa) return false;
      }
      if (filterMachine === 'co') {
        if (!String(r.mamayphong || '').trim()) return false;
      }
      if (filterMachine === 'khong') {
        if (String(r.mamayphong || '').trim()) return false;
      }
      return true;
    });
  }, [rooms, search, filterStatus, filterMachuyenkhoa, filterMachine]);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterMachuyenkhoa('');
    setFilterMachine('all');
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.trangthai === 'Đang hoạt động' || r.trangthai === 'Sẵn sàng').length,
    machines: rooms.filter(r => r.mamayphong).length,
    maintenance: rooms.filter(r => r.trangthai === 'Đang sửa chữa' || r.trangthai === 'Bảo trì').length
  };

  return (
    <div className="space-y-3">
      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số phòng', val: stats.total, icon: <DoorOpen />, color: 'text-gray-400', bg: 'bg-gray-100' },
          { label: 'Đang hoạt động', val: stats.active, icon: <Activity />, color: 'text-gray-400', bg: 'bg-gray-100' },
          { label: 'Máy phòng', val: stats.machines, icon: <Monitor />, color: 'text-gray-400', bg: 'bg-gray-100' },
          { label: 'Đang bảo trì', val: stats.maintenance, icon: <Settings />, color: 'text-gray-400', bg: 'bg-gray-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`p-3 ${stat.bg} ${stat.color} rounded`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm tên phòng, khoa, chức năng, mã máy, tầng/khu..."
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded outline-none transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95 shrink-0"
            >
              <Plus size={20} /> Thêm phòng
            </button>
          </div>

          <div className="flex flex-col xl:flex-row flex-wrap gap-3 items-stretch xl:items-center">
            <div className="flex items-center gap-2 text-slate-500 shrink-0">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">Bộ lọc</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[10rem] flex-1 xl:flex-none border border-slate-200 rounded px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filterMachuyenkhoa}
              onChange={(e) => setFilterMachuyenkhoa(e.target.value)}
              className="min-w-[12rem] flex-1 xl:flex-none border border-slate-200 rounded px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Tất cả chuyên khoa</option>
              {chuyenKhoaList.map((ck) => (
                <option key={ck.machuyenkhoa} value={String(ck.machuyenkhoa)}>
                  {ck.tenchuyenkhoa}
                </option>
              ))}
            </select>
            <select
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
              className="min-w-[11rem] flex-1 xl:flex-none border border-slate-200 rounded px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              {MACHINE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
            >
              <RotateCcw size={16} /> Đặt lại
            </button>
            {!loading && (
              <span className="text-xs text-slate-400 xl:ml-auto">
                Hiển thị <b className="text-slate-600">{filteredRooms.length}</b> / {rooms.length} phòng
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="py-4 px-6">Thông tin phòng</th>
                <th className="py-4 px-6">Chức năng</th>
                <th className="py-4 px-4">Khoa chuyên môn</th>
                <th className="py-4 px-4">Vị trí (Tầng/Khu)</th>
                <th className="py-4 px-4">Mã máy phòng</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : currentRooms.length > 0 ? (
                currentRooms.map((room) => (
                  <tr key={room.maphong} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-2 px-6">
                      <p className="text-sm text-slate-500 leading-none mb-1">{room.tenphong}</p>
                    </td>
                    <td className="py-2 px-6">
                      <p className="text-sm text-slate-500">{room.chucnang}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {room.tenchuyenkhoa || '—'}
                      {room.machuyenkhoa != null ? (
                        <span className="block text-[10px] text-slate-400 font-mono">#{room.machuyenkhoa}</span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        Tầng {room.tang} • Khu {room.khu}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">{room.mamayphong}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 text-sm ${
                        (room.trangthai === 'Đang hoạt động' || room.trangthai === 'Sẵn sàng') ? ' text-slate-500' : 
                        room.trangthai === 'Trống' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        {room.trangthai || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(room)}
                          className="p-2 text-slate-400  hover:bg-slate-200 rounded-lg transition-all">
                          <Info size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(room)}
                          className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.maphong)} 
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-200 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400 text-sm">Không tìm thấy dữ liệu phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gọi Component Phân trang */}
        {!loading && filteredRooms.length > 0 && (
          <Pagination
            totalItems={filteredRooms.length}
            itemsPerPage={roomsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <RoomModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveRoom} 
        initialData={selectedRoom}
        mode={modalMode}
      />
    </div>
  );
};

export default Rooms;