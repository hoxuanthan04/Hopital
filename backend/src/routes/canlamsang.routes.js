import express from "express";
import {
  getAllCanLamSang,
  getCanLamSangById,
  createCanLamSang,
  updateCanLamSang,
  deleteCanLamSang
} from "../controllers/canlamsang.controller.js";

const router = express.Router();

router.get("/", getAllCanLamSang);
router.get("/:id", getCanLamSangById);
router.post("/", createCanLamSang);
router.put("/:id", updateCanLamSang);
router.delete("/:id", deleteCanLamSang);

export default router;