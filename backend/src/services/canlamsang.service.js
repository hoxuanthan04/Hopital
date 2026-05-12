import * as CanLamSangModel from "../models/canlamsang.model.js";

export const getAllCanLamSang = async () => {
  return await CanLamSangModel.getAll();
};

export const getCanLamSangById = async (id) => {
  const data = await CanLamSangModel.getById(id);
  if (!data) throw new Error("Dịch vụ cận lâm sàng không tồn tại");
  return data;
};

export const createCanLamSang = async (data) => {
  if (!data.tendichvu || !data.gia) {
    throw new Error("Tên dịch vụ và giá là bắt buộc");
  }
  return await CanLamSangModel.create(data);
};

export const updateCanLamSang = async (id, data) => {
  const updated = await CanLamSangModel.update(id, data);
  if (!updated) throw new Error("Dịch vụ không tồn tại hoặc cập nhật thất bại");
  return updated;
};

export const deleteCanLamSang = async (id) => {
  const deleted = await CanLamSangModel.remove(id);
  if (!deleted) throw new Error("Dịch vụ cận lâm sàng không tồn tại");
  return deleted;
};