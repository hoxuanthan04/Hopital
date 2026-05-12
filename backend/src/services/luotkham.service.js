import * as LuotKhamModel from "../models/luotkham.model.js";
import * as BenhNhanModel from "../models/benhnhan.model.js";

export const getAllLuotKham = () => LuotKhamModel.getAll();

export const getLuotKhamById = async (id) => {
  const data = await LuotKhamModel.getById(id);
  if (!data) throw new Error("Không tìm thấy lượt khám");
  return data;
};

export const getLuotKhamByPhong = (maphong) => LuotKhamModel.getByPhong(maphong);

export const registerVisit = async (data) => {
  const socccd = String(data.socccd ?? "").trim();
  const existing = socccd ? await BenhNhanModel.findBySocccd(socccd) : null;
  if (existing) {
    const incomplete = await LuotKhamModel.findIncompleteVisitByMabenhnhan(existing.mabenhnhan);
    if (incomplete) {
      throw new Error(
        `Bệnh nhân đang có lượt khám chưa hoàn thành (mã lượt ${incomplete.maluotkham}, trạng thái: ${incomplete.trangthai || "—"}). Vui lòng hoàn tất lượt khám đó trước khi tiếp nhận lượt mới.`
      );
    }
    return await LuotKhamModel.create({
      ...data,
      socccd,
      mabenhnhan: existing.mabenhnhan,
    });
  }
  return await LuotKhamModel.createWithNewPatient({ ...data, socccd });
};

export const updateLuotKham = (id, data) => LuotKhamModel.update(id, data);
export const deleteLuotKham = (id) => LuotKhamModel.remove(id);