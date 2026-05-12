import * as DKHKService from "../services/dangkyhenkham.service.js";

export const getAllDKHK = async (req, res) => {
  try {
    const data = await DKHKService.getAllDKHK();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDKHKById = async (req, res) => {
  try {
    const data = await DKHKService.getDKHKById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createDKHK = async (req, res) => {
  try {
    const data = await DKHKService.createDKHK(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDKHK = async (req, res) => {
  try {
    const data = await DKHKService.updateDKHK(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDKHK = async (req, res) => {
  try {
    const data = await DKHKService.deleteDKHK(req.params.id);
    res.json({
      message: "Xóa phiếu đăng ký thành công",
      data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};