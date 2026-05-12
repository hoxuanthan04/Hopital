import * as LichLamViecModel from "../models/lichlamviec.model.js";

export const listByNgay = (ngay) => LichLamViecModel.getByNgay(ngay);

export const listByNhanVienBetween = (manhanvien, tungay, denngay) =>
  LichLamViecModel.getByNhanVienBetween(manhanvien, tungay, denngay);

export const getById = async (id) => {
  const row = await LichLamViecModel.getById(id);
  if (!row) throw new Error("Không tìm thấy lịch làm việc");
  return row;
};

function normalizeCalam(calam) {
  return String(calam ?? "").trim();
}

async function assertKhongTrungCaPhong(data, excludeId = null) {
  const calam = normalizeCalam(data.calam);
  const ngay = String(data.ngay).slice(0, 10);
  const maphong = Number(data.maphong);
  const manhanvien = Number(data.manhanvien);

  const trungPhong = await LichLamViecModel.existsRoomCaNgay(
    maphong,
    calam,
    ngay,
    excludeId
  );
  if (trungPhong) {
    throw new Error(
      "Phòng này đã được phân vào cùng ca trong ngày đã chọn. Mỗi phòng chỉ một nhân viên trong một ca/ngày."
    );
  }

  const trungNhanVien = await LichLamViecModel.existsNhanVienCaNgay(
    manhanvien,
    calam,
    ngay,
    excludeId
  );
  if (trungNhanVien) {
    throw new Error(
      "Nhân viên này đã có ca làm việc trùng trong cùng ngày. Một người không được phân hai lần cùng một ca trong một ngày."
    );
  }
}

function mapPgUniqueError(err) {
  if (err && err.code === "23505") {
    const c = String(err.constraint || "");
    if (c.includes("phong") || String(err.detail || "").includes("maphong")) {
      return new Error(
        "Phòng này đã được phân vào cùng ca trong ngày đã chọn. Mỗi phòng chỉ một nhân viên trong một ca/ngày."
      );
    }
    if (c.includes("nhanvien") || String(err.detail || "").includes("manhanvien")) {
      return new Error(
        "Nhân viên này đã có ca làm việc trùng trong cùng ngày. Một người không được phân hai lần cùng một ca trong một ngày."
      );
    }
    return new Error("Dữ liệu trùng với lịch đã có (ràng buộc phân ca).");
  }
  return err;
}

export const create = async (data) => {
  const payload = {
    ...data,
    calam: normalizeCalam(data.calam),
  };
  await assertKhongTrungCaPhong(payload, null);
  try {
    return await LichLamViecModel.create(payload);
  } catch (err) {
    throw mapPgUniqueError(err);
  }
};

export const update = async (id, data) => {
  const payload = {
    ...data,
    calam: normalizeCalam(data.calam),
  };
  await assertKhongTrungCaPhong(payload, Number(id));
  try {
    const row = await LichLamViecModel.update(id, payload);
    if (!row) throw new Error("Không tìm thấy lịch làm việc");
    return row;
  } catch (err) {
    throw mapPgUniqueError(err);
  }
};

export const remove = async (id) => {
  const row = await LichLamViecModel.remove(id);
  if (!row) throw new Error("Không tìm thấy lịch làm việc");
  return row;
};
