import express from "express";
import {
  session,
  postChidinh,
  deleteChidinh,
  patchChidinhHoanThanh,
  postComplete,
} from "../controllers/examination.controller.js";

const router = express.Router();

router.get("/session", session);
router.post("/chidinh", postChidinh);
router.delete("/chidinh/:id", deleteChidinh);
router.patch("/chidinh/:id/hoanthanh", patchChidinhHoanThanh);
router.post("/complete", postComplete);

export default router;
