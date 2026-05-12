import express from "express";
import {
  getAllPhongKham,
  getPhongKhamById,
  getPhongKhamByMamayPhong,
  createPhongKham,
  updatePhongKham,
  deletePhongKham
} from "../controllers/phongkham.controller.js";

const router = express.Router();

router.get("/", getAllPhongKham);
router.get("/by-machine/:code", getPhongKhamByMamayPhong);
router.get("/:id", getPhongKhamById);
router.post("/", createPhongKham);
router.put("/:id", updatePhongKham);
router.delete("/:id", deletePhongKham);

export default router;