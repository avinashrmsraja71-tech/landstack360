import React from 'react';
import { X, Bell, Check, ExternalLink, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { useApp, NotificationItem } from '../../context/AppContext';
import { landService } from '../../services/landService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, openParcel360 } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">LandStack Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5 divide-y divide-slate-800/60 text-xs">
          {notifications.map((n) => {
            return (
              <div
                key={n.id}
                className={`pt-2.5 first:pt-0 p-2.5 rounded-lg transition-colors ${
                  n.read ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-800/50 text-slate-200 border border-slate-700/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                  {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                  {n.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1">{n.message}</p>

                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
                      {n.parcelId ? (
                        <button
                          onClick={() => {
                            const p = landService.getParcelById(n.parcelId!);
                            if (p) {
                              openParcel360(p);
                              onClose();
                            }
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          <span>Inspect {n.parcelId}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span />
                      )}

                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-500">
          Integrated Digital Public Infrastructure Event Dispatcher • Real-Time Webhooks
        </div>
      </div>
    </div>
  );
};
