import axios from 'axios';

// Thay đổi URL này cho đúng với cổng backend và route bạn đã thiết lập
const API_URL = 'http://localhost:5000/api/chuyenkhoa';

const ChuyenKhoaService = {
  // Lấy danh sách tất cả chuyên khoa
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data; // Trả về mảng các chuyên khoa
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi kết nối đến máy chủ" };
    }
  },

  // Lấy chi tiết 1 chuyên khoa theo ID (machuyenkhoa)
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Không thể lấy thông tin chuyên khoa" };
    }
  },

  // Thêm mới chuyên khoa
  // data cần chứa: tenchuyenkhoa, mota, trangthai (boolean)
  create: async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi thêm chuyên khoa mới" };
    }
  },

  // Cập nhật thông tin chuyên khoa
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi cập nhật chuyên khoa" };
    }
  },

  // Xóa chuyên khoa
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data; // Trả về thông báo xóa thành công và dữ liệu đã xóa
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi xóa chuyên khoa" };
    }
  }
};

export default ChuyenKhoaService;