import * as BenhNhanModel from "../models/benhnhan.model.js";
import * as TaiKhoanModel from "../models/taikhoan.model.js";
import { autoCreatePatientAccount } from "./taikhoan.service.js";

export const getAllBenhNhan = async () => {
  return await BenhNhanModel.getAll();
};

export const getBenhNhanById = async (id) => {
  const data = await BenhNhanModel.getById(id);

  if (!data) throw new Error("Bệnh nhân không tồn tại");

  return data;
};

/** Tra cứu đầy đủ thông tin bệnh nhân theo CCCD (trim). Không có thì null. */
export const getBenhNhanBySocccd = async (socccd) => {
  const row = await BenhNhanModel.findBySocccd(String(socccd ?? "").trim());
  if (!row) return null;
  return BenhNhanModel.getById(row.mabenhnhan);
};

export const findBenhNhanByDienthoai = async (dienthoai, excludeMabenhnhan = null) =>
  BenhNhanModel.findByDienthoai(String(dienthoai ?? "").trim(), excludeMabenhnhan);

export const createBenhNhan = async (data) => {
  const socccd = String(data.socccd ?? "").trim();
  const dienthoai = String(data.dienthoai ?? "").trim();

  if (!socccd) {
    throw new Error("Vui lòng nhập số căn cước công dân.");
  }
  if (!dienthoai) {
    throw new Error("Vui lòng nhập số điện thoại.");
  }

  const duplicateBn = await BenhNhanModel.findBySocccd(socccd);
  if (duplicateBn) {
    throw new Error("Số căn cước công dân này đã được đăng ký cho bệnh nhân khác.");
  }

  const duplicatePhone = await BenhNhanModel.findByDienthoai(dienthoai);
  if (duplicatePhone) {
    throw new Error("Số điện thoại đã được đăng ký cho bệnh nhân khác.");
  }

  const existingLogin = await TaiKhoanModel.findByUsername(socccd);
  if (existingLogin) {
    throw new Error("Số CCCD này đã được dùng làm tên đăng nhập (tài khoản đã tồn tại).");
  }

  const payload = {
    ...data,
    socccd,
    dienthoai,
    namsinh:
      data.namsinh != null && data.namsinh !== "" && !Number.isNaN(Number(data.namsinh))
        ? Number(data.namsinh)
        : null,
  };
  const newPatient = await BenhNhanModel.create(payload);

  try {
    await autoCreatePatientAccount({
      dienthoai,
      socccd,
      mabenhnhan: newPatient.mabenhnhan,
    });
  } catch (err) {
    await BenhNhanModel.remove(newPatient.mabenhnhan);
    throw err;
  }

  return newPatient;
};

export const updateBenhNhan = async (id, data) => {
  const updated = await BenhNhanModel.update(id, data);

  if (!updated) throw new Error("Bệnh nhân không tồn tại");

  return updated;
};

export const deleteBenhNhan = async (id) => {
  const deleted = await BenhNhanModel.remove(id);

  if (!deleted) throw new Error("Bệnh nhân không tồn tại");

  return deleted;
};