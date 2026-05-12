import * as LuotKhamService from "../services/luotkham.service.js";

export const getAllLuotKham = async (req, res) => {
  try {
    const data = await LuotKhamService.getAllLuotKham();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hàm lấy theo phòng
export const getLuotKhamByPhong = async (req, res) => {
  try {
    const { maphong } = req.params;
    const data = await LuotKhamService.getLuotKhamByPhong(maphong);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLuotKhamById = async (req, res) => {
  try {
    const data = await LuotKhamService.getLuotKhamById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createLuotKham = async (req, res) => {
  try {
    const data = await LuotKhamService.registerVisit(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLuotKham = async (req, res) => {
  try {
    const data = await LuotKhamService.updateLuotKham(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLuotKham = async (req, res) => {
  try {
    await LuotKhamService.deleteLuotKham(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};