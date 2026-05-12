import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/hosokhambenh`
  : '/api/hosokhambenh';

const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const HoSoKhamBenhService = {
  /** Hồ sơ đã hoàn tất của bệnh nhân đang đăng nhập (Bearer token). */
  getBenhNhanHoSoHoanTat: async () => {
    const response = await axios.get(`${API_URL}/benhnhan/ho-so-hoan-tat`, {
      headers: authHeaders()
    });
    return response.data;
  },

  /** Chi tiết một hồ sơ (chỉ khi thuộc bệnh nhân đang đăng nhập). */
  getBenhNhanHoSoChiTiet: async (mahosokham) => {
    const response = await axios.get(`${API_URL}/benhnhan/ho-so/${mahosokham}`, {
      headers: authHeaders()
    });
    return response.data;
  },

  // Lấy danh sách tất cả hồ sơ khám bệnh
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy chi tiết một hồ sơ theo mã hồ sơ
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo mới một hồ sơ khám bệnh
  // Dữ liệu 'data' nên bao gồm các trường như: 
  // mabenhnhan, khoakham, bacsiphutrach, lydokham, trieuchungbandau, v.v.
  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Cập nhật thông tin hồ sơ khám bệnh
  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Xóa hồ sơ khám bệnh
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default HoSoKhamBenhService;