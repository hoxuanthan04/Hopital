import express from "express";
import { postGeminiChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/gemini", postGeminiChat);

export default router;
