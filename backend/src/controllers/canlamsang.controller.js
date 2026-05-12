import * as CanLamSangService from "../services/canlamsang.service.js";

export const getAllCanLamSang = async (req, res) => {
  try {
    const data = await CanLamSangService.getAllCanLamSang();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCanLamSangById = async (req, res) => {
  try {
    const data = await CanLamSangService.getCanLamSangById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createCanLamSang = async (req, res) => {
  try {
    const data = await CanLamSangService.createCanLamSang(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCanLamSang = async (req, res) => {
  try {
    const data = await CanLamSangService.updateCanLamSang(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCanLamSang = async (req, res) => {
  try {
    const data = await CanLamSangService.deleteCanLamSang(req.params.id);
    res.json({
      message: "Xóa dịch vụ cận lâm sàng thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};