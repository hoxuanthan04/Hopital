import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Clock,
  Wallet,
  Sparkles,
  MessageSquare,
  Shield,
  Save,
  Info,
  ToggleLeft,
  KeyRound,
  Loader2,
  Send,
  MapPin,
  Share2,
  Bell,
  RefreshCw,
  RotateCcw,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import type {
  ApiIntegrationsSettings,
  ProfileSettings,
  SystemSettings,
} from '../../utils/settingsStorage';
import {
  loadApis,
  loadProfile,
  loadSystem,
  saveApis,
  saveProfile,
  saveSystem,
} from '../../utils/settingsStorage';
import TaiKhoanService from '../../services/taikhoan.service';
import NhanVienService from '../../services/nhanvien.service';
import * as ThongBaoApi from '../../services/thongbao.service';

type TabId = 'profile' | 'system' | 'apis' | 'thongbao';

const inputBase =
  'w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded  outline-none transition-all text-smlate-800';

const tabs: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Hồ sơ cá nhân' },
  { id: 'system', label: 'Hệ thống' },
  { id: 'apis', label: 'Tích hợp API' },
  { id: 'thongbao', label: 'Quản lý thông báo' },
];

type UserStored = {
  mataikhoan?: number;
  tentaikhoan?: string;
  loaitaikhoan?: string;
  trangthai?: string;
  manguoidung?: number;
};

function readStoredAccount(): UserStored | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as UserStored) : null;
  } catch {
    return null;
  }
}

type LinkedNhanVien = {
  anh?: string | null;
  hoten?: string | null;
  ngaysinh?: string | null;
  gioitinh?: string | null;
  socccd?: string | null;
  sdt?: string | null;
  email?: string | null;
  chucvu?: string | null;
  hocham?: string | null;
  chuyenkhoa?: string | null;
};

function formatNvDate(v: unknown): string {
  if (v == null || String(v).trim() === '') return '—';
  try {
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

function nvCell(label: string, value: string) {
  return (
    <div className="rounded border border-gray-200 bg-white px-4 py-3">
      <p className="text-[11px] font-medium text-gray-400 tracking-wider">{label}</p>
      <p className="font-medium text-slate-800 mt-1 break-words">{value || '—'}</p>
    </div>
  );
}

function FieldIcon({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-700 transition-colors"
        size={20}
      />
      {children}
    </div>
  );
}

function SettingsRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10 pt-8 border-t border-gray-100 first:pt-0 first:border-t-0">
      <div className="col-span-12 lg:col-span-4">
        <span className="font-bold text-base block mb-2 text-slate-900">{title}</span>
        {desc ? <p className="text-gray-400 text-[13px] leading-relaxed">{desc}</p> : null}
      </div>
      <div className="col-span-12 lg:col-span-8 space-y-4">{children}</div>
    </div>
  );
}

