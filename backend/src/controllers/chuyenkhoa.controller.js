import * as ChuyenKhoaService from "../services/chuyenkhoa.service.js";

export const getAllChuyenKhoa = async (req, res) => {
  try {
    const data = await ChuyenKhoaService.getAllChuyenKhoa();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChuyenKhoaById = async (req, res) => {
  try {
    const data = await ChuyenKhoaService.getChuyenKhoaById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createChuyenKhoa = async (req, res) => {
  try {
    const data = await ChuyenKhoaService.createChuyenKhoa(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateChuyenKhoa = async (req, res) => {
  try {
    const data = await ChuyenKhoaService.updateChuyenKhoa(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteChuyenKhoa = async (req, res) => {
  try {
    const data = await ChuyenKhoaService.deleteChuyenKhoa(req.params.id);
    res.json({
      message: "Xóa chuyên khoa thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};