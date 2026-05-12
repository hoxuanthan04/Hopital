import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/dangkyhenkham`
  : '/api/dangkyhenkham';

/**
 * Lấy danh sách tất cả các phiếu đăng ký hẹn khám
 */
export const getAllAppointments = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Lấy chi tiết một phiếu đăng ký theo ID
 */
export const getAppointmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Tạo mới một phiếu đăng ký hẹn khám
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(API_URL, appointmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cập nhật thông tin hoặc trạng thái (Xác nhận/Hủy) của phiếu đăng ký
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Xóa một phiếu đăng ký hẹn khám
 */
export const deleteAppointment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting appointment ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

/**
 * Lấy danh sách phiếu theo một trạng thái cụ thể (nếu Backend có hỗ trợ)
 */
export const getAppointmentsByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}?status=${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};