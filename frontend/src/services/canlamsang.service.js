import axios from 'axios';

// URL này phải khớp với cổng và route bạn đã thiết lập ở backend
const API_URL = 'http://localhost:5000/api/canlamsang';

const CanLamSangService = {
  // 1. Lấy danh sách tất cả dịch vụ cận lâm sàng
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data; // Trả về mảng các dịch vụ
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi tải danh sách dịch vụ" };
    }
  },

  // 2. Lấy chi tiết một dịch vụ theo ID (madichvu)
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Không tìm thấy dịch vụ" };
    }
  },

  // 3. Thêm mới dịch vụ cận lâm sàng
  // data gồm: tendichvu, loaidichvu, gia, mota, trangthai
  create: async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi thêm dịch vụ mới" };
    }
  },

  // 4. Cập nhật thông tin dịch vụ
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi cập nhật dịch vụ" };
    }
  },

  // 5. Xóa dịch vụ cận lâm sàng
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi khi xóa dịch vụ" };
    }
  }
};

export default CanLamSangService;