import * as VattuService from "../services/vattu.service.js";

export const getAllVattu = async (req, res) => {
  try {
    const { loaivattu } = req.query;
    const data =
      loaivattu != null && String(loaivattu).trim() !== ""
        ? await VattuService.getByLoaiVattu(String(loaivattu).trim())
        : await VattuService.getAllVattu();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVattuById = async (req, res) => {
  try {
    const data = await VattuService.getVattuById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createVattu = async (req, res) => {
  try {
    const data = await VattuService.createVattu(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVattu = async (req, res) => {
  try {
    const data = await VattuService.updateVattu(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVattu = async (req, res) => {
  try {
    const data = await VattuService.deleteVattu(req.params.id);
    res.json({ message: "Xóa vật tư thành công", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};