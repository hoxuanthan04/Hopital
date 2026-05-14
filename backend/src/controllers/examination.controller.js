import * as ExaminationService from "../services/examination.service.js";

export const session = async (req, res) => {
  try {
    const maluotkham = req.query.maluotkham;
    const data = await ExaminationService.getSession(Number(maluotkham));
    res.json(data);
  } catch (error) {
    const code = error.message.includes("Không tìm") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const postChidinh = async (req, res) => {
  try {
    const { mahosokham, madichvu, bacsichidinh, maluotkham } = req.body;
    const row = await ExaminationService.addChidinh({
      mahosokham,
      madichvu,
      bacsichidinh,
      maluotkham,
    });
    let sess = null;
    if (maluotkham != null) {
      sess = await ExaminationService.getSession(Number(maluotkham));
    }
    res.status(201).json({ chidinh: row, session: sess });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteChidinh = async (req, res) => {
  try {
    await ExaminationService.deleteChidinh(req.params.id);
    res.json({ message: "Đã xóa chỉ định" });
  } catch (error) {
    const code = error.message.includes("Không tìm") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const patchChidinhHoanThanh = async (req, res) => {
  try {
    const row = await ExaminationService.markChidinhHoanThanh(req.params.id);
    res.json(row);
  } catch (error) {
    const code = error.message.includes("Không tìm") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const patchChidinhKetQua = async (req, res) => {
  try {
    const row = await ExaminationService.saveChidinhKetQua({
      machidinh: req.params.id,
      ...req.body,
    });
    res.json(row);
  } catch (error) {
    const code = error.message.includes("Không tìm") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const getChidinhByPhong = async (req, res) => {
  try {
    const data = await ExaminationService.listChidinhByPhong(req.params.maphong);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const patchChidinhDangThucHien = async (req, res) => {
  try {
    const row = await ExaminationService.markChidinhDangThucHien(req.params.id);
    res.json(row);
  } catch (error) {
    const code = error.message.includes("Không tìm") ? 404 : 400;
    res.status(code).json({ message: error.message });
  }
};

export const postStartCls = async (req, res) => {
  try {
    const data = await ExaminationService.startChidinhExecution(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const postComplete = async (req, res) => {
  try {
    const data = await ExaminationService.completeExamination(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
