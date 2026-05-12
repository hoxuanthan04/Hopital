import * as TaiKhoanService from "../services/taikhoan.service.js";


export const login = async (req, res) => {
  try {
    const { tentaikhoan, matkhau } = req.body;

    if (!tentaikhoan || !matkhau) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const result = await TaiKhoanService.login(tentaikhoan, matkhau);

    // Lưu token vào cookie hoặc trả về json để frontend lưu localStorage
    res.status(200).json({
      message: "Đăng nhập thành công",
      ...result
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};




export const getAccounts = async (req, res) => {
  try {
    const data = await TaiKhoanService.getAllAccounts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const softDeleteAccount = async (req, res) => {
  try {
    const data = await TaiKhoanService.deleteAccount(req.params.id);
    res.json({ message: "Đã chuyển tài khoản vào thùng rác", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangthai, currentStatus, actorId } = req.body;
    const status = trangthai ?? currentStatus;
    if (status === undefined || status === null || status === "") {
      return res.status(400).json({ message: "Thiếu trạng thái hiện tại của tài khoản." });
    }
    const data = await TaiKhoanService.handleToggleStatus(id, status, actorId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const changeAccountRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { loaitaikhoan } = req.body;
    const data = await TaiKhoanService.handleChangeRole(id, loaitaikhoan);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { tentaikhoan, matkhau, manguoidung, loaitaikhoan } = req.body;

    // Validation cơ bản
    if (!tentaikhoan || !matkhau || !manguoidung) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    const result = await TaiKhoanService.createAccount({
      tentaikhoan,
      matkhau,
      manguoidung,
      loaitaikhoan
    });

    res.status(201).json({
      message: "Cấp tài khoản thành công",
      data: result
    });
  } catch (error) {
    res.status(400).json({ 
      message: error.message || "Lỗi khi cấp tài khoản" 
    });
  }
};