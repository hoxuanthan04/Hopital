import * as HoSoModel from "../models/hosokhambenh.model.js";

export const getAllHoSo = async () => {
  return await HoSoModel.getAll();
};

export const getHoSoById = async (id) => {
  const data = await HoSoModel.getById(id);
  if (!data) throw new Error("Hồ sơ khám bệnh không tồn tại");
  return data;
};

export const createHoSo = async (data) => {
  // Bạn có thể thêm logic kiểm tra maluotkham hoặc mabenhnhan ở đây
  return await HoSoModel.create(data);
};

export const updateHoSo = async (id, data) => {
  const updated = await HoSoModel.update(id, data);
  if (!updated) throw new Error("Cập nhật hồ sơ thất bại");
  return updated;
};

export const deleteHoSo = async (id) => {
  const deleted = await HoSoModel.remove(id);
  if (!deleted) throw new Error("Hồ sơ không tồn tại");
  return deleted;
};

export const listHoSoHoanTatByMabenhnhan = async (mabenhnhan) => {
  return await HoSoModel.listHoanTatByMabenhnhan(mabenhnhan);
};

export const getDetailHoSoForBenhNhan = async (mahosokham, mabenhnhan) => {
  return await HoSoModel.getDetailForBenhNhan(mahosokham, mabenhnhan);
};