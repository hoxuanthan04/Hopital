import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { sendGeminiChat } from '../../services/clientChat.service';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: 'Xin chào! Tôi hỗ trợ thông tin về bệnh viện (đặt lịch, liên hệ, dịch vụ chung). Tôi không tư vấn chẩn đoán hay điều trị y khoa — với vấn đề sức khỏe cá nhân, bạn vui lòng đặt lịch khám hoặc liên hệ cấp cứu 115 nếu cấp bách. Bạn cần hỗ trợ gì?', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      text, 
      sender: 'user',
      timestamp: new Date()
    };

    const nextThread = [...messages, newUserMsg];
    setMessages(nextThread);
    setInputValue('');
    setIsTyping(true);

    try {
      const forApi = nextThread.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));
      const { text: reply } = await sendGeminiChat(forApi);
      const botMsg: Message = {
        id: `${Date.now()}-bot`,
        text: reply || 'Xin lỗi, tôi chưa có phản hồi phù hợp.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([...nextThread, botMsg]);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      const botMsg: Message = {
        id: `${Date.now()}-err`,
        text:
          msg ||
          'Hiện không kết nối được chat AI. Kiểm tra GEMINI_API_KEY trên backend hoặc thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([...nextThread, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4  origin-bottom-right transition-all duration-300">
          {/* Header */}
          <div className="bg-[#0B2046] text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#0084FF] rounded-full flex items-center justify-center">
                  TTH
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0B2046] rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">JHC AI Hỗ trợ</h3>
                <p className="text-blue-200 text-xs">AI giải đáp thắc mắc của bệnh nhân/khách hàng</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-slate-200' : 'bg-[#0084FF]'
                  }`}>
                    {msg.sender === 'user' ? (
                      <User className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#0084FF] text-white rounded-2xl rounded-br-sm' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 mt-1 mx-10">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#0084FF] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#0084FF] text-white p-2.5 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} absolute bottom-0 right-0 flex items-center justify-center w-14 h-14 bg-[#0084FF] text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50`}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
