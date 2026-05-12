import express from "express";
import {
  getAllChuyenKhoa,
  getChuyenKhoaById,
  createChuyenKhoa,
  updateChuyenKhoa,
  deleteChuyenKhoa
} from "../controllers/chuyenkhoa.controller.js";

const router = express.Router();

router.get("/", getAllChuyenKhoa);
router.get("/:id", getChuyenKhoaById);
router.post("/", createChuyenKhoa);
router.put("/:id", updateChuyenKhoa);
router.delete("/:id", deleteChuyenKhoa);

export default router;