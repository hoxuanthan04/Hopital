import * as VattuModel from "../models/vattu.model.js";

export const getAllVattu = async () => {
  return await VattuModel.getAll();
};

export const getByLoaiVattu = async (loai) => {
  const p = String(loai || "").trim();
  if (!p) return VattuModel.getAll();
  return await VattuModel.listByLoaiVattu(`%${p}%`);
};

export const getVattuById = async (id) => {
  const data = await VattuModel.getById(id);
  if (!data) throw new Error("Vật tư không tồn tại");
  return data;
};

export const createVattu = async (data) => {
  return await VattuModel.create(data);
};

export const updateVattu = async (id, data) => {
  const updated = await VattuModel.update(id, data);
  if (!updated) throw new Error("Cập nhật thất bại, vật tư không tồn tại");
  return updated;
};

export const deleteVattu = async (id) => {
  const deleted = await VattuModel.remove(id);
  if (!deleted) throw new Error("Xóa thất bại, vật tư không tồn tại");
  return deleted;
};