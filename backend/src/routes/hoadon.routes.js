import express from "express";
import {
  list,
  getById,
  getChiTiet,
  create,
  update,
  remove,
  createPayosLink,
  listHosoChoThanhToan,
  previewHoSoInvoice,
  createFromHoSo,
} from "../controllers/hoadon.controller.js";

const router = express.Router();

router.get("/", list);
router.get("/hoso-cho-thanh-toan", listHosoChoThanhToan);
router.get("/preview-hoso/:mahosokham", previewHoSoInvoice);
router.post("/from-hoso", createFromHoSo);
router.post("/", create);
router.post("/:id/payos-link", createPayosLink);
router.get("/:id/chitiet", getChiTiet);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
