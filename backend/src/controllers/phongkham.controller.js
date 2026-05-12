import * as PhongKhamService from "../services/phongkham.service.js";

export const getAllPhongKham = async (req, res) => {
  try {
    const data = await PhongKhamService.getAllPhongKham();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPhongKhamById = async (req, res) => {
  try {
    const data = await PhongKhamService.getPhongKhamById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPhongKhamByMamayPhong = async (req, res) => {
  try {
    const raw = req.params.code ?? "";
    const code = decodeURIComponent(String(raw));
    if (!code.trim()) {
      return res.status(400).json({ message: "Thiếu mã máy" });
    }
    const data = await PhongKhamService.getPhongKhamByMamayPhong(code.trim());
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPhongKham = async (req, res) => {
  try {
    const data = await PhongKhamService.createPhongKham(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePhongKham = async (req, res) => {
  try {
    const data = await PhongKhamService.updatePhongKham(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePhongKham = async (req, res) => {
  try {
    const data = await PhongKhamService.deletePhongKham(req.params.id);
    res.json({
      message: "Xóa phòng khám thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};