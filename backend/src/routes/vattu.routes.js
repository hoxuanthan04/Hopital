import express from "express";
import {
  getAllVattu,
  getVattuById,
  createVattu,
  updateVattu,
  deleteVattu
} from "../controllers/vattu.controller.js";

const router = express.Router();

router.get("/", getAllVattu);
router.get("/:id", getVattuById);
router.post("/", createVattu);
router.put("/:id", updateVattu);
router.delete("/:id", deleteVattu);

export default router;