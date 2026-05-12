
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import NotificationPopover from './NotificationPopover';
import * as ThongBaoApi from '../../services/thongbao.service';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const c = await ThongBaoApi.getUnreadCount();
      setUnreadCount(Number.isFinite(c) ? c : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const onUpd = () => void refreshUnread();
    window.addEventListener('thongbao:updated', onUpd);
    return () => window.removeEventListener('thongbao:updated', onUpd);
  }, [refreshUnread]);
  
  const getTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 relative z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="pl-10 pr-4 py-2 rounded bg-white border border-slate-200 focus:bg-white outline-none w-64 transition-all"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen((v) => !v);
              void refreshUnread();
            }}
            className={`p-2 transition-all shadow-sm rounded relative ${
              isNotifOpen ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-white text-slate-400 hover:text-blue-500'
            }`}
            aria-label="Thông báo"
          >
            <Bell size={22} />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          <NotificationPopover isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Hồ Xuân Thân</p>
            <p className="text-xs text-slate-500">Lễ tân</p>
          </div>
          <img 
            src="https://picsum.photos/seed/admin/40/40" 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
