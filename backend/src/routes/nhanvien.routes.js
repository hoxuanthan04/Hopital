import express from "express";
import {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
  getEmployeesWithoutAccount
} from "../controllers/nhanvien.controller.js";

const router = express.Router();

router.get("/", getAllNhanVien);
router.get("/notaccount", getEmployeesWithoutAccount);
router.get("/:id", getNhanVienById);
router.post("/", createNhanVien);
router.put("/:id", updateNhanVien);
router.delete("/:id", deleteNhanVien);

export default router;