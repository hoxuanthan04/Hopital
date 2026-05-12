import * as LichLamViecService from "../services/lichlamviec.service.js";

/** GET /api/lichlamviec/ca-nhan?manhanvien=&tungay=&denngay= */
export const getCaNhan = async (req, res) => {
  try {
    const { manhanvien, tungay, denngay } = req.query;
    if (
      manhanvien == null ||
      typeof tungay !== "string" ||
      typeof denngay !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu manhanvien, tungay hoặc denngay (YYYY-MM-DD)" });
    }
    const mid = Number(manhanvien);
    if (!Number.isFinite(mid) || mid <= 0) {
      return res.status(400).json({ message: "manhanvien không hợp lệ" });
    }
    const data = await LichLamViecService.listByNhanVienBetween(
      mid,
      tungay,
      denngay
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByNgay = async (req, res) => {
  try {
    const { ngay } = req.query;
    if (!ngay || typeof ngay !== "string") {
      return res.status(400).json({ message: "Thiếu hoặc sai tham số ngay (YYYY-MM-DD)" });
    }
    const data = await LichLamViecService.listByNgay(ngay);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await LichLamViecService.getById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { manhanvien, maphong, calam, ngay, ghichu } = req.body;
    if (manhanvien == null || maphong == null || !calam || !ngay) {
      return res.status(400).json({
        message: "Thiếu dữ liệu: manhanvien, maphong, calam, ngay là bắt buộc",
      });
    }
    const data = await LichLamViecService.create({
      manhanvien: Number(manhanvien),
      maphong: Number(maphong),
      calam: String(calam).trim().slice(0, 50),
      ngay: String(ngay),
      ghichu: ghichu != null ? String(ghichu).slice(0, 200) : null,
    });
    const full = await LichLamViecService.getById(data.id);
    res.status(201).json(full);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { manhanvien, maphong, calam, ngay, ghichu } = req.body;
    if (manhanvien == null || maphong == null || !calam || !ngay) {
      return res.status(400).json({
        message: "Thiếu dữ liệu: manhanvien, maphong, calam, ngay là bắt buộc",
      });
    }
    await LichLamViecService.update(req.params.id, {
      manhanvien: Number(manhanvien),
      maphong: Number(maphong),
      calam: String(calam).trim().slice(0, 50),
      ngay: String(ngay),
      ghichu: ghichu != null ? String(ghichu).slice(0, 200) : null,
    });
    const full = await LichLamViecService.getById(req.params.id);
    res.json(full);
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const data = await LichLamViecService.remove(req.params.id);
    res.json({ message: "Đã xóa lịch làm việc", data });
  } catch (error) {
    const code = error.message.includes("Không tìm thấy") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};
