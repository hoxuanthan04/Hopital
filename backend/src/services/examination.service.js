import pool from "../config/db.js";
import * as LuotKhamModel from "../models/luotkham.model.js";
import * as HoSoModel from "../models/hosokhambenh.model.js";
import * as ChidinhModel from "../models/chidinhcanlamsang.model.js";
import * as CanLamSangModel from "../models/canlamsang.model.js";

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

export async function addChidinh({ mahosokham, madichvu, bacsichidinh }) {
  const mid = Number(mahosokham);
  const dv = Number(madichvu);
  if (!Number.isFinite(mid) || !Number.isFinite(dv)) {
    throw new Error("mahosokham hoặc madichvu không hợp lệ");
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

  try {
    return await ChidinhModel.create({
      mahosokham: mid,
      madichvu: dv,
      bacsichidinh: bacsichidinh != null ? Number(bacsichidinh) : null,
      trangthai: "Chờ thực hiện",
    });
  } catch (e) {
    if (e && e.code === "23505") {
      throw new Error(
        `Dịch vụ «${dichvu.tendichvu || "CLS"}» đã được chỉ định (ràng buộc cơ sở dữ liệu). Không thể chỉ định trùng cùng một dịch vụ.`
      );
    }
    throw e;
  }
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

export async function markChidinhHoanThanh(machidinh) {
  const row = await ChidinhModel.getById(machidinh);
  if (!row) throw new Error("Không tìm thấy chỉ định");
  return await ChidinhModel.updateTrangThai(machidinh, "Đã hoàn thành");
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
