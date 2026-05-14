import pool from "../config/db.js";
import * as LuotKhamModel from "../models/luotkham.model.js";
import * as HoSoModel from "../models/hosokhambenh.model.js";
import * as ChidinhModel from "../models/chidinhcanlamsang.model.js";
import * as CanLamSangModel from "../models/canlamsang.model.js";
import * as PhongKhamModel from "../models/phongkham.model.js";

/** Loại bỏ dấu tiếng Việt, hạ chữ thường để so khớp chức năng / dịch vụ. */
function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function compactText(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "");
}

function functionMatchesService(roomFunction, serviceText) {
  const fn = normalizeText(roomFunction);
  const fnCompact = compactText(roomFunction);
  const service = normalizeText(serviceText);
  const serviceCompact = compactText(serviceText);

  if (!fn || !service) return false;

  // Các dịch vụ con như "X-Quang xương", "X quang phổi" đều về phòng "Chụp X-Quang".
  if (fnCompact.includes("xquang") && serviceCompact.includes("xquang")) return true;

  // Tương tự, mọi loại siêu âm chi tiết đều về phòng có chức năng "Siêu âm".
  if (fnCompact.includes("sieuam") && serviceCompact.includes("sieuam")) return true;

  // Các kỹ thuật khác vẫn giữ cách khớp theo từ khóa chức năng cấu hình ở phòng.
  return service.includes(fn) || serviceCompact.includes(fnCompact);
}

/**
 * Chọn phòng đang hoạt động có chức năng khớp với dịch vụ CLS, ưu tiên ít người chờ nhất.
 * Trả về { picked, candidates }; nếu không có phòng phù hợp đang hoạt động, picked = null.
 */
