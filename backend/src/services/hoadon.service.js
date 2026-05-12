import pool from "../config/db.js";
import * as HoaDonModel from "../models/hoadon.model.js";
import * as HoSoModel from "../models/hosokhambenh.model.js";

export const list = () => HoaDonModel.getAll();

export const getById = async (id) => {
  const row = await HoaDonModel.getById(id);
  if (!row) throw new Error("Không tìm thấy hóa đơn");
  return row;
};

export const getChiTiet = async (mahoadon) => {
  await getById(mahoadon);
  return HoaDonModel.getChiTietDichVu(mahoadon);
};

export const create = (data) => HoaDonModel.create(data);

export const update = async (id, data) => {
  const row = await HoaDonModel.update(id, data);
  if (!row) throw new Error("Không tìm thấy hóa đơn");
  return row;
};

export const remove = async (id) => {
  const row = await HoaDonModel.remove(id);
  if (!row) throw new Error("Không tìm thấy hóa đơn");
  return row;
};

function roundVnd(n) {
  return Math.max(0, Math.round(Number(n) || 0));
}

export function isInvoiceFullyPaid(row) {
  const t = roundVnd(row.tongtien);
  const b = roundVnd(row.sotienbaohiemchitra);
  const p = roundVnd(row.thuctracuabenhnhan);
  if (t <= 0) return false;
  return b + p >= t - 0.5;
}

export function parseMahosokhamFromInvoice(inv) {
  const s = String(inv?.danhsachdichvu || "");
  const m = s.match(/^\[HSK:(\d+)\]/);
  return m ? Number(m[1]) : null;
}

export function formatHoSoDichVuDescription(mahosokham, humanText) {
  const tail = humanText != null ? String(humanText).trim() : "";
  return `[HSK:${Number(mahosokham)}]${tail ? ` ${tail}` : ""}`.trim();
}

export async function syncHoSoAfterInvoicePaid(inv) {
  const mid = parseMahosokhamFromInvoice(inv);
  if (!mid) return;
  try {
    await HoSoModel.updateTrangThai(mid, "Đã hoàn tất");
  } catch {
    /* ignore */
  }
}

function defaultTienKhamVnd() {
  return roundVnd(process.env.TIEN_KHAM_VND || 150000);
}

/** Hồ sơ đang chờ lập / thanh toán hóa đơn (sau hoàn tất khám). */
export async function listHosoChoThanhToan() {
  const r = await pool.query(
    `
    SELECT h.mahosokham,
           h.mabenhnhan,
           h.trangthai,
           h.maluotkham,
           h.madonthuoc,
           bn.hoten
    FROM hosokhambenh h
    LEFT JOIN benhnhan bn ON h.mabenhnhan = bn.mabenhnhan
    WHERE TRIM(COALESCE(h.trangthai, '')) = 'Chờ thanh toán'
    ORDER BY h.mahosokham DESC
    `
  );
  return r.rows;
}

export async function previewInvoiceFromHoSo(mahosokham) {
  const hid = Number(mahosokham);
  if (!Number.isFinite(hid)) throw new Error("mahosokham không hợp lệ");

  const hoso = await HoSoModel.getById(hid);
  if (!hoso) throw new Error("Không tìm thấy hồ sơ khám");
  const tt = String(hoso.trangthai || "").trim();
  if (tt !== "Chờ thanh toán") {
    throw new Error("Hồ sơ không ở trạng thái «Chờ thanh toán».");
  }

  const tongClsR = await pool.query(
    `
    SELECT COALESCE(SUM(cl.gia), 0)::numeric AS tong
    FROM chidinhcanlamsang c
    JOIN canlamsang cl ON c.madichvu = cl.madichvu
    WHERE c.mahosokham = $1
    `,
    [hid]
  );
  const tongCls = roundVnd(tongClsR.rows[0]?.tong);

  let tongThuoc = 0;
  if (hoso.madonthuoc != null) {
    const tr = await pool.query(
      `
      SELECT COALESCE(SUM(ct.soluong * COALESCE(t.giaban, v.giaban, 0)), 0)::numeric AS tong
      FROM chitietdonthuoc ct
      LEFT JOIN danhmucthuoc t ON ct.mathuoc = t.mathuoc
      LEFT JOIN danhmucvattu v ON ct.mavattu = v.mavattu
      WHERE ct.madonthuoc = $1
      `,
      [hoso.madonthuoc]
    );
    tongThuoc = roundVnd(tr.rows[0]?.tong);
  }

  const tienKham = defaultTienKhamVnd();
  const tongTien = roundVnd(tongCls + tongThuoc + tienKham);
  const dup = await HoaDonModel.findMahoadonByHoSoMarker(hid);

  const bn = await pool.query(`SELECT hoten FROM benhnhan WHERE mabenhnhan = $1`, [
    hoso.mabenhnhan,
  ]);

  return {
    mahosokham: hid,
    mabenhnhan: Number(hoso.mabenhnhan),
    hoten: bn.rows[0]?.hoten ?? null,
    tong_canlamsang: tongCls,
    tong_thuoc: tongThuoc,
    tien_kham: tienKham,
    tongtien: tongTien,
    da_co_hoadon_mahoadon: dup,
  };
}

/**
 * Tạo hóa đơn từ hồ sơ «Chờ thanh toán».
 * thuctracuabenhnhan lưu tạm ứng; PayOS thu phần còn lại tong - BHYT - tạm ứng.
 */
export async function createFromHoSo({ mahosokham, sotienbaohiemchitra, tamung }) {
  const preview = await previewInvoiceFromHoSo(mahosokham);
  if (preview.da_co_hoadon_mahoadon) {
    throw new Error(
      `Đã tồn tại hóa đơn #${preview.da_co_hoadon_mahoadon} cho hồ sơ #${preview.mahosokham}.`
    );
  }

  const bh = roundVnd(sotienbaohiemchitra);
  const advance = roundVnd(tamung);
  if (bh > preview.tongtien) {
    throw new Error("BHYT chi trả không được lớn hơn tổng hóa đơn.");
  }
  if (advance > preview.tongtien - bh) {
    throw new Error("Tạm ứng không được vượt quá (tổng − BHYT).");
  }

  const human = `Tự động: CLS ${preview.tong_canlamsang} + Thuốc ${preview.tong_thuoc} + Khám ${preview.tien_kham}`;
  const danhsachdichvu = formatHoSoDichVuDescription(preview.mahosokham, human);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ins = await client.query(
      `
      INSERT INTO hoadonthanhtoan (
        mabenhnhan, danhsachdichvu, sotienbaohiemchitra, thuctracuabenhnhan, tongtien
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [preview.mabenhnhan, danhsachdichvu, bh, advance, preview.tongtien]
    );
    const row = ins.rows[0];
    const chidinh = await client.query(
      `
      SELECT c.madichvu, cl.gia::numeric AS gia
      FROM chidinhcanlamsang c
      JOIN canlamsang cl ON c.madichvu = cl.madichvu
      WHERE c.mahosokham = $1
      `,
      [preview.mahosokham]
    );
    for (const c of chidinh.rows) {
      const g = roundVnd(c.gia);
      await client.query(
        `
        INSERT INTO hoadon_dichvu (mahoadon, madichvu, soluong, dongia, thanhtien)
        VALUES ($1, $2, 1, $3, $4)
        `,
        [row.mahoadon, c.madichvu, g, g]
      );
    }
    await client.query("COMMIT");
    return await getById(row.mahoadon);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
