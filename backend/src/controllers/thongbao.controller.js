import * as ThongBaoService from "../services/thongbao.service.js";

export const create = async (req, res) => {
  try {
    const nguoi_tao = req.user?.id;
    const { tieu_de, noi_dung, doi_tuong } = req.body;
    const out = await ThongBaoService.createThongBaoByAdmin(nguoi_tao, {
      tieu_de,
      noi_dung,
      doi_tuong,
    });
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ message: e.message || "Không tạo được thông báo." });
  }
};

export const listMine = async (req, res) => {
  try {
    const mid = Number(req.user?.id);
    if (!Number.isFinite(mid)) {
      return res.status(400).json({ message: "Token không có mã tài khoản." });
    }
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const rows = await ThongBaoService.listMine(mid, { limit, offset });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const unreadCount = async (req, res) => {
  try {
    const mid = Number(req.user?.id);
    if (!Number.isFinite(mid)) {
      return res.status(400).json({ message: "Token không có mã tài khoản." });
    }
    const c = await ThongBaoService.unreadCount(mid);
    res.json({ count: c });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const mid = Number(req.user?.id);
    const tid = Number(req.params.id);
    if (!Number.isFinite(mid) || !Number.isFinite(tid)) {
      return res.status(400).json({ message: "Tham số không hợp lệ." });
    }
    const row = await ThongBaoService.markRead(mid, tid);
    if (!row) {
      return res.status(404).json({ message: "Không tìm thấy thông báo hoặc đã đọc." });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const mid = Number(req.user?.id);
    if (!Number.isFinite(mid)) {
      return res.status(400).json({ message: "Token không có mã tài khoản." });
    }
    const n = await ThongBaoService.markAllRead(mid);
    res.json({ ok: true, updated: n });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const listAllAdmin = async (req, res) => {
  try {
    const limit = Number(req.query.limit);
    const rows = await ThongBaoService.listAllAdmin(limit);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
