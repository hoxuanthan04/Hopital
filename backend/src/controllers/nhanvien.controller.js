import * as NhanVienService from "../services/nhanvien.service.js";

export const getAllNhanVien = async (req, res) => {
  try {
    const data = await NhanVienService.getAllNhanVien();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNhanVienById = async (req, res) => {
  try {
    const data = await NhanVienService.getNhanVienById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createNhanVien = async (req, res) => {
  try {
    const data = await NhanVienService.createNhanVien(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateNhanVien = async (req, res) => {
  try {
    const data = await NhanVienService.updateNhanVien(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNhanVien = async (req, res) => {
  try {
    const data = await NhanVienService.deleteNhanVien(req.params.id);
    res.json({
      message: "Xóa nhân viên thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEmployeesWithoutAccount = async (req, res) => {
  try {
    const employees = await NhanVienService.getEmployeesWithoutAccount();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ 
      message: "Lỗi server khi lấy danh sách nhân viên", 
      error: error.message 
    });
  }
};