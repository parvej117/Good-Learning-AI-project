import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
        };

        const bg = {
          success: 'bg-white border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/5',
          error: 'bg-white border-rose-200 text-slate-800 shadow-lg shadow-rose-500/5',
          warning: 'bg-white border-amber-200 text-slate-800 shadow-lg shadow-amber-500/5',
          info: 'bg-white border-blue-200 text-slate-800 shadow-lg shadow-blue-500/5',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium ${bg[toast.type]} transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            {icons[toast.type]}
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