async function pickRoomForChidinh(dichvu) {
  const rooms = await PhongKhamModel.getActiveRoomsWithChidinhQueue();
  const serviceText = normalizeText(`${dichvu.tendichvu || ""} ${dichvu.loaidichvu || ""}`);
  if (!serviceText) {
    return { picked: null, candidates: [] };
  }

  const candidates = rooms.filter((room) => {
    const raw = String(room.chucnang || "").trim();
    if (!raw) return false;
    const tokens = raw
      .split(/[,;|/]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    return tokens.some((token) => functionMatchesService(token, serviceText));
  });

  if (candidates.length === 0) {
    return { picked: null, candidates: [] };
  }

  candidates.sort((a, b) => {
    if (a.queue_count !== b.queue_count) return a.queue_count - b.queue_count;
    return a.maphong - b.maphong;
  });

  return { picked: candidates[0], candidates };
}

const TRANGTHAI_DANG_CLS = "Đang thực hiện CLS";
const TRANGTHAI_CHO_KET_LUAN = "Chờ kết luận";

/** Nhóm tab chỉ định CLS (khớp frontend). */
export function clsTabFromLoaiDichVu(loaidichvu) {
  const s = String(loaidichvu || "").toLowerCase();
  if (
    s.includes("xét nghiệm") ||
    s.includes("xet nghiem") ||
    s.includes("huyết học") ||
    s.includes("sinh hóa")
  ) {
    return "XetNghiem";
  }
  if (s.includes("siêu âm") || s.includes("sieu am")) return "SieuAm";
  if (
    s.includes("x-quang") ||
    s.includes("xquang") ||
    s.includes("x quang") ||
    s.includes("ct") ||
    s.includes("cộng hưởng")
  ) {
    return "XQuang";
  }
  if (s.includes("nội soi") || s.includes("noi soi")) return "NoiSoi";
  return "Khac";
}

function groupCanLamSang(rows) {
  const grouped = {
    XetNghiem: [],
    SieuAm: [],
    XQuang: [],
    NoiSoi: [],
    Khac: [],
  };
  for (const row of rows) {
    const st = (row.trangthai || "").toLowerCase();
    if (st && !st.includes("hoạt động") && st !== "active") continue;
    const tab = clsTabFromLoaiDichVu(row.loaidichvu);
    const key = grouped[tab] != null ? tab : "Khac";
    grouped[key].push(row);
  }
  return grouped;
}

export async function getSession(maluotkham) {
  const id = Number(maluotkham);
  if (!Number.isFinite(id)) throw new Error("maluotkham không hợp lệ");

  const visit = await LuotKhamModel.getById(id);
  if (!visit) throw new Error("Không tìm thấy lượt khám");

  let hoso = await HoSoModel.getByMaluotkham(id);
  if (!hoso) {
    const lydo = visit.lydokham != null ? String(visit.lydokham) : "";
    hoso = await HoSoModel.create({
      mabenhnhan: visit.mabenhnhan,
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
      trangthai: "Đang khám",
      maluotkham: id,
      madonthuoc: null,
    });
  }

  const chidinh = await ChidinhModel.listByMahosokham(hoso.mahosokham);
  const allCls = await CanLamSangModel.getAll();
  const canlamsangByCategory = groupCanLamSang(allCls);

  return {
    luotkham: visit,
    hosokhambenh: hoso,
    chidinh,
    canlamsangByCategory,
  };
}

export async function addChidinh({ mahosokham, madichvu, bacsichidinh, maluotkham }) {
  const mid = Number(mahosokham);
  const dv = Number(madichvu);
  if (!Number.isFinite(mid) || !Number.isFinite(dv)) {
    throw new Error("mahosokham hoặc madichvu không hợp lệ");
  }

  const hoso = await HoSoModel.getById(mid);
  if (!hoso) throw new Error("Không tìm thấy hồ sơ khám bệnh");
  const curHosoTT = String(hoso.trangthai || "").trim();
  if (
    curHosoTT === "Hoàn thành" ||
    curHosoTT === "Đã hoàn tất" ||
    curHosoTT === "Chờ thanh toán" ||
    curHosoTT === "Đã hủy"
  ) {
    throw new Error(
      "Lượt khám đã kết thúc giai đoạn khám lâm sàng, không thể thêm chỉ định CLS."
    );
  }

  const dichvu = await CanLamSangModel.getById(dv);
  if (!dichvu) throw new Error("Không tìm thấy dịch vụ cận lâm sàng");

  const tab = clsTabFromLoaiDichVu(dichvu.loaidichvu);
  if (tab === "Khac") {
    throw new Error(
      "Dịch vụ chưa thuộc nhóm Xét nghiệm / Siêu âm / X-Quang / Nội soi. Cập nhật trường loaidichvu trong danh mục cận lâm sàng."
    );
  }

  const daCo = await ChidinhModel.existsMahosokhamMadichvu(mid, dv);
  if (daCo) {
    throw new Error(
      `Dịch vụ «${dichvu.tendichvu || "CLS"}» đã được chỉ định trong lượt khám này. Có thể chọn thêm các dịch vụ CLS khác (kể cả cùng nhóm, ví dụ nhiều loại X-quang khác nhau), nhưng không chỉ định trùng cùng một dịch vụ.`
    );
  }

  const { picked: pickedRoom } = await pickRoomForChidinh(dichvu);
  if (!pickedRoom) {
    throw new Error(
      `Cận lâm sàng «${dichvu.tendichvu || "CLS"}» chưa có phòng nào đang hoạt động. Vui lòng kiểm tra danh mục phòng (chức năng / trạng thái) trước khi chỉ định.`
    );
  }

  let created;
  try {
    created = await ChidinhModel.create({
      mahosokham: mid,
      madichvu: dv,
      bacsichidinh: bacsichidinh != null ? Number(bacsichidinh) : null,
      trangthai: "Chờ thực hiện",
      maphong_thuchien: pickedRoom.maphong,
    });
  } catch (e) {
    if (e && e.code === "23505") {
      throw new Error(
        `Dịch vụ «${dichvu.tendichvu || "CLS"}» đã được chỉ định (ràng buộc cơ sở dữ liệu). Không thể chỉ định trùng cùng một dịch vụ.`
      );
    }
    throw e;
  }

  // Nếu bác sĩ bổ sung chỉ định sau khi hồ sơ đã chuyển sang «Chờ kết luận»
  // thì hệ thống tự quay lại trạng thái «Đang thực hiện CLS» cho hồ sơ + lượt khám.
  if (curHosoTT === TRANGTHAI_CHO_KET_LUAN) {
    const lidFromBody = Number(maluotkham);
    const lid = Number.isFinite(lidFromBody)
      ? lidFromBody
      : hoso.maluotkham != null
        ? Number(hoso.maluotkham)
        : null;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE hosokhambenh SET trangthai = $1 WHERE mahosokham = $2`,
        [TRANGTHAI_DANG_CLS, mid]
      );
      if (Number.isFinite(lid)) {
        await client.query(
          `UPDATE luotkham SET trangthai = $1 WHERE maluotkham = $2`,
          [TRANGTHAI_DANG_CLS, lid]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  return created;
}

/** Hàng đợi chỉ định đang chờ thực hiện tại một phòng. */
export async function listChidinhByPhong(maphong) {
  const id = Number(maphong);
  if (!Number.isFinite(id)) throw new Error("maphong không hợp lệ");
  return await ChidinhModel.listPendingByPhong(id);
}

/** Đánh dấu chỉ định đang được phòng thực hiện (mời vào). */
export async function markChidinhDangThucHien(machidinh) {
  const id = Number(machidinh);
  if (!Number.isFinite(id)) throw new Error("machidinh không hợp lệ");

  const row = await ChidinhModel.getById(id);
  if (!row) throw new Error("Không tìm thấy chỉ định");

  const tt = String(row.trangthai || "").trim();
  if (tt === "Đã hoàn thành" || tt === "Đã hủy") {
    throw new Error("Chỉ định đã kết thúc, không thể mời vào.");
  }

  if (row.maphong_thuchien != null) {
    const busy = await ChidinhModel.findOtherDangThucHienInPhong(row.maphong_thuchien, id);
    if (busy) {
      throw new Error(
        "Phòng đang thực hiện một chỉ định khác. Vui lòng hoàn tất chỉ định đó trước khi mời bệnh nhân mới."
      );
    }
  }

  return await ChidinhModel.updateTrangThai(id, "Đang thực hiện");
}

export async function deleteChidinh(machidinh) {
  const row = await ChidinhModel.getById(machidinh);
  if (!row) throw new Error("Không tìm thấy chỉ định");
  const tt = (row.trangthai || "").trim();
  if (tt === "Đã hoàn thành") {
    throw new Error("Không thể xóa chỉ định đã hoàn thành.");
  }
  return await ChidinhModel.remove(machidinh);
}

/** Khi mọi chỉ định CLS đã hoàn thành, tự chuyển hồ sơ + lượt khám sang «Chờ kết luận». */
async function maybeMoveToChoKetLuan(mahosokham) {
  const hid = Number(mahosokham);
  if (!Number.isFinite(hid)) return;

  const hoso = await HoSoModel.getById(hid);
  if (!hoso) return;
  const cur = String(hoso.trangthai || "").trim();
  if (cur !== TRANGTHAI_DANG_CLS) return;

  const list = await ChidinhModel.listByMahosokham(hid);
  if (list.length === 0) return;
  const allDone = list.every((c) => String(c.trangthai || "").trim() === "Đã hoàn thành");
  if (!allDone) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE hosokhambenh SET trangthai = $1 WHERE mahosokham = $2`,
      [TRANGTHAI_CHO_KET_LUAN, hid]
    );
    if (hoso.maluotkham != null) {
      await client.query(
        `UPDATE luotkham SET trangthai = $1 WHERE maluotkham = $2`,
        [TRANGTHAI_CHO_KET_LUAN, hoso.maluotkham]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Hoàn tất chỉ định CLS: chuyển trạng thái hồ sơ + lượt khám sang «Đang thực hiện CLS».
 * Nếu lúc đó mọi chỉ định đã hoàn thành thì chuyển luôn sang «Chờ kết luận».
 */
export async function startChidinhExecution({ mahosokham, maluotkham }) {
  const hid = Number(mahosokham);
  const lid = Number(maluotkham);
  if (!Number.isFinite(hid) || !Number.isFinite(lid)) {
    throw new Error("mahosokham hoặc maluotkham không hợp lệ");
  }

  const hoso = await HoSoModel.getById(hid);
  if (!hoso || Number(hoso.maluotkham) !== lid) {
    throw new Error("Hồ sơ khám không khớp lượt khám.");
  }

  const cur = String(hoso.trangthai || "").trim();
  if (cur === "Hoàn thành" || cur === "Đã hủy" || cur === "Chờ thanh toán" || cur === "Đã hoàn tất") {
    throw new Error("Lượt khám đã kết thúc, không thể hoàn tất chỉ định CLS.");
  }
  if (cur === TRANGTHAI_DANG_CLS || cur === TRANGTHAI_CHO_KET_LUAN) {
    throw new Error("Lượt khám đã chuyển sang giai đoạn thực hiện CLS.");
  }

  const list = await ChidinhModel.listByMahosokham(hid);
  if (list.length === 0) {
    throw new Error("Chưa có chỉ định cận lâm sàng nào để hoàn tất.");
  }
  const allDone = list.every((c) => String(c.trangthai || "").trim() === "Đã hoàn thành");
  const newState = allDone ? TRANGTHAI_CHO_KET_LUAN : TRANGTHAI_DANG_CLS;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE hosokhambenh SET trangthai = $1 WHERE mahosokham = $2`,
      [newState, hid]
    );
    await client.query(
      `UPDATE luotkham SET trangthai = $1 WHERE maluotkham = $2`,
      [newState, lid]
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return { trangthai: newState };
}

export async function markChidinhHoanThanh(machidinh) {
  const row = await ChidinhModel.getById(machidinh);
  if (!row) throw new Error("Không tìm thấy chỉ định");
  const updated = await ChidinhModel.updateTrangThai(machidinh, "Đã hoàn thành");
  await maybeMoveToChoKetLuan(row.mahosokham);
  return updated;
}

export async function saveChidinhKetQua({
  machidinh,
  ketquahinhanh,
  dicom_url,
  dicom_public_id,
  dicom_tenfile,
}) {
  const id = Number(machidinh);
  if (!Number.isFinite(id)) throw new Error("machidinh không hợp lệ");

  const row = await ChidinhModel.getById(id);
  if (!row) throw new Error("Không tìm thấy chỉ định");

  const ketqua = ketquahinhanh != null ? String(ketquahinhanh).trim() : "";
  const dicomUrl = dicom_url != null ? String(dicom_url).trim() : "";
  if (!ketqua && !dicomUrl) {
    throw new Error("Vui lòng nhập kết luận hình ảnh/xét nghiệm hoặc tải file DICOM.");
  }

  const updated = await ChidinhModel.updateKetQua(id, {
    ketquahinhanh: ketqua ? ketqua.slice(0, 2000) : null,
    dicom_url: dicomUrl || null,
    dicom_public_id: dicom_public_id != null ? String(dicom_public_id).slice(0, 300) : null,
    dicom_tenfile: dicom_tenfile != null ? String(dicom_tenfile).slice(0, 255) : null,
  });
  await maybeMoveToChoKetLuan(row.mahosokham);
  return updated;
}

const HOAN_THANH_CLS = "Đã hoàn thành";

export async function completeExamination({
  mahosokham,
  maluotkham,
  chandoansobo,
  ketluan,
  ngayhentaikham,
  ketquacanlamsang,
  bacsiphutrach,
  prescriptions,
}) {
  const hid = Number(mahosokham);
  const lid = Number(maluotkham);
  if (!Number.isFinite(hid) || !Number.isFinite(lid)) {
    throw new Error("mahosokham hoặc maluotkham không hợp lệ");
  }

  const ketluanStr = ketluan != null ? String(ketluan).trim() : "";
  if (!ketluanStr) {
    throw new Error("Vui lòng nhập chẩn đoán xác định (kết luận) trước khi hoàn tất khám.");
  }

  const hoso = await HoSoModel.getById(hid);
  if (!hoso || Number(hoso.maluotkham) !== lid) {
    throw new Error("Hồ sơ khám không khớp lượt khám.");
  }

  const chidinhList = await ChidinhModel.listByMahosokham(hid);
  for (const c of chidinhList) {
    const tt = (c.trangthai || "").trim();
    if (tt !== HOAN_THANH_CLS) {
      throw new Error(
        "Còn chỉ định cận lâm sàng chưa hoàn thành. Vui lòng đánh dấu đủ kết quả CLS trước khi hoàn tất khám."
      );
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
      UPDATE hosokhambenh SET
        chandoansobo = $1,
        ketluan = $2,
        ngayhentaikham = $3,
        ketquacanlamsang = $4,
        bacsiphutrach = $5,
        trangthai = $6
      WHERE mahosokham = $7
      `,
      [
        chandoansobo != null ? String(chandoansobo).slice(0, 300) : null,
        ketluanStr.slice(0, 300),
        ngayhentaikham || null,
        ketquacanlamsang != null ? String(ketquacanlamsang).slice(0, 200) : null,
        bacsiphutrach != null ? Number(bacsiphutrach) : null,
        "Chờ thanh toán",
        hid,
      ]
    );

    let madonthuoc = hoso.madonthuoc != null ? Number(hoso.madonthuoc) : null;
    const lines = Array.isArray(prescriptions) ? prescriptions : [];

    if (lines.length > 0) {
      const dtRes = await client.query(
        `
        INSERT INTO donthuoc (bacsikedon, ngaykedon, mabenhnhan)
        VALUES ($1, CURRENT_DATE, $2)
        RETURNING madonthuoc
        `,
        [bacsiphutrach != null ? Number(bacsiphutrach) : null, hoso.mabenhnhan]
      );
      madonthuoc = dtRes.rows[0].madonthuoc;

      for (const p of lines) {
        const mavattu = Number(p.mavattu);
        const soluong = Math.max(1, Number(p.soluong) || 1);
        if (!Number.isFinite(mavattu)) continue;
        await client.query(
          `
          INSERT INTO chitietdonthuoc (madonthuoc, mavattu, mathuoc, soluong, lieudung, cachdung)
          VALUES ($1, $2, NULL, $3, $4, $5)
          `,
          [
            madonthuoc,
            mavattu,
            soluong,
            p.lieudung != null ? String(p.lieudung).slice(0, 200) : null,
            p.cachdung != null ? String(p.cachdung).slice(0, 200) : null,
          ]
        );
      }

      await client.query(
        `UPDATE hosokhambenh SET madonthuoc = $1 WHERE mahosokham = $2`,
        [madonthuoc, hid]
      );
    }

    await client.query(
      `UPDATE luotkham SET trangthai = $1 WHERE maluotkham = $2`,
      ["Hoàn thành", lid]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e && e.code === "42703") {
      throw new Error(
        "Thiếu cột cơ sở dữ liệu (mavattu / madonthuoc). Chạy migration backend/migrations/003_examination_hoso_donthuoc.sql."
      );
    }
    throw e;
  } finally {
    client.release();
  }

  const updated = await HoSoModel.getById(hid);
  return updated;
}
