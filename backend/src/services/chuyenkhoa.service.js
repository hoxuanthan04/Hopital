import * as ChuyenKhoaModel from "../models/chuyenkhoa.model.js";

export const getAllChuyenKhoa = async () => {
  return await ChuyenKhoaModel.getAll();
};

export const getChuyenKhoaById = async (id) => {
  const data = await ChuyenKhoaModel.getById(id);
  if (!data) throw new Error("Chuyên khoa không tồn tại");
  return data;
};

export const createChuyenKhoa = async (data) => {
  if (!data.tenchuyenkhoa) throw new Error("Tên chuyên khoa là bắt buộc");
  return await ChuyenKhoaModel.create(data);
};

export const updateChuyenKhoa = async (id, data) => {
  const updated = await ChuyenKhoaModel.update(id, data);
  if (!updated) throw new Error("Chuyên khoa không tồn tại hoặc cập nhật thất bại");
  return updated;
};

export const deleteChuyenKhoa = async (id) => {
  const deleted = await ChuyenKhoaModel.remove(id);
  if (!deleted) throw new Error("Chuyên khoa không tồn tại");
  return deleted;
};