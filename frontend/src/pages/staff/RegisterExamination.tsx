import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import LuotKhamService from '../../services/LuotKhamService';
import PhongKhamService from '../../services/phongkham.service';
import { lookupBenhNhanByCccd, lookupDienthoaiInUse, addBenhNhan } from '../../services/benhnhanApi';

/** Cùng khóa với PatientQueue — lưu mã máy phòng để mở đúng hàng chờ. */
const MAMAY_STORAGE_KEY = 'tth_mamayphong';

type CccdLookupState = 'idle' | 'loading' | 'found' | 'not_found';

const emptyPatient = {
  mabenhnhan: null as number | null,
  hoten: '',
  gioitinh: 'Nam',
  namsinh: '' as string | number,
  socccd: '',
  mabhyt: '',
  quoctich: 'Việt Nam',
  dantoc: 'Kinh',
  email: '',
  nghenghiep: '',
  diachi: '',
  dienthoai: '',
};

const CreateVisit: React.FC = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(emptyPatient);

  const [visitData, setVisitData] = useState({
    loaihinhkham: 'Khám thường',
    lydokham: '',
    ngaykham: new Date().toISOString().split('T')[0],
    giokham: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    maphong: '' as string | number,
    trangthai: 'Chờ khám',
  });

  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [searchRoomQuery, setSearchRoomQuery] = useState('');

  const [cccdLookup, setCccdLookup] = useState<CccdLookupState>('idle');
  const [lookupBanner, setLookupBanner] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await PhongKhamService.getAll();
        setAllRooms(data);
        setFilteredRooms(data);
      } catch (error) {
        console.error('Lỗi lấy danh sách phòng khám:', error);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const q = searchRoomQuery.toLowerCase().trim();
    const filtered = allRooms.filter((room) => {
      const name = (room.tenphong || '').toLowerCase();
      const dept = (room.tenchuyenkhoa || '').toLowerCase();
      const fn = (room.chucnang || '').toLowerCase();
      const mid = String(room.machuyenkhoa ?? '');
      return !q || name.includes(q) || dept.includes(q) || fn.includes(q) || mid.includes(searchRoomQuery.trim());
    });
    setFilteredRooms(filtered);
  }, [searchRoomQuery, allRooms]);

  const handleSocccdChange = (value: string) => {
    setCccdLookup('idle');
    setLookupBanner('');
    setSubmitError('');
    setPatientData((prev) => ({
      ...prev,
      socccd: value,
      mabenhnhan: null,
    }));
  };

  const handleSearchPatient = async () => {
    const q = patientData.socccd.trim();
    if (!q) {
      setLookupBanner('Vui lòng nhập số căn cước công dân để tra cứu.');
      return;
    }
    setCccdLookup('loading');
    setLookupBanner('');
    setSubmitError('');
    try {
      const bn = await lookupBenhNhanByCccd(q);
      setPatientData({
        mabenhnhan: bn.mabenhnhan,
        hoten: bn.hoten ?? '',
        gioitinh: bn.gioitinh || 'Nam',
        namsinh: bn.namsinh != null ? String(bn.namsinh) : '',
        socccd: (bn.socccd ?? q).toString().trim(),
        mabhyt: bn.mabhyt ?? '',
        quoctich: bn.quoctich || 'Việt Nam',
        dantoc: bn.dantoc || 'Kinh',
        email: bn.email ?? '',
        nghenghiep: bn.nghenghiep ?? '',
        diachi: bn.diachi ?? '',
        dienthoai: bn.dienthoai ?? '',
      });
      setCccdLookup('found');
      setLookupBanner('Đã tìm thấy bệnh nhân. Thông tin đã được điền tự động.');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      if (status === 404) {
        setCccdLookup('not_found');
        setPatientData((prev) => ({
          ...emptyPatient,
          socccd: q,
        }));
        setLookupBanner(
          'Chưa có bệnh nhân với số CCCD này trong hệ thống. Vui lòng điền đầy đủ thông tin bên dưới, sau đó bấm «Xác nhận tiếp nhận» để tạo bệnh nhân mới và tài khoản (đăng nhập = CCCD, mật khẩu = số điện thoại).'
        );
      } else {
        setCccdLookup('idle');
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Lỗi tra cứu CCCD.';
        setLookupBanner(msg);
      }
    }
  };

  const buildBenhNhanCreateBody = () => {
    const ns = String(patientData.namsinh).trim();
    return {
      hoten: patientData.hoten.trim(),
      gioitinh: patientData.gioitinh,
      namsinh: ns === '' || Number.isNaN(Number(ns)) ? null : Number(ns),
      socccd: patientData.socccd.trim(),
      dienthoai: patientData.dienthoai.trim(),
      mabhyt: patientData.mabhyt.trim() || null,
      quoctich: patientData.quoctich.trim() || null,
      dantoc: patientData.dantoc.trim() || null,
      diachi: patientData.diachi.trim() || null,
      email: patientData.email.trim() || null,
      nghenghiep: patientData.nghenghiep.trim() || null,
    };
  };

  const buildVisitPayload = () => {
    const { mabenhnhan: _m, ...rest } = patientData;
    return {
      ...rest,
      namsinh:
        rest.namsinh === '' || rest.namsinh == null
          ? null
          : Number(rest.namsinh),
      ...visitData,
      maphong: visitData.maphong === '' ? null : Number(visitData.maphong),
    };
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (cccdLookup !== 'found' && cccdLookup !== 'not_found') {
      setSubmitError('Vui lòng tra cứu số CCCD (nút kính lúp) trước khi xác nhận tiếp nhận.');
      return;
    }
    if (!visitData.maphong) {
      setSubmitError('Vui lòng chọn phòng khám.');
      return;
    }
    const socccd = patientData.socccd.trim();
    const dienthoai = patientData.dienthoai.trim();
    if (!patientData.hoten.trim()) {
      setSubmitError('Vui lòng nhập họ và tên bệnh nhân.');
      return;
    }
    if (!socccd) {
      setSubmitError('Vui lòng nhập số CCCD.');
      return;
    }
    if (!dienthoai) {
      setSubmitError('Vui lòng nhập số điện thoại.');
      return;
    }

    try {
      if (cccdLookup === 'not_found') {
        const phoneCheck = await lookupDienthoaiInUse(dienthoai, null);
        if (phoneCheck.inUse) {
          setSubmitError('Số điện thoại đã được đăng ký cho bệnh nhân khác. Vui lòng dùng số khác.');
          return;
        }
        await addBenhNhan(buildBenhNhanCreateBody());
      }

      await LuotKhamService.create(buildVisitPayload());
      const selected = allRooms.find((r) => Number(r.maphong) === Number(visitData.maphong));
      const mamay = selected?.mamayphong != null ? String(selected.mamayphong).trim() : '';
      const tenPhong = (selected?.tenphong as string | undefined) || 'phòng đã chọn';
      if (mamay) {
        localStorage.setItem(MAMAY_STORAGE_KEY, mamay);
      }
      window.alert(
        `Tiếp nhận thành công.\nBệnh nhân đã vào hàng chờ tại ${tenPhong} (thứ tự khám: ai tiếp nhận trước được gọi trước).${mamay ? '\nĐang mở danh sách chờ phòng này.' : '\nVào «Danh sách chờ» và nhập mã máy phòng (mamayphong) nếu chưa cấu hình.'}`,
      );
      if (mamay) {
        navigate(`/staff/patientqueue?mamay=${encodeURIComponent(mamay)}`);
      } else {
        navigate('/staff/patientqueue');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lỗi khi tiếp nhận. Vui lòng thử lại.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="max-w-10xl mx-auto space-y-3">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tiếp nhận lượt khám</h2>
          <p className="text-sm text-slate-500">
            Chọn phòng khám bên phải: bệnh nhân được gán thẳng vào hàng chờ phòng đó; thứ tự khám theo thời gian tiếp nhận (FIFO).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[700px]">
          <section className="bg-white p-6 rounded shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">1. Thông tin bệnh nhân</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập số CCCD..."
                  className="px-4 py-2  border border-slate-200 rounded text-sm outline-none focus:border-blue-500 w-48"
                  value={patientData.socccd}
                  onChange={(e) => handleSocccdChange(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  disabled={cccdLookup === 'loading'}
                  className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  {cccdLookup === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent animate-spin rounded" />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
            </div>

            {lookupBanner && (
              <div
                className={`mb-4 rounded-lg border px-4 py-3 text-sm flex gap-2 items-start ${
                  cccdLookup === 'found'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : cccdLookup === 'not_found'
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <span>{lookupBanner}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold  text-slate-400 uppercase">Họ và tên</label>
                <input
                  type="text"
                  className="w-full  px-4 py-2.5  border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500"
                  value={patientData.hoten}
                  onChange={(e) => setPatientData({ ...patientData, hoten: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Giới tính</label>
                  <select
                    className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                    value={patientData.gioitinh}
                    onChange={(e) => setPatientData({ ...patientData, gioitinh: e.target.value })}
                  >
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Năm sinh</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                    value={patientData.namsinh}
                    onChange={(e) => setPatientData({ ...patientData, namsinh: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Số điện thoại *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.dienthoai}
                  onChange={(e) => setPatientData({ ...patientData, dienthoai: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Mã BHYT</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.mabhyt}
                  onChange={(e) => setPatientData({ ...patientData, mabhyt: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Quốc tịch</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.quoctich}
                  onChange={(e) => setPatientData({ ...patientData, quoctich: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Dân tộc</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.dantoc}
                  onChange={(e) => setPatientData({ ...patientData, dantoc: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nghề nghiệp</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.nghenghiep}
                  onChange={(e) => setPatientData({ ...patientData, nghenghiep: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Địa chỉ thường trú</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.diachi}
                  onChange={(e) => setPatientData({ ...patientData, diachi: e.target.value })}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={patientData.email}
                  onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">2. Nội dung đăng ký khám</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Loại hình khám</label>
                <select
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={visitData.loaihinhkham}
                  onChange={(e) => setVisitData({ ...visitData, loaihinhkham: e.target.value })}
                >
                  <option>Khám thường</option>
                  <option>Khám bảo hiểm</option>
                  <option>Khám dịch vụ / VIP</option>
                  <option>Chẩn đoán hình ảnh - xét nghiệm</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Ngày khám</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={visitData.ngaykham}
                  onChange={(e) => setVisitData({ ...visitData, ngaykham: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Giờ hẹn</label>
                <input
                  type="time"
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={visitData.giokham}
                  onChange={(e) => setVisitData({ ...visitData, giokham: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Lý do khám</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5  border border-slate-200 rounded outline-none"
                  value={visitData.lydokham}
                  onChange={(e) => setVisitData({ ...visitData, lydokham: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">3. Phân phòng — vào hàng chờ phòng</h3>
            <p className="text-xs text-slate-500 mb-3">
              Bệnh nhân sau khi xác nhận sẽ nằm trong danh sách chờ của phòng được chọn; ai tiếp nhận trước có số thứ tự khám trước tại phòng đó.
            </p>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm phòng hoặc khoa..."
                className="w-full pl-10 pr-4 py-2  border border-slate-200 rounded text-sm outline-none focus:border-blue-500"
                value={searchRoomQuery}
                onChange={(e) => setSearchRoomQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
              {filteredRooms.map((room) => (
                <button
                  key={room.maphong}
                  type="button"
                  onClick={() => setVisitData({ ...visitData, maphong: room.maphong })}
                  className={`w-full p-4 rounded border-2 text-left transition-all ${
                    visitData.maphong === room.maphong
                      ? 'border-blue-500 bg-blue-50/50 shadow-md'
                      : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 text-sm">{room.tenphong}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${room.trangthai === 'Đang hoạt động' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                    {room.tenchuyenkhoa || '—'}
                  </p>
                  {room.chucnang && (
                    <p className="text-[11px] text-blue-600 font-medium mb-2">
                      Chức năng: {room.chucnang}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <AlertCircle size={12} /> {room.soluongcho || 0} người đợi
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div className="p-4 rounded">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Phòng đã chọn:</span>
                  <span className="font-bold text-blue-600">
                    {allRooms.find((r) => r.maphong === visitData.maphong)?.tenphong || 'Chưa chọn'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 bg-slate-900 text-white rounded font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <CheckCircle2 size={20} /> Xác nhận tiếp nhận
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreateVisit;
