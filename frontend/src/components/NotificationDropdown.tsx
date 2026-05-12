import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Clock, X, Loader2 } from 'lucide-react';
import * as ThongBaoApi from '../services/thongbao.service';

export type NotificationDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Row = {
  id: number | string;
  tieu_de: string;
  noi_dung: string;
  created_at: string;
  da_doc: boolean;
};

function emitUpdated() {
  window.dispatchEvent(new CustomEvent('thongbao:updated'));
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await ThongBaoApi.listMine({ limit: 50, offset: 0 });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setErr(msg || 'Không tải được thông báo.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void load();
  }, [isOpen, load]);

  const handleMarkAll = async () => {
    try {
      await ThongBaoApi.markAllThongBaoRead();
      emitUpdated();
      await load();
    } catch {
      /* ignore */
    }
  };

  const handleRowOpen = async (row: Row) => {
    setExpanded(expanded === row.id ? null : row.id);
    if (!row.da_doc) {
      try {
        await ThongBaoApi.markThongBaoRead(Number(row.id));
        emitUpdated();
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, da_doc: true, read_at: new Date().toISOString() } : r
          )
        );
      } catch {
        /* ignore */
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose} aria-hidden />
      <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center gap-2">
          <h3 className="font-bold text-slate-800 text-lg">Thông báo</h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleMarkAll()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              Đã đọc tất cả
            </button>
            <button type="button" onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 lg:hidden">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-10 flex justify-center text-slate-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : err ? (
            <div className="p-6 text-sm text-rose-600">{err}</div>
          ) : rows.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {rows.map((notif) => (
                <div key={String(notif.id)}>
                  <button
                    type="button"
                    onClick={() => void handleRowOpen(notif)}
                    className={`w-full text-left p-4 flex gap-4 hover:bg-slate-50 transition-colors group ${
                      !notif.da_doc ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                        !notif.da_doc ? 'bg-white shadow-sm' : 'bg-slate-100'
                      }`}
                    >
                      <Bell size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4
                          className={`text-sm truncate ${
                            !notif.da_doc ? 'font-bold text-slate-800' : 'font-medium text-slate-600'
                          }`}
                        >
                          {notif.tieu_de}
                        </h4>
                        {!notif.da_doc ? <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" /> : null}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">{notif.noi_dung}</p>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        <Clock size={10} />
                        {formatTime(notif.created_at)}
                      </div>
                    </div>
                  </button>
                  {expanded === notif.id ? (
                    <div className="px-4 pb-4 pl-[4.5rem] text-sm text-slate-700 whitespace-pre-wrap border-b border-slate-50 bg-slate-50/50">
                      {notif.noi_dung}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Chưa có thông báo</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <button
            type="button"
            onClick={() => void load()}
            className="w-full py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm"
          >
            Làm mới
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
