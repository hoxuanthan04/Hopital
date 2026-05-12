import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getAllHoSo,
  getHoSoById,
  createHoSo,
  updateHoSo,
  deleteHoSo,
  getHoSoBenhNhanHoanTat,
  getHoSoBenhNhanChiTiet
} from "../controllers/hosokhambenh.controller.js";

const router = express.Router();

router.get("/benhnhan/ho-so-hoan-tat", verifyToken, getHoSoBenhNhanHoanTat);
router.get("/benhnhan/ho-so/:mahosokham", verifyToken, getHoSoBenhNhanChiTiet);
router.get("/", getAllHoSo);
router.get("/:id", getHoSoById);
router.post("/", createHoSo);
router.put("/:id", updateHoSo);
router.delete("/:id", deleteHoSo);

export default router;