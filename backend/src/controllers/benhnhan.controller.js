import * as BenhNhanService from "../services/benhnhan.service.js";

export const getAllBenhNhan = async (req, res) => {
  try {
    const data = await BenhNhanService.getAllBenhNhan();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBenhNhanById = async (req, res) => {
  try {
    const data = await BenhNhanService.getBenhNhanById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/** GET /api/benhnhan/lookup/cccd?q=... — trả về bản ghi bệnh nhân hoặc 404. */
export const lookupBenhNhanByCccd = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      return res.status(400).json({ message: "Vui lòng nhập số CCCD." });
    }
    const data = await BenhNhanService.getBenhNhanBySocccd(q);
    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy bệnh nhân với số CCCD này." });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET /api/benhnhan/lookup/dienthoai?q=...&exclude=mabenhnhan — SĐT đã dùng cho BN khác? */
export const lookupDienthoaiInUse = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      return res.status(400).json({ message: "Thiếu số điện thoại." });
    }
    const ex = req.query.exclude;
    const exclude =
      ex != null && ex !== "" && Number.isFinite(Number(ex)) ? Number(ex) : null;
    const row = await BenhNhanService.findBenhNhanByDienthoai(q, exclude);
    res.json({ inUse: !!row });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBenhNhan = async (req, res) => {
  try {
    const data = await BenhNhanService.createBenhNhan(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBenhNhan = async (req, res) => {
  try {
    const data = await BenhNhanService.updateBenhNhan(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBenhNhan = async (req, res) => {
  try {
    const data = await BenhNhanService.deleteBenhNhan(req.params.id);
    res.json({
      message: "Xóa thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};