import * as PhongKhamModel from "../models/phongkham.model.js";

export const getAllPhongKham = async () => {
  return await PhongKhamModel.getAll();
};

export const getPhongKhamById = async (id) => {
  const data = await PhongKhamModel.getById(id);
  if (!data) throw new Error("Phòng khám không tồn tại");
  return data;
};

export const getPhongKhamByMamayPhong = async (code) => {
  const data = await PhongKhamModel.getByMamayPhong(code);
  if (!data) throw new Error("Không tìm thấy phòng với mã máy này");
  return data;
};

export const createPhongKham = async (data) => {
  return await PhongKhamModel.create(data);
};

export const updatePhongKham = async (id, data) => {
  const updated = await PhongKhamModel.update(id, data);
  if (!updated) throw new Error("Phòng khám không tồn tại hoặc cập nhật thất bại");
  return updated;
};

export const deletePhongKham = async (id) => {
  const deleted = await PhongKhamModel.remove(id);
  if (!deleted) throw new Error("Phòng khám không tồn tại");
  return deleted;
};