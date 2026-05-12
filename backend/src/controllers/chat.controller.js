import * as GeminiChatService from "../services/geminiChat.service.js";

export const postGeminiChat = async (req, res) => {
  try {
    if (!GeminiChatService.isGeminiConfigured()) {
      return res.status(503).json({
        message:
          "Chat AI chưa được cấu hình. Thêm GEMINI_API_KEY vào .env backend (và tùy chọn GEMINI_MODEL).",
      });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: "Thiếu hoặc sai định dạng messages (mảng)." });
    }

    const normalized = messages
      .filter((m) => m && (m.role === "user" || m.role === "model") && m.text != null)
      .map((m) => ({
        role: m.role,
        text: String(m.text),
      }));

    const { text } = await GeminiChatService.generateHospitalAssistantReply(normalized);
    res.json({ text });
  } catch (error) {
    res.status(400).json({ message: error.message || "Lỗi chat Gemini." });
  }
};
