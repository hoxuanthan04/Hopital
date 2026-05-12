import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-fade';

const DASHBOARD_IMAGES = [
  'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1920',
];

const Dashboard: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-160px)] overflow-hidden rounded shadow-2xl bg-slate-900">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {DASHBOARD_IMAGES.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <img 
                src={img} 
                alt="Hospital Background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 animate-bounce">
          <MapPin size={16} className="text-emerald-400" />
          <span className="text-xs font-bold tracking-widest uppercase">Hệ thống Y tế TTH Hopital</span>
        </div>
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter drop-shadow-2xl">
            {formatTime(time)}
          </h1>
          <div className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm" />
        </div>

        {/* Hiển thị NGÀY */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-xl md:text-2xl font-medium text-slate-200">
            <CalendarIcon size={24} className="text-emerald-400" />
            {formatDate(time)}
          </div>
          <p className="text-slate-400 font-light tracking-[0.2em] uppercase text-sm mt-2">
            Chào mừng bạn trở lại phiên làm việc
          </p>
        </div>

        {/* Các thẻ chỉ số nhanh (Quick Stats overlay) */}
        <div className="absolute bottom-10 left-10 right-10 flex flex-wrap justify-center gap-6 pointer-events-auto">
          {[
            { label: 'Bệnh nhân mới', value: '+12', icon: <Clock size={18}/> },
            { label: 'Ca trực hiện tại', value: 'Khu A - Tầng 2', icon: <MapPin size={18}/> },
            { label: 'Trạng thái hệ thống', value: 'Ổn định', icon: <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> }
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded flex items-center gap-4 hover:bg-white/10 transition-all cursor-default">
              <div className="text-emerald-400">{item.icon}</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                <p className="text-sm font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;