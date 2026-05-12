import express from "express";
import {
  getAllDKHK,
  getDKHKById,
  createDKHK,
  updateDKHK,
  deleteDKHK
} from "../controllers/dangkyhenkham.controller.js";

const router = express.Router();

router.get("/", getAllDKHK);
router.get("/:id", getDKHKById);
router.post("/", createDKHK);
router.put("/:id", updateDKHK);
router.delete("/:id", deleteDKHK);

export default router;