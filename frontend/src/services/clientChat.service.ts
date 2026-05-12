import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const base = root ? String(root).replace(/\/$/, '') : '';

/**
 * Gửi lịch sử hội thoại tới backend → Gemini (API key chỉ ở server).
 * @param {{ role: 'user' | 'model'; text: string }[]} messages
 */
export async function sendGeminiChat(
  messages: { role: 'user' | 'model'; text: string }[]
): Promise<{ text: string }> {
  const res = await axios.post(`${base}/api/chat/gemini`, { messages }, { timeout: 90000 });
  return res.data;
}
