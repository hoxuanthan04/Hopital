import * as LuotKhamModel from "../models/luotkham.model.js";
import * as BenhNhanModel from "../models/benhnhan.model.js";
import * as HoSoModel from "../models/hosokhambenh.model.js";

export const getAllLuotKham = () => LuotKhamModel.getAll();

export const getLuotKhamById = async (id) => {
  const data = await LuotKhamModel.getById(id);
  if (!data) throw new Error("Không tìm thấy lượt khám");
  return data;
};

export const getLuotKhamByPhong = (maphong) => LuotKhamModel.getByPhong(maphong);

/** Mỗi lượt khám có đúng một hồ sơ khám bệnh mở tại tiếp nhận (không trùng nếu đã tồn tại). */
async function ensureHoSoForVisit(visit) {
  const maluotkham = Number(visit?.maluotkham);
  const mabenhnhan = visit?.mabenhnhan != null ? Number(visit.mabenhnhan) : null;
  if (!Number.isFinite(maluotkham) || !Number.isFinite(mabenhnhan)) return;

  const existing = await HoSoModel.getByMaluotkham(maluotkham);
  if (existing) return;

  const lydo = visit.lydokham != null ? String(visit.lydokham) : "";
  await HoSoModel.create({
    mabenhnhan,
    khoakham: null,
    bacsiphutrach: null,
    lydokham: lydo || null,
    trieuchungbandau: lydo,
    tieusubenh: null,
    tiensuphauthuat: null,
    diung: null,
    chandoansobo: null,
    ketluan: null,
    ngayhentaikham: null,
    ketquacanlamsang: null,
    trangthai: "Chờ khám",
    maluotkham,
    madonthuoc: null,
  });
}

export const registerVisit = async (data) => {
  const socccd = String(data.socccd ?? "").trim();
  const existing = socccd ? await BenhNhanModel.findBySocccd(socccd) : null;
  let visit;
  if (existing) {
    const incomplete = await LuotKhamModel.findIncompleteVisitByMabenhnhan(existing.mabenhnhan);
    if (incomplete) {
      throw new Error(
        `Bệnh nhân đang có lượt khám chưa hoàn thành (mã lượt ${incomplete.maluotkham}, trạng thái: ${incomplete.trangthai || "—"}). Vui lòng hoàn tất lượt khám đó trước khi tiếp nhận lượt mới.`
      );
    }
    visit = await LuotKhamModel.create({
      ...data,
      socccd,
      mabenhnhan: existing.mabenhnhan,
    });
  } else {
    visit = await LuotKhamModel.createWithNewPatient({ ...data, socccd });
  }
  await ensureHoSoForVisit(visit);
  return visit;
};

const MSG_PHONG_DANG_CO_LUOT_KHAM =
  "Bạn đang có lượt khám chưa hoàn thành. Vui lòng hoàn tất để bắt đầu lượt khám mới.";

export const updateLuotKham = async (id, data) => {
  const current = await LuotKhamModel.getById(id);
  if (!current) throw new Error("Không tìm thấy lượt khám");
  const curTt = String(current.trangthai || "").trim();
  if (curTt === "Hoàn thành" || curTt === "Đã hủy") {
    throw new Error(
      curTt === "Đã hủy"
        ? "Lượt khám đã hủy, không thể cập nhật hoặc mời vào khám."
        : "Lượt khám đã hoàn thành, không thể cập nhật hoặc mời vào khám."
    );
  }

  const incoming = data.trangthai != null ? String(data.trangthai).trim() : "";
  if (incoming === "Đang khám") {
    const maphong =
      data.maphong != null && data.maphong !== ""
        ? Number(data.maphong)
        : current.maphong != null
          ? Number(current.maphong)
          : NaN;
    if (Number.isFinite(maphong)) {
      const busy = await LuotKhamModel.findOtherDangKhamInPhong(maphong, Number(id));
      if (busy) {
        throw new Error(MSG_PHONG_DANG_CO_LUOT_KHAM);
      }
    }
  }

  return LuotKhamModel.update(id, data);
};
export const deleteLuotKham = (id) => LuotKhamModel.remove(id);