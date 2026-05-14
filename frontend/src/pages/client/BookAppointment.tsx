import React, { useState, useEffect } from 'react';
import { Phone, Mail, CheckCircle, MapPin } from 'lucide-react';
import { createAppointment } from '../../services/dangkyhenkham.service';

type StoredClientUser = {
  loaitaikhoan?: string;
  hoten?: string;
  client_diachi?: string;
  client_email?: string;
  client_dienthoai?: string;
  client_socccd?: string;
  client_namsinh?: number | null;
};

function buildHotenFromParts(firstName: string, lastName: string) {
  const a = firstName.trim();
  const b = lastName.trim();
  if (a && b && a === b) return a;
  return `${a} ${b}`.trim();
}

function splitHotenForForm(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

/** YYYY-MM-DD theo giờ máy người dùng (khớp input type="date"). */
function getTodayYYYYMMDDLocal() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Ghép ngày + giờ theo timezone local; null nếu không parse được. */
function parseLocalAppointmentSlot(dateStr: string, timeStr: string): Date | null {
  const dm = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return null;
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const da = Number(dm[3]);
  const h = Number(tm[1]);
  const mi = Number(tm[2]);
  if ([y, mo, da, h, mi].some((n) => Number.isNaN(n))) return null;
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  const slot = new Date(y, mo - 1, da, h, mi, 0, 0);
  if (Number.isNaN(slot.getTime())) return null;
  return slot;
}

export default function BookAppointment() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Khám bệnh',
    doctor: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!raw || !token) return;
      const u = JSON.parse(raw) as StoredClientUser;
      if (String(u.loaitaikhoan || '').toLowerCase() !== 'client') return;

      const full = (u.hoten || '').trim();
      const { firstName, lastName } = splitHotenForForm(full);
      const em = (u.client_email || '').trim();
      const tel = (u.client_dienthoai || '').trim();
      const dc = (u.client_diachi || '').trim();

      setFormData((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        email: em || prev.email,
        phone: tel || prev.phone,
        notes: dc ? `Địa chỉ: ${dc}\n\n${prev.notes}`.trim() : prev.notes,
      }));
    } catch {
      /* ignore */
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const readClientMeta = (): Pick<
    StoredClientUser,
    'client_socccd' | 'client_namsinh' | 'client_email'
  > => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return {};
      const u = JSON.parse(raw) as StoredClientUser;
      if (String(u.loaitaikhoan || '').toLowerCase() !== 'client') return {};
      return {
        client_socccd: u.client_socccd,
        client_namsinh: u.client_namsinh,
        client_email: u.client_email,
      };
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const date = formData.date.trim();
    const time = formData.time.trim();
    const notes = formData.notes.trim();

    if (!fn || !ln || !email || !phone || !date || !time || !notes) {
      window.alert('Vui lòng điền đầy đủ các trường bắt buộc (họ, tên, email, số điện thoại, ngày, giờ, nội dung lý do khám).');
      return;
    }

    if (formData.department === 'Chẩn đoán hình ảnh - xét nghiệm' && !formData.doctor.trim()) {
      window.alert('Vui lòng chọn dịch vụ chẩn đoán hình ảnh / xét nghiệm cần đăng ký.');
      return;
    }

    const slot = parseLocalAppointmentSlot(date, time);
    if (!slot) {
      window.alert('Ngày hoặc giờ khám không hợp lệ. Vui lòng chọn lại.');
      return;
    }
    if (slot.getTime() < Date.now()) {
      window.alert('Không được đặt lịch vào thời gian trong quá khứ. Vui lòng chọn ngày và giờ khám phù hợp.');
      return;
    }

    const hoten = buildHotenFromParts(fn, ln);
    const meta = readClientMeta();
    const socccd = (meta.client_socccd || '').trim() || '';
    const namsinh =
      meta.client_namsinh != null && !Number.isNaN(Number(meta.client_namsinh))
        ? Number(meta.client_namsinh)
        : null;

    const imagingNote =
      formData.department === 'Chẩn đoán hình ảnh - xét nghiệm' && formData.doctor.trim()
        ? `Dịch vụ yêu cầu: ${formData.doctor.trim()}\n`
        : '';
    /** Chỉ gửi nội dung lý do/triệu chứng; CCCD và SĐT đã có trường riêng, email không nên nhét vào lý do khám. */
    const lydokham = `${imagingNote}${notes}`.slice(0, 200);

    setSubmitting(true);
    try {
      await createAppointment({
        hoten,
        socccd,
        sodienthoai: phone,
        namsinh,
        loaikham: formData.department || 'Đặt lịch online',
        lydokham,
        ngaykham: date,
        giokham: time,
        trangthai: 'Chờ xác nhận',
      });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      let msg = 'Không thể gửi đăng ký. Vui lòng thử lại.';
      if (typeof err === 'string') msg = err;
      else if (err && typeof err === 'object' && 'message' in err && (err as { message?: string }).message) {
        msg = String((err as { message: string }).message);
      }
      window.alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#0B2046] mb-4">Đã gửi yêu cầu đặt lịch!</h2>
          <p className="text-slate-600 mb-8">
            Cảm ơn bạn, {formData.firstName}. Chúng tôi đã nhận đăng ký hẹn khám và sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                department: 'Khám bệnh',
                doctor: '',
                date: '',
                time: '',
                notes: '',
              });
            }}
            className="w-full bg-[#0084FF] text-white py-3 px-4 rounded font-medium hover:bg-blue-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 ">
      
      {/* Header matching Department page */}
      <div className="bg-[#0B2046] text-white py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Đặt lịch khám</h1>
          <p className="text-lg text-blue-100 max-w mx-auto">
            Đặt lịch khám với các bác sĩ chuyên khoa của chúng tôi. Vui lòng điền thông tin vào biểu mẫu bên dưới, chúng tôi sẽ liên hệ lại để xác nhận lịch hẹn.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Section */}
          <div className="lg:w-2/3 bg-white rounded shadow-sm border border-slate-100 p-6 sm:p-10 relative z-10 mt-20">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-[#0B2046] mb-4 pb-2 border-b border-slate-100">1. Thông tin bệnh nhân</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ *</label>
                    <div className="relative">
                      
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" placeholder="Nguyễn Văn" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tên *</label>
                    <div className="relative">
                      
                      <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" placeholder="A" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ email *</label>
                    <div className="relative">
                      
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" placeholder="nguyenvana@gmail.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại *</label>
                    <div className="relative">
                      
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" placeholder="0912345678" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-xl font-bold text-[#0B2046] mb-4 pb-2 border-b border-slate-100">2. Chi tiết lịch khám</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Loại đăng ký *</label>
                    <div className="relative">
                      <select
                        name="department"
                        required
                        value={formData.department}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            department: value,
                            doctor: value === 'Chẩn đoán hình ảnh - xét nghiệm' ? prev.doctor : '',
                          }));
                        }}
                        className="pl-5 w-full py-2.5 pr-3 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="Khám bệnh">Khám bệnh</option>
                        <option value="Chẩn đoán hình ảnh - xét nghiệm">Chẩn đoán hình ảnh - xét nghiệm</option>
                      </select>
                    </div>
                  </div>
                  {formData.department === 'Chẩn đoán hình ảnh - xét nghiệm' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Dịch vụ mong muốn *</label>
                      <div className="relative">
                        <select
                          name="doctor"
                          required
                          value={formData.doctor}
                          onChange={handleChange}
                          className="pl-5 w-full py-2.5 pr-3 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all bg-white"
                        >
                          <option value="">Chọn dịch vụ</option>
                          <option value="X-Quang">X-Quang</option>
                          <option value="MRI">MRI</option>
                          <option value="CT">CT</option>
                          <option value="Siêu âm">Siêu âm</option>
                          <option value="Xét nghiệm">Xét nghiệm</option>
                          <option value="Nội soi">Nội soi</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ngày khám*</label>
                    <div className="relative">
                      <input type="date" name="date" required min={getTodayYYYYMMDDLocal()} value={formData.date} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Giờ khám *</label>
                    <div className="relative">
                      <select name="time" required value={formData.time} onChange={handleChange} className="pl-5 w-full py-2.5 pr-3 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all bg-white">
                        <option value="">Select Time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-xl font-bold text-[#0B2046] mb-4 pb-2 border-b border-slate-100">3. Thông tin thêm</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lý do khám hoặc các triệu chứng cụ thể. *</label>
                  <div className="relative">
                    <textarea name="notes" required rows={4} value={formData.notes} onChange={handleChange} className="pl-5 w-full py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-[#0084FF] focus:border-transparent outline-none transition-all" placeholder="Vui lòng mô tả các triệu chứng của bạn hoặc lý do đặt lịch khám..."></textarea>
                  </div>
                </div>
              </div>

              <div className="">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0084FF] text-white py-4 px-6 rounded font-bold text-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận đăng ký lịch khám'}
                </button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Bằng việc đặt lịch, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                </p>
              </div>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className=" mt-20 lg:w-1/3 space-y-6 relative z-10 ">
            <div className="bg-white rounded p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6">Thời gian làm việc</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-500">Thứ 2 - Thứ 6</span>
                  <span className="font-semibold">08:00 - 20:00</span>
                </li>
                <li className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-slate-500">Thứ 7</span>
                  <span className="font-semibold">09:00 - 17:00</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ nhật</span>
                  <span className="font-semibold text-red-400">Chỉ hoạt động cấp cứu</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-[#0B2046] mb-6">Thông tin liên hệ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#0084FF]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Số điện thoại khẩn cấp 24/7</p>
                    <p className="font-bold text-[#0B2046]">+1 (800) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#0084FF]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-bold text-[#0B2046]">appointments@jhcclinic.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#0084FF]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Địa chỉ</p>
                    <p className="font-bold text-[#0B2046]">123 Healthcare Ave, Medical District, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
