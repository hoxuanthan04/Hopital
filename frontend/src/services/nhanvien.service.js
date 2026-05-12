import axios from 'axios';

// Thay đổi URL này cho đúng với cổng backend của bạn
const API_URL = 'http://localhost:5000/api/nhanvien';

const NhanVienService = {
  // Lấy danh sách tất cả nhân viên
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data; // Trả về mảng các hàng từ result.rows
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Cập nhật thông tin nhân viên
  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Xóa nhân viên
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data; // Trả về thông báo "Xóa thành công" và dữ liệu đã xóa
  }
};

export default NhanVienService;