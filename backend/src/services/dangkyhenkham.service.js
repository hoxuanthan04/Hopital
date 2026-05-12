import * as DKHKModel from "../models/dangkyhenkham.model.js";

/** Ngày YYYY-MM-DD + giờ HH:mm theo timezone local của server (Node). */
function parseLocalSlotStart(ngaykham, giokham) {
  const raw = ngaykham == null ? "" : String(ngaykham).trim();
  const tStr = String(giokham ?? "").trim();
  const dPart = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const tPart = tStr.match(/^(\d{1,2}):(\d{2})/);
  if (!dPart || !tPart) return null;
  const y = Number(dPart[1]);
  const mo = Number(dPart[2]);
  const da = Number(dPart[3]);
  const h = Number(tPart[1]);
  const mi = Number(tPart[2]);
  if ([y, mo, da, h, mi].some((n) => Number.isNaN(n))) return null;
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  const slot = new Date(y, mo - 1, da, h, mi, 0, 0);
  if (Number.isNaN(slot.getTime())) return null;
  return slot;
}

export const getAllDKHK = async () => {
  return await DKHKModel.getAll();
};

export const getDKHKById = async (id) => {
  const data = await DKHKModel.getById(id);
  if (!data) throw new Error("Phiếu đăng ký không tồn tại");
  return data;
};

export const createDKHK = async (data) => {
  const hoten = String(data.hoten ?? "").trim();
  const sodienthoai = String(data.sodienthoai ?? "").trim();
  const ngaykham = data.ngaykham;
  const giokham = String(data.giokham ?? "").trim();
  const lydokham = String(data.lydokham ?? "").trim();

  if (!hoten) throw new Error("Vui lòng nhập họ tên.");
  if (!sodienthoai) throw new Error("Vui lòng nhập số điện thoại.");
  if (!ngaykham) throw new Error("Vui lòng chọn ngày khám.");
  if (!giokham) throw new Error("Vui lòng chọn giờ khám.");
  if (!lydokham) throw new Error("Vui lòng nhập lý do khám / triệu chứng.");

  const slot = parseLocalSlotStart(ngaykham, giokham);
  if (!slot) throw new Error("Ngày hoặc giờ khám không hợp lệ.");
  if (slot.getTime() < Date.now()) {
    throw new Error("Không được đặt lịch vào thời gian trong quá khứ.");
  }

  return await DKHKModel.create(data);
};

export const updateDKHK = async (id, data) => {
  const updated = await DKHKModel.update(id, data);
  if (!updated) throw new Error("Cập nhật thất bại hoặc phiếu không tồn tại");
  return updated;
};

export const deleteDKHK = async (id) => {
  const deleted = await DKHKModel.remove(id);
  if (!deleted) throw new Error("Phiếu đăng ký không tồn tại");
  return deleted;
};