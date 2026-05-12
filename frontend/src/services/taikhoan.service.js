import axios from 'axios';

const API_URL = 'http://localhost:5000/api/taikhoan';
const API_NHANVIEN_URL = 'http://localhost:5000/api/nhanvien';

const TaiKhoanService = {
  // Lấy danh sách tài khoản
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy nhân viên chưa có tài khoản (Dùng cho Modal cấp tài khoản)
  getAvailableEmployees: async () => {
    const response = await axios.get(`${API_NHANVIEN_URL}/notaccount`);
    return response.data;
  },

  // Cấp tài khoản mới
  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // 1. Chức năng Khóa/Mở khóa (router.patch("/toggle-status/:id"))
  toggleStatus: async (id, currentStatus) => {
    let actorId = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const v = u.mataikhoan ?? u.id;
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) actorId = n;
      }
    } catch {
      /* ignore */
    }
    const response = await axios.patch(`${API_URL}/toggle-status/${id}`, {
      trangthai: currentStatus,
      currentStatus,
      actorId,
    });
    return response.data;
  },

  // 2. Chức năng Xóa mềm (Khớp với router.delete("/soft-delete/:id"))
  softDelete: async (id) => {
    const response = await axios.delete(`${API_URL}/soft-delete/${id}`);
    return response.data;
  },

  // Chức năng thay đổi quyền (Khớp với router.patch("/change-role/:id"))
  changeRole: async (id, newRole) => {
    const response = await axios.patch(`${API_URL}/change-role/${id}`, { loaitaikhoan: newRole });
    return response.data;
  },

  login: async (tentaikhoan, matkhau) => {
    const response = await axios.post(`${API_URL}/login`, { tentaikhoan, matkhau });
    if (response.data.token) {
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

};

export default TaiKhoanService;