import * as HoaDonService from "../services/hoadon.service.js";
import * as PayosService from "../services/payos.service.js";

export const list = async (req, res) => {
  try {
    const rows = await HoaDonService.list();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await HoaDonService.getById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getChiTiet = async (req, res) => {
  try {
    const rows = await HoaDonService.getChiTiet(req.params.id);
    res.json(rows);
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 500;
    res.status(code).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      mabenhnhan,
      danhsachdichvu,
      sotienbaohiemchitra,
      thuctracuabenhnhan,
      tongtien,
    } = req.body;
    if (mabenhnhan == null || tongtien == null) {
      return res.status(400).json({ message: "Thiếu mabenhnhan hoặc tongtien" });
    }
    const row = await HoaDonService.create({
      mabenhnhan: Number(mabenhnhan),
      danhsachdichvu: danhsachdichvu != null ? String(danhsachdichvu) : "",
      sotienbaohiemchitra: Number(sotienbaohiemchitra ?? 0),
      thuctracuabenhnhan: Number(thuctracuabenhnhan ?? 0),
      tongtien: Number(tongtien),
    });
    const full = await HoaDonService.getById(row.mahoadon);
    if (HoaDonService.isInvoiceFullyPaid(full)) {
      await HoaDonService.syncHoSoAfterInvoicePaid(full);
    }
    res.status(201).json(full);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const {
      mabenhnhan,
      danhsachdichvu,
      sotienbaohiemchitra,
      thuctracuabenhnhan,
      tongtien,
    } = req.body;
    if (mabenhnhan == null || tongtien == null) {
      return res.status(400).json({ message: "Thiếu mabenhnhan hoặc tongtien" });
    }
    await HoaDonService.update(req.params.id, {
      mabenhnhan: Number(mabenhnhan),
      danhsachdichvu: danhsachdichvu != null ? String(danhsachdichvu) : "",
      sotienbaohiemchitra: Number(sotienbaohiemchitra ?? 0),
      thuctracuabenhnhan: Number(thuctracuabenhnhan ?? 0),
      tongtien: Number(tongtien),
    });
    const full = await HoaDonService.getById(req.params.id);
    if (HoaDonService.isInvoiceFullyPaid(full)) {
      await HoaDonService.syncHoSoAfterInvoicePaid(full);
    }
    res.json(full);
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const data = await HoaDonService.remove(req.params.id);
    res.json({ message: "Đã xóa hóa đơn", data });
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const listHosoChoThanhToan = async (req, res) => {
  try {
    const rows = await HoaDonService.listHosoChoThanhToan();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const previewHoSoInvoice = async (req, res) => {
  try {
    const data = await HoaDonService.previewInvoiceFromHoSo(req.params.mahosokham);
    res.json(data);
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const createFromHoSo = async (req, res) => {
  try {
    const { mahosokham, sotienbaohiemchitra, tamung } = req.body;
    if (mahosokham == null) {
      return res.status(400).json({ message: "Thiếu mahosokham" });
    }
    const full = await HoaDonService.createFromHoSo({
      mahosokham,
      sotienbaohiemchitra: sotienbaohiemchitra ?? 0,
      tamung: tamung ?? 0,
    });
    res.status(201).json(full);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/** POST /api/hoadon/:id/payos-link — tạo link thanh toán PayOS (số tiền còn lại BN phải trả). */
export const createPayosLink = async (req, res) => {
  try {
    if (!PayosService.isPayOSConfigured()) {
      return res.status(503).json({
        message:
          "PayOS chưa cấu hình. Thêm PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY vào .env backend.",
      });
    }
    const link = await PayosService.createPaymentLinkForInvoice(req.params.id);
    res.json(link);
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes("Không tìm thấy")) {
      return res.status(404).json({ message: msg });
    }
    res.status(400).json({ message: msg });
  }
};
