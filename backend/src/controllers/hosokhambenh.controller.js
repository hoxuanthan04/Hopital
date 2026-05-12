import * as HoSoService from "../services/hosokhambenh.service.js";
import * as TaiKhoanModel from "../models/taikhoan.model.js";

async function resolveMabenhnhanClient(req) {
  const mataikhoan = req.user?.id;
  if (mataikhoan == null) {
    return { status: 401, message: "Không xác định được tài khoản." };
  }
  const tk = await TaiKhoanModel.findByMataikhoan(mataikhoan);
  if (!tk) {
    return { status: 403, message: "Tài khoản không tồn tại." };
  }
  if ((tk.loaitaikhoan || "").toLowerCase() !== "client") {
    return { status: 403, message: "Chỉ tài khoản bệnh nhân mới xem được kết quả khám bệnh." };
  }
  const mabenhnhan = tk.manguoidung;
  if (mabenhnhan == null) {
    return { status: 403, message: "Tài khoản chưa gắn mã bệnh nhân." };
  }
  return { mabenhnhan: Number(mabenhnhan) };
}

/** Danh sách hồ sơ đã hoàn tất của bệnh nhân đang đăng nhập (JWT). */
export const getHoSoBenhNhanHoanTat = async (req, res) => {
  try {
    const r = await resolveMabenhnhanClient(req);
    if (r.status) {
      return res.status(r.status).json({ message: r.message });
    }
    const data = await HoSoService.listHoSoHoanTatByMabenhnhan(r.mabenhnhan);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Chi tiết một hồ sơ thuộc đúng bệnh nhân đang đăng nhập. */
export const getHoSoBenhNhanChiTiet = async (req, res) => {
  try {
    const r = await resolveMabenhnhanClient(req);
    if (r.status) {
      return res.status(r.status).json({ message: r.message });
    }
    const mahosokham = Number(req.params.mahosokham);
    if (!Number.isFinite(mahosokham)) {
      return res.status(400).json({ message: "Mã hồ sơ không hợp lệ." });
    }
    const data = await HoSoService.getDetailHoSoForBenhNhan(mahosokham, r.mabenhnhan);
    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllHoSo = async (req, res) => {
  try {
    const data = await HoSoService.getAllHoSo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHoSoById = async (req, res) => {
  try {
    const data = await HoSoService.getHoSoById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createHoSo = async (req, res) => {
  try {
    const data = await HoSoService.createHoSo(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateHoSo = async (req, res) => {
  try {
    const data = await HoSoService.updateHoSo(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHoSo = async (req, res) => {
  try {
    await HoSoService.deleteHoSo(req.params.id);
    res.json({ message: "Xóa hồ sơ khám bệnh thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};