import express from "express";
import {
  getCaNhan,
  getByNgay,
  getById,
  create,
  update,
  remove,
} from "../controllers/lichlamviec.controller.js";

const router = express.Router();

router.get("/ca-nhan", getCaNhan);
router.get("/", getByNgay);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