function ApiCard({
  title,
  subtitle,
  icon: Icon,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white/80 overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded bg-white border border-gray-100 flex items-center justify-center shrink-0">
            <Icon className="text-slate-700" size={22} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-[12px] text-gray-500 font-medium truncate">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold border transition-all ${
            enabled
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          <ToggleLeft size={16} />
          {enabled ? 'Đang bật' : 'Đang tắt'}
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [account, setAccount] = useState<UserStored | null>(() => readStoredAccount());

  const [profile, setProfile] = useState<ProfileSettings>(() => loadProfile());
  const [system, setSystem] = useState<SystemSettings>(() => loadSystem());
  const [apis, setApis] = useState<ApiIntegrationsSettings>(() => loadApis());

  const [linkedNhanVien, setLinkedNhanVien] = useState<LinkedNhanVien | null>(null);
  const [linkedNvLoading, setLinkedNvLoading] = useState(false);

  useEffect(() => {
    setAccount(readStoredAccount());
  }, []);

  useEffect(() => {
    const rawId = account?.manguoidung;
    const id =
      rawId != null && String(rawId).trim() !== '' ? Number(rawId) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      setLinkedNhanVien(null);
      setLinkedNvLoading(false);
      return;
    }
    let cancelled = false;
    setLinkedNvLoading(true);
    void (async () => {
      try {
        const nv = (await NhanVienService.getById(id)) as LinkedNhanVien;
        if (!cancelled) setLinkedNhanVien(nv && typeof nv === 'object' ? nv : null);
      } catch {
        if (!cancelled) setLinkedNhanVien(null);
      } finally {
        if (!cancelled) setLinkedNvLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account?.manguoidung]);

  /** Chỉ Admin xem Hệ thống + Tích hợp API; Staff / Bác sĩ / client chỉ Hồ sơ cá nhân. */
  const showAllSettingsTabs = useMemo(() => account?.loaitaikhoan === 'Admin', [account]);

  useEffect(() => {
    if (!showAllSettingsTabs) setActiveTab('profile');
  }, [showAllSettingsTabs]);

  const roleLabel = useMemo(() => {
    const r = account?.loaitaikhoan;
    if (!r) return '—';
    if (r === 'Admin') return 'Quản trị';
    return r;
  }, [account]);

  const saveProfileForm = useCallback(() => {
    saveProfile(profile);
    window.alert('Đã lưu hồ sơ cá nhân (trình duyệt này).');
  }, [profile]);

  const saveSystemForm = useCallback(() => {
    saveSystem(system);
    window.alert('Đã lưu cấu hình hệ thống (trình duyệt này).');
  }, [system]);

  const saveApisForm = useCallback(() => {
    saveApis(apis);
    window.alert(
      'Đã lưu danh sách API (trình duyệt này).\nLưu ý: PayOS thanh toán thực tế vẫn lấy từ biến môi trường backend (.env); phần này để tham chiếu / mở rộng sau.'
    );
  }, [apis]);

  const [tbTitle, setTbTitle] = useState('');
  const [tbBody, setTbBody] = useState('');
  const [tbLoai, setTbLoai] = useState<'tat_ca' | 'vai_tro' | 'chon'>('tat_ca');
  const [tbVaiTro, setTbVaiTro] = useState<string[]>([]);
  const [tbChonIds, setTbChonIds] = useState<number[]>([]);
  const [tbAccountSearch, setTbAccountSearch] = useState('');
  const [tbAccounts, setTbAccounts] = useState<
    { mataikhoan: number; tentaikhoan: string; loaitaikhoan: string; trangthai?: string }[]
  >([]);
  const [tbAccountsLoading, setTbAccountsLoading] = useState(false);
  const [tbHistory, setTbHistory] = useState<
    {
      id: number;
      tieu_de: string;
      noi_dung_rut_gon: string;
      created_at: string;
      so_nguoi_nhan: number;
      so_da_doc: number;
      nguoi_tao?: number | null;
    }[]
  >([]);
  const [tbHistoryLoading, setTbHistoryLoading] = useState(false);
  const [tbSubmitting, setTbSubmitting] = useState(false);
  const [tbErr, setTbErr] = useState<string | null>(null);
  const [tbOk, setTbOk] = useState<string | null>(null);
  const [tbExpandedId, setTbExpandedId] = useState<number | null>(null);

  const tbRoleOptions = useMemo(() => {
    const s = new Set<string>(['Admin', 'Staff', 'Bác sĩ', 'Doctor', 'client']);
    tbAccounts.forEach((a) => {
      if (a.loaitaikhoan) s.add(String(a.loaitaikhoan));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [tbAccounts]);

  const tbFilteredAccounts = useMemo(() => {
    const q = tbAccountSearch.trim().toLowerCase();
    if (!q) return tbAccounts;
    return tbAccounts.filter(
      (a) =>
        a.tentaikhoan.toLowerCase().includes(q) ||
        a.loaitaikhoan.toLowerCase().includes(q) ||
        String(a.mataikhoan).includes(q)
    );
  }, [tbAccounts, tbAccountSearch]);

  const tbRecipientPreview = useMemo(() => {
    if (tbLoai === 'tat_ca') {
      const n = tbAccounts.filter((a) => (a.trangthai || '').trim() === 'Hoạt động').length;
      return `Ước tính: ~${n} tài khoản đang hoạt động (toàn hệ thống).`;
    }
    if (tbLoai === 'vai_tro') {
      if (!tbVaiTro.length) return 'Chọn ít nhất một vai trò để xem ước tính người nhận.';
      const n = tbAccounts.filter(
        (a) => tbVaiTro.includes(a.loaitaikhoan) && (a.trangthai || '').trim() === 'Hoạt động'
      ).length;
      return `Ước tính: ${n} tài khoản khớp vai trò đã chọn (đang hoạt động).`;
    }
    return tbChonIds.length ? `Đã chọn: ${tbChonIds.length} tài khoản.` : 'Chưa chọn tài khoản nào.';
  }, [tbLoai, tbVaiTro, tbChonIds, tbAccounts]);

  useEffect(() => {
    if (!tbOk) return;
    const t = window.setTimeout(() => setTbOk(null), 4500);
    return () => window.clearTimeout(t);
  }, [tbOk]);

  const resetThongBaoForm = useCallback(() => {
    setTbTitle('');
    setTbBody('');
    setTbLoai('tat_ca');
    setTbVaiTro([]);
    setTbChonIds([]);
    setTbAccountSearch('');
    setTbErr(null);
  }, []);

  const selectAllTbFiltered = useCallback(() => {
    const ids = tbFilteredAccounts.map((a) => a.mataikhoan);
    setTbChonIds(Array.from(new Set([...tbChonIds, ...ids])));
  }, [tbFilteredAccounts, tbChonIds]);

  const clearTbChonIds = useCallback(() => setTbChonIds([]), []);

  const formatTbTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return '—';
    }
  };

  const loadThongBaoTab = useCallback(async () => {
    setTbHistoryLoading(true);
    setTbAccountsLoading(true);
    setTbErr(null);
    try {
      const [hist, accs] = await Promise.all([ThongBaoApi.listAdminThongBao(50), TaiKhoanService.getAll()]);
      setTbHistory(Array.isArray(hist) ? hist : []);
      const list = Array.isArray(accs) ? accs : [];
      setTbAccounts(
        list
          .map(
            (a: {
              mataikhoan: number;
              tentaikhoan?: string;
              loaitaikhoan?: string;
              trangthai?: string;
            }) => ({
              mataikhoan: Number(a.mataikhoan),
              tentaikhoan: String(a.tentaikhoan ?? ''),
              loaitaikhoan: String(a.loaitaikhoan ?? ''),
              trangthai: a.trangthai,
            })
          )
          .filter((a) => Number.isFinite(a.mataikhoan) && a.mataikhoan > 0)
      );
    } catch {
      setTbErr('Không tải được dữ liệu thông báo hoặc danh sách tài khoản.');
      setTbHistory([]);
    } finally {
      setTbHistoryLoading(false);
      setTbAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'thongbao' && showAllSettingsTabs) void loadThongBaoTab();
  }, [activeTab, showAllSettingsTabs, loadThongBaoTab]);

  const toggleTbRole = (r: string) => {
    setTbVaiTro((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const toggleTbAccount = (id: number) => {
    setTbChonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitThongBao = useCallback(async () => {
    setTbErr(null);
    const tieu_de = tbTitle.trim();
    const noi_dung = tbBody.trim();
    if (!tieu_de || !noi_dung) {
      setTbErr('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    let doi_tuong: { loai: string; vai_tro?: string[]; mataikhoan?: number[] };
    if (tbLoai === 'tat_ca') doi_tuong = { loai: 'tat_ca' };
    else if (tbLoai === 'vai_tro') {
      if (!tbVaiTro.length) {
        setTbErr('Chọn ít nhất một vai trò.');
        return;
      }
      doi_tuong = { loai: 'vai_tro', vai_tro: tbVaiTro };
    } else {
      if (!tbChonIds.length) {
        setTbErr('Chọn ít nhất một tài khoản nhận thông báo.');
        return;
      }
      doi_tuong = { loai: 'chon', mataikhoan: tbChonIds };
    }
    setTbSubmitting(true);
    try {
      await ThongBaoApi.createThongBao({ tieu_de, noi_dung, doi_tuong });
      setTbOk('Đã gửi thông báo thành công. Các tài khoản nhận sẽ thấy tin trong biểu tượng chuông.');
      setTbTitle('');
      setTbBody('');
      setTbLoai('tat_ca');
      setTbVaiTro([]);
      setTbChonIds([]);
      setTbExpandedId(null);
      await loadThongBaoTab();
      window.dispatchEvent(new CustomEvent('thongbao:updated'));
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setTbErr(msg || 'Không gửi được thông báo.');
    } finally {
      setTbSubmitting(false);
    }
  }, [tbTitle, tbBody, tbLoai, tbVaiTro, tbChonIds, loadThongBaoTab]);

  const profileTab = (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Hồ sơ cá nhân</h2>
        <p className="text-gray-500 font-medium text-sm">
          Thông tin hiển thị và liên hệ của bạn trong hệ thống. Tài khoản đăng nhập lấy từ phiên hiện tại.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded border border-gray-200 bg-white shadow-sm">
        <div className="shrink-0 flex justify-center sm:justify-start">
          {linkedNvLoading ? (
            <div className="w-28 h-28 rounded-full bg-slate-50 flex items-center justify-center border-2 border-gray-100">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : (
            <img
              src={
                linkedNhanVien?.anh != null && String(linkedNhanVien.anh).trim()
                  ? String(linkedNhanVien.anh).trim()
                  : '/default-avatar.png'
              }
              alt="Ảnh đại diện"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-100 shadow-sm bg-slate-50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          )}
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className="font-bold text-slate-900 text-sm mb-1">Ảnh đại diện</p>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            {account?.manguoidung != null && String(account.manguoidung).trim() !== '' ? (
              <>
                Ảnh lấy từ hồ sơ nhân viên liên kết (mã <span className="font-mono text-slate-700">{account.manguoidung}</span>
                ). Cập nhật ảnh tại module quản lý nhân viên khi được phân quyền.
              </>
            ) : (
              'Tài khoản chưa liên kết hồ sơ nhân viên — hiển thị ảnh mặc định.'
            )}
          </p>
        </div>
      </div>

      <SettingsRow
        title="Tài khoản đăng nhập"
        desc="Dữ liệu từ phiên đăng nhập, chỉ đọc."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 tracking-wider">Tên đăng nhập</p>
            <p className="font-medium text-slate-800 mt-1">{account?.tentaikhoan ?? '—'}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 tracking-wider">Vai trò</p>
            <p className="font-medium text-slate-800 mt-1">{roleLabel}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 tracking-wider">Trạng thái</p>
            <p className="font-medium text-slate-800 mt-1">{account?.trangthai ?? '—'}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium text-gray-400 tracking-wider">Mã người dùng liên kết</p>
            <p className="font-medium text-slate-800 mt-1">{account?.manguoidung ?? '—'}</p>
          </div>
        </div>
      </SettingsRow>

      <SettingsRow
        title="Thông tin liên hệ (hồ sơ nhân viên)"
        desc="Dữ liệu từ hệ thống theo mã liên kết; chỉ đọc. Cập nhật tại module quản lý nhân viên."
      >
        {linkedNvLoading ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : linkedNhanVien ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {nvCell('Họ và tên', linkedNhanVien.hoten != null ? String(linkedNhanVien.hoten) : '')}
            {nvCell('Ngày sinh', formatNvDate(linkedNhanVien.ngaysinh))}
            {nvCell('Giới tính', linkedNhanVien.gioitinh != null ? String(linkedNhanVien.gioitinh) : '')}
            {nvCell('CCCD / CMND', linkedNhanVien.socccd != null ? String(linkedNhanVien.socccd) : '')}
            {nvCell('Số điện thoại', linkedNhanVien.sdt != null ? String(linkedNhanVien.sdt) : '')}
            {nvCell('Email', linkedNhanVien.email != null ? String(linkedNhanVien.email) : '')}
            {nvCell('Chức vụ', linkedNhanVien.chucvu != null ? String(linkedNhanVien.chucvu) : '')}
            {nvCell('Học hàm', linkedNhanVien.hocham != null ? String(linkedNhanVien.hocham) : '')}
            {nvCell('Chuyên khoa', linkedNhanVien.chuyenkhoa != null ? String(linkedNhanVien.chuyenkhoa) : '')}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Không có hồ sơ nhân viên liên kết hoặc không tải được dữ liệu — các ô liên hệ từ hệ thống sẽ trống.
          </p>
        )}
      </SettingsRow>

      <SettingsRow
        title="Bảo mật"
        desc="Đổi mật khẩu qua quản trị viên hoặc API tài khoản khi được bật."
      >
        <div className="flex items-start gap-3 rounded border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
          <Info className="shrink-0 mt-0.5" size={18} />
          <p>
            Mật khẩu không lưu trên trang cài đặt. Để đổi mật khẩu an toàn, cần endpoint backend (hash bcrypt) — hiện
            tại vui lòng liên hệ quản trị hoặc dùng chức năng tài khoản trong module quản lý.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 rounded border border-gray-200 bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
        >
          <KeyRound size={18} />
          Đổi mật khẩu (sắp có)
        </button>
      </SettingsRow>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={saveProfileForm}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded font-bold text-sm hover:bg-slate-800 shadow-sm transition-all"
        >
          <Save size={18} />
          Lưu hồ sơ
        </button>
      </div>
    </div>
  );

  const systemTab = (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Quản lý hệ thống</h2>
        <p className="text-gray-500 font-medium text-sm">
          Thông tin chung của bệnh viện / đơn vị — lưu cục bộ, dùng cho hiển thị và tích hợp sau.
        </p>
      </div>

      <SettingsRow title="Định danh đơn vị" desc="Tên và địa chỉ hiển thị trên báo cáo, in ấn.">
        <FieldIcon icon={Building2}>
          <input
            type="text"
            value={system.tenBenhVien}
            onChange={(e) => setSystem((s) => ({ ...s, tenBenhVien: e.target.value }))}
            placeholder="Tên bệnh viện"
            className={inputBase}
          />
        </FieldIcon>
        <textarea
          rows={3}
          value={system.diaChi}
          onChange={(e) => setSystem((s) => ({ ...s, diaChi: e.target.value }))}
          placeholder="Địa chỉ trụ sở"
          className="w-full p-5 bg-white border border-gray-200 rounded outline-none transition-all text-slate-800 resize-none"
        />
      </SettingsRow>

      <SettingsRow title="Liên hệ tiếp nhận" desc="Hotline và email tiếp nhận bệnh nhân.">
        <FieldIcon icon={Phone}>
          <input
            type="text"
            value={system.hotline}
            onChange={(e) => setSystem((s) => ({ ...s, hotline: e.target.value }))}
            placeholder="Hotline"
            className={inputBase}
          />
        </FieldIcon>
        <FieldIcon icon={Mail}>
          <input
            type="email"
            value={system.emailTiepNhan}
            onChange={(e) => setSystem((s) => ({ ...s, emailTiepNhan: e.target.value }))}
            placeholder="Email tiếp nhận"
            className={inputBase}
          />
        </FieldIcon>
      </SettingsRow>

      <SettingsRow title="Ngôn ngữ & múi giờ" desc="Thiết lập hiển thị thời gian trong ứng dụng.">
        <FieldIcon icon={Globe}>
          <select
            value={system.ngonNgu}
            onChange={(e) => setSystem((s) => ({ ...s, ngonNgu: e.target.value }))}
            className={inputBase}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </FieldIcon>
        <FieldIcon icon={Clock}>
          <select
            value={system.timezone}
            onChange={(e) => setSystem((s) => ({ ...s, timezone: e.target.value }))}
            className={inputBase}
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
            <option value="UTC">UTC</option>
          </select>
        </FieldIcon>
      </SettingsRow>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={saveSystemForm}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded font-bold text-sm hover:bg-slate-800 shadow-sm transition-all"
        >
          <Save size={18} />
          Lưu hệ thống
        </button>
      </div>
    </div>
  );

  const apisTab = (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Quản lý danh sách API</h2>
        <p className="text-gray-500 font-medium text-sm">
          PayOS, Gemini, SMS, BHYT — lưu tham chiếu trên trình duyệt. Không thay thế bí mật server (.env) trừ khi bạn
          đồng bộ thủ công.
        </p>
      </div>

      <div className="rounded border border-sky-100 bg-sky-50/50 px-4 py-3 text-sm text-sky-900 flex gap-2">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p>
          <span className="font-bold">PayOS:</span> thanh toán thực đang đọc{' '}
          <code className="text-xs bg-white/80 px-1 rounded">PAYOS_*</code> trên backend. Các ô dưới để ghi nhớ hoặc
          sao chép cấu hình.
        </p>
      </div>

      <div className="space-y-6">
        <ApiCard
          title="PayOS"
          subtitle="Thanh toán link / QR — Client ID, API Key, Checksum"
          icon={Wallet}
          enabled={apis.payos.enabled}
          onToggle={() => setApis((a) => ({ ...a, payos: { ...a.payos, enabled: !a.payos.enabled } }))}
        >
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.payos.clientId}
              onChange={(e) => setApis((a) => ({ ...a, payos: { ...a.payos, clientId: e.target.value } }))}
              placeholder="Client ID"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.payos.apiKey}
              onChange={(e) => setApis((a) => ({ ...a, payos: { ...a.payos, apiKey: e.target.value } }))}
              placeholder="API Key"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.payos.checksumKey}
              onChange={(e) => setApis((a) => ({ ...a, payos: { ...a.payos, checksumKey: e.target.value } }))}
              placeholder="Checksum Key"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={KeyRound}>
            <input
              type="text"
              value={apis.payos.partnerCode}
              onChange={(e) => setApis((a) => ({ ...a, payos: { ...a.payos, partnerCode: e.target.value } }))}
              placeholder="Partner code (tuỳ chọn)"
              className={inputBase}
            />
          </FieldIcon>
        </ApiCard>

        <ApiCard
          title="Google Gemini"
          subtitle="AI — API key (Vite: GEMINI_API_KEY)"
          icon={Sparkles}
          enabled={apis.gemini.enabled}
          onToggle={() => setApis((a) => ({ ...a, gemini: { ...a.gemini, enabled: !a.gemini.enabled } }))}
        >
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.gemini.apiKey}
              onChange={(e) => setApis((a) => ({ ...a, gemini: { ...a.gemini, apiKey: e.target.value } }))}
              placeholder="Gemini API Key"
              className={inputBase}
            />
          </FieldIcon>
        </ApiCard>

        <ApiCard
          title="SMS / Brandname"
          subtitle="Gửi tin nhắn thông báo lịch hẹn"
          icon={MessageSquare}
          enabled={apis.sms.enabled}
          onToggle={() => setApis((a) => ({ ...a, sms: { ...a.sms, enabled: !a.sms.enabled } }))}
        >
          <FieldIcon icon={Globe}>
            <input
              type="url"
              value={apis.sms.apiUrl}
              onChange={(e) => setApis((a) => ({ ...a, sms: { ...a.sms, apiUrl: e.target.value } }))}
              placeholder="https://api-nhà-cung-cấp..."
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.sms.apiKey}
              onChange={(e) => setApis((a) => ({ ...a, sms: { ...a.sms, apiKey: e.target.value } }))}
              placeholder="API Key / Token"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={Building2}>
            <input
              type="text"
              value={apis.sms.brandName}
              onChange={(e) => setApis((a) => ({ ...a, sms: { ...a.sms, brandName: e.target.value } }))}
              placeholder="Brandname / Sender ID"
              className={inputBase}
            />
          </FieldIcon>
        </ApiCard>

        <ApiCard
          title="BHYT / cổng tra cứu"
          subtitle="URL và thông tin xác thực cổng BHXH (tích hợp sau)"
          icon={Shield}
          enabled={apis.bhyt.enabled}
          onToggle={() => setApis((a) => ({ ...a, bhyt: { ...a.bhyt, enabled: !a.bhyt.enabled } }))}
        >
          <FieldIcon icon={Globe}>
            <input
              type="url"
              value={apis.bhyt.apiBaseUrl}
              onChange={(e) => setApis((a) => ({ ...a, bhyt: { ...a.bhyt, apiBaseUrl: e.target.value } }))}
              placeholder="Base URL API BHYT / cổng giám định"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={User}>
            <input
              type="text"
              value={apis.bhyt.username}
              onChange={(e) => setApis((a) => ({ ...a, bhyt: { ...a.bhyt, username: e.target.value } }))}
              placeholder="Username / Client ID"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={KeyRound}>
            <input
              type="password"
              autoComplete="off"
              value={apis.bhyt.password}
              onChange={(e) => setApis((a) => ({ ...a, bhyt: { ...a.bhyt, password: e.target.value } }))}
              placeholder="Mật khẩu / Client secret"
              className={inputBase}
            />
          </FieldIcon>
          <FieldIcon icon={Building2}>
            <input
              type="text"
              value={apis.bhyt.maCoSoKcb}
              onChange={(e) => setApis((a) => ({ ...a, bhyt: { ...a.bhyt, maCoSoKcb: e.target.value } }))}
              placeholder="Mã cơ sở KCB"
              className={inputBase}
            />
          </FieldIcon>
        </ApiCard>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={saveApisForm}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded font-bold text-sm hover:bg-slate-800 shadow-sm transition-all"
        >
          <Save size={18} />
          Lưu API
        </button>
      </div>
    </div>
  );

  const thongbaoTab = (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex gap-4 min-w-0">
          <div className="w-12 h-12 rounded border border-slate-200 bg-[#0B2046] flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="text-white" size={22} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">Quản lý thông báo</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Soạn tin hệ thống — người dùng nhận trong menu chuông. Chọn đối tượng: toàn bộ tài khoản hoạt động, theo vai
              trò, hoặc danh sách cụ thể. Ai được tiếp nhận trước vẫn đọc theo thứ tự trong hộp thông báo của họ.
            </p>
          </div>
        </div>
      </div>

      {tbOk ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-start gap-2">
          <Send size={16} className="shrink-0 mt-0.5 text-emerald-700" />
          <span>{tbOk}</span>
        </div>
      ) : null}
      {tbErr ? (
        <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{tbErr}</div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Cột soạn thảo */}
        <div className="xl:col-span-5 space-y-4">
          <div className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/90 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Send size={18} className="text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Soạn &amp; gửi thông báo</h3>
                  <p className="text-[11px] text-slate-500">Tiêu đề và nội dung hiển thị đúng trong danh sách chuông.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetThongBaoForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw size={14} />
                Xóa form
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tiêu đề</label>
                  <span className="text-[11px] text-slate-400 tabular-nums">{tbTitle.length}/280</span>
                </div>
                <input
                  type="text"
                  value={tbTitle}
                  onChange={(e) => setTbTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch bảo trì hệ thống tối nay"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded outline-none text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  maxLength={280}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nội dung</label>
                  <span className="text-[11px] text-slate-400 tabular-nums">{tbBody.length} ký tự</span>
                </div>
                <textarea
                  rows={6}
                  value={tbBody}
                  onChange={(e) => setTbBody(e.target.value)}
                  placeholder="Nội dung chi tiết hiển thị khi người dùng mở thông báo…"
                  className="w-full p-4 bg-white border border-gray-200 rounded outline-none text-slate-800 text-sm resize-y min-h-[140px] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="rounded border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
                <p className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Users size={14} className="text-slate-500" />
                  Người nhận
                </p>
                <p>{tbRecipientPreview}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Đối tượng nhận</span>
                <div className="space-y-2">
                  <label
                    className={`flex gap-3 cursor-pointer rounded border px-4 py-3 transition-all ${
                      tbLoai === 'tat_ca'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tbLoai"
                      className="mt-1 shrink-0"
                      checked={tbLoai === 'tat_ca'}
                      onChange={() => setTbLoai('tat_ca')}
                    />
                    <span>
                      <span className="font-bold text-sm text-slate-800 block">Tất cả tài khoản hoạt động</span>
                      <span className="text-xs text-slate-500">Gửi đồng thời tới mọi tài khoản trạng thái «Hoạt động».</span>
                    </span>
                  </label>
                  <label
                    className={`flex gap-3 cursor-pointer rounded border px-4 py-3 transition-all ${
                      tbLoai === 'vai_tro'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tbLoai"
                      className="mt-1 shrink-0"
                      checked={tbLoai === 'vai_tro'}
                      onChange={() => setTbLoai('vai_tro')}
                    />
                    <span>
                      <span className="font-bold text-sm text-slate-800 block">Theo vai trò</span>
                      <span className="text-xs text-slate-500">Lọc theo cột loại tài khoản (Admin, Staff, client…).</span>
                    </span>
                  </label>
                  <label
                    className={`flex gap-3 cursor-pointer rounded border px-4 py-3 transition-all ${
                      tbLoai === 'chon'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tbLoai"
                      className="mt-1 shrink-0"
                      checked={tbLoai === 'chon'}
                      onChange={() => setTbLoai('chon')}
                    />
                    <span>
                      <span className="font-bold text-sm text-slate-800 block">Chọn tài khoản cụ thể</span>
                      <span className="text-xs text-slate-500">Tìm kiếm và tick từng tài khoản nhận tin.</span>
                    </span>
                  </label>
                </div>
              </div>

              {tbLoai === 'vai_tro' ? (
                <div className="rounded border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                  <p className="text-xs text-slate-600 font-medium">Chọn một hoặc nhiều vai trò (bấm để bật/tắt).</p>
                  <div className="flex flex-wrap gap-2">
                    {tbRoleOptions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleTbRole(r)}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                          tbVaiTro.includes(r)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {tbLoai === 'chon' ? (
                <div className="rounded border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <input
                      type="search"
                      value={tbAccountSearch}
                      onChange={(e) => setTbAccountSearch(e.target.value)}
                      placeholder="Tìm theo tên đăng nhập, vai trò, mã…"
                      className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500/25"
                    />
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={selectAllTbFiltered}
                        className="px-3 py-2 rounded border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Chọn tất cả (lọc)
                      </button>
                      <button
                        type="button"
                        onClick={clearTbChonIds}
                        className="px-3 py-2 rounded border border-gray-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Bỏ chọn hết
                      </button>
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded border border-gray-100 bg-white divide-y divide-gray-100">
                    {tbAccountsLoading ? (
                      <div className="p-8 flex justify-center text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                      </div>
                    ) : tbFilteredAccounts.length ? (
                      tbFilteredAccounts.map((a) => (
                        <label
                          key={a.mataikhoan}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={tbChonIds.includes(a.mataikhoan)}
                            onChange={() => toggleTbAccount(a.mataikhoan)}
                          />
                          <span className="font-medium text-slate-800 truncate flex-1">{a.tentaikhoan}</span>
                          <span className="text-xs text-slate-500 shrink-0">{a.loaitaikhoan}</span>
                          {a.trangthai && a.trangthai !== 'Hoạt động' ? (
                            <span className="text-[10px] font-bold text-amber-600 shrink-0">{a.trangthai}</span>
                          ) : null}
                        </label>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-slate-500">Không có tài khoản khớp tìm kiếm.</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Đã chọn {tbChonIds.length} tài khoản.</p>
                </div>
              ) : null}

              <div className="rounded border border-gray-100 bg-slate-50/50 p-4 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Xem trước (chuông)</p>
                <p className="font-bold text-slate-900 text-sm line-clamp-2">{tbTitle.trim() || '— Tiêu đề —'}</p>
                <p className="text-xs text-slate-600 line-clamp-4 whitespace-pre-wrap">
                  {tbBody.trim() || 'Nội dung sẽ hiển thị tại đây…'}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={tbSubmitting}
                  onClick={() => void submitThongBao()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                >
                  {tbSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Gửi thông báo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cột lịch sử */}
        <div className="xl:col-span-7 space-y-4">
          <div className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Lịch sử đã gửi</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Tối đa 50 bản ghi gần nhất — đối chiếu người nhận &amp; tỷ lệ đã đọc.</p>
              </div>
              <button
                type="button"
                onClick={() => void loadThongBaoTab()}
                disabled={tbHistoryLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={14} className={tbHistoryLoading ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>

            {tbHistoryLoading ? (
              <div className="py-16 flex justify-center text-slate-400">
                <Loader2 className="animate-spin" size={28} />
              </div>
            ) : tbHistory.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500 border-t border-gray-50">
                Chưa có thông báo nào được gửi từ quản trị.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[640px]">
                  <thead className="bg-gray-50 text-[11px] font-bold text-slate-600 uppercase tracking-wide border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Tiêu đề</th>
                      <th className="px-4 py-3 hidden md:table-cell">Tóm tắt</th>
                      <th className="px-4 py-3 whitespace-nowrap">Thời gian</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap hidden sm:table-cell">Người tạo</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">Nhận</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap hidden sm:table-cell">Đã đọc</th>
                      <th className="px-4 py-3 text-center whitespace-nowrap w-[100px]">Tỷ lệ</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {tbHistory.map((row) => {
                      const pct =
                        row.so_nguoi_nhan > 0 ? Math.round((100 * row.so_da_doc) / row.so_nguoi_nhan) : 0;
                      const open = tbExpandedId === row.id;
                      return (
                        <React.Fragment key={row.id}>
                          <tr className="hover:bg-slate-50/80 align-top">
                            <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px]">
                              <span className="line-clamp-2">{row.tieu_de}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate hidden md:table-cell">
                              {row.noi_dung_rut_gon}
                            </td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs align-middle">
                              {formatTbTime(row.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-500 hidden sm:table-cell tabular-nums align-middle">
                              {row.nguoi_tao != null ? `#${row.nguoi_tao}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700 align-middle">
                              {row.so_nguoi_nhan}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700 hidden sm:table-cell align-middle">
                              {row.so_da_doc}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-full max-w-[72px] h-2 rounded bg-slate-200 overflow-hidden border border-slate-100">
                                  <div
                                    className="h-full rounded bg-blue-600 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 tabular-nums">{pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                              <button
                                type="button"
                                onClick={() => setTbExpandedId(open ? null : row.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-gray-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50"
                              >
                                {open ? <EyeOff size={14} /> : <Eye size={14} />}
                                {open ? 'Thu gọn' : 'Chi tiết'}
                              </button>
                            </td>
                          </tr>
                          {open ? (
                            <tr className="bg-slate-50/90">
                              <td colSpan={8} className="px-4 py-4 text-xs text-slate-700 border-b border-gray-100">
                                <p className="font-bold text-slate-800 mb-1">Nội dung (rút gọn tối đa 200 ký tự)</p>
                                <p className="whitespace-pre-wrap leading-relaxed">{row.noi_dung_rut_gon || '—'}</p>
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!showAllSettingsTabs) return profileTab;
    switch (activeTab) {
      case 'profile':
        return profileTab;
      case 'system':
        return systemTab;
      case 'apis':
        return apisTab;
      case 'thongbao':
        return thongbaoTab;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#F9FAFB] text-slate-900 min-h-full">
      <div className="w-full">
        {showAllSettingsTabs ? (
          <div className="shrink-0 flex space-x-10 border-b border-gray-200 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-5 text-sm font-bold transition-all whitespace-nowrap relative ${
                  activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id ? (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black rounded" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className="bg-white/40 p-4 sm:p-6 md:p-8 rounded border border-gray-100/80 shadow-sm min-h-[240px] max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] pr-2 sm:pr-3"
          role="region"
          aria-label="Nội dung cài đặt"
        >
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
