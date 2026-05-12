/**
 * Chat hỗ trợ khách qua Google Gemini — chỉ thông tin bệnh viện / dịch vụ, không tư vấn y khoa.
 * Biến môi trường: GEMINI_API_KEY (bắt buộc), GEMINI_MODEL (tùy chọn, mặc định gemini-2.0-flash).
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

/** Prompt hệ thống: phạm vi + an toàn + giọng điệu (tiếng Việt). */
const SYSTEM_INSTRUCTION = `Bạn là trợ lý ảo trên website của một bệnh viện đa khoa (thương hiệu có thể được gọi là TTH / JHC — dùng ngữ cảnh người dùng).

NHIỆM VỤ (ĐƯỢC PHÉP):
- Trả lời ngắn gọn, lịch sự, bằng tiếng Việt về các chủ đề LIÊN QUAN TỔ CHỨC BỆNH VIỆN: giờ làm việc, địa chỉ/liên hệ chung, hướng dẫn đặt lịch khám qua website, các khoa/chuyên khoa và dịch vụ THEO KIỂU GIỚI THIỆU (không mô tả điều trị), quy trình tiếp nhận, thanh toán/BHYT ở mức thông tin chung, FAQ vận hành bệnh viện.

TUYỆT ĐỐI CẤM (PHẢI TỪ CHỐI LỊCH SỰ):
- Chẩn đoán, đánh giá triệu chứng, đọc xét nghiệm, kê đơn thuốc, liều dùng, hướng dẫn điều trị, so sánh phác đồ, dự đoán bệnh.
- Bất kỳ nội dung nào thay thế bác sĩ khám trực tiếp.

KHI NGƯỜI DÙNG HỎI CHUYÊN MÔN Y TẾ HOẶC TÌNH HUỐNG CÁ NHÂN:
- Không đưa ý kiến y khoa. Hãy nói rõ bạn chỉ hỗ trợ thông tin bệnh viện; khuyến nghị đặt lịch khám hoặc liên hệ cấp cứu 115 nếu cấp bách.

PHONG CÁCH:
- 2–6 câu cho mỗi lần trả lời trừ khi người dùng yêu cầu chi tiết hành chính.
- Không bịa đặt số điện thoại/giờ cụ thể nếu không được cung cấp trong hội thoại; có thể nói "vui lòng xem trang Liên hệ / Đặt lịch trên website" hoặc hướng dẫn tìm trên site.`;

function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

function getApiKey() {
  const k = process.env.GEMINI_API_KEY;
  return k && String(k).trim() ? String(k).trim() : null;
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

/** Bỏ các lượt "model" ở đầu để contents bắt đầu bằng user (theo khuyến nghị API). */
function stripLeadingModelTurns(contents) {
  const out = [...contents];
  while (out.length > 0 && out[0].role === "model") {
    out.shift();
  }
  return out;
}

/**
 * @param {{ role: 'user'|'model', text: string }[]} messages — lịch sử hội thoại (đã gồm tin nhắn user mới nhất).
 */
export async function generateHospitalAssistantReply(messages) {
  const key = getApiKey();
  if (!key) {
    throw new Error("Chưa cấu hình GEMINI_API_KEY trên server.");
  }

  const raw = Array.isArray(messages) ? messages : [];
  const trimmed = raw
    .filter((m) => m && (m.role === "user" || m.role === "model") && String(m.text || "").trim())
    .slice(-20)
    .map((m) => ({
      role: m.role,
      parts: [{ text: String(m.text).slice(0, 8000) }],
    }));

  const contents = stripLeadingModelTurns(trimmed);
  if (contents.length === 0) {
    throw new Error("Không có nội dung hợp lệ để gửi Gemini.");
  }

  const model = getModel().replace(/[^a-zA-Z0-9_.-]/g, "");
  const url = `${GEMINI_ENDPOINT}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 768,
        topP: 0.9,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini lỗi HTTP ${res.status}`;
    throw new Error(msg);
  }

  const cand = data.candidates?.[0];
  const text = cand?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n")?.trim();
  if (text) {
    return { text };
  }

  const fr = cand?.finishReason;
  if (fr === "SAFETY" || fr === "BLOCKLIST") {
    throw new Error("Nội dung không được phép hiển thị theo chính sách an toàn. Vui lòng đặt câu hỏi khác về thông tin bệnh viện.");
  }
  throw new Error("Không nhận được phản hồi từ Gemini. Thử lại sau.");
}
