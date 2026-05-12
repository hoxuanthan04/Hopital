import * as NhanVienModel from "../models/nhanvien.model.js";

export const getAllNhanVien = async () => {
  return await NhanVienModel.getAll();
};

export const getNhanVienById = async (id) => {
  const data = await NhanVienModel.getById(id);
  if (!data) throw new Error("Nhân viên không tồn tại");
  return data;
};

export const createNhanVien = async (data) => {
  return await NhanVienModel.create(data);
};

export const updateNhanVien = async (id, data) => {
  const updated = await NhanVienModel.update(id, data);
  if (!updated) throw new Error("Nhân viên không tồn tại hoặc cập nhật thất bại");
  return updated;
};

export const deleteNhanVien = async (id) => {
  const deleted = await NhanVienModel.remove(id);
  if (!deleted) throw new Error("Nhân viên không tồn tại");
  return deleted;
};

export const getEmployeesWithoutAccount = async () => {
  const employees = await NhanVienModel.getWithoutAccount();
  // Nếu không có ai cũng trả về mảng rỗng thay vì lỗi, 
  // vì đây là kết quả hợp lệ của việc tìm kiếm
  return employees;
};