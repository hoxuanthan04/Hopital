import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/luotkham`
  : '/api/luotkham';

const LuotKhamService = {
  // Lấy danh sách tất cả lượt khám
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data; // Trả về mảng các lượt khám từ result.rows
  },

  // Lấy chi tiết 1 lượt khám theo ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách lượt khám theo mã phòng
   * @param {string|number} maphong - Mã phòng cần lọc
   */
  getByPhong: async (maphong) => {
    const response = await axios.get(`${API_URL}/phong/${maphong}`);
    return response.data;
  },

  /**
   * Tiếp nhận lượt khám mới
   * Tự động thêm bệnh nhân mới nếu chưa tồn tại dựa trên logic Backend
   * @param {Object} data - Chứa thông tin bệnh nhân (hoten, socccd...) và lượt khám (lydokham, maphong...)
   */
  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Cập nhật thông tin lượt khám
  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Xóa lượt khám
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data; // Trả về thông báo xóa thành công và dữ liệu đã xóa
  }
};

export default LuotKhamService;