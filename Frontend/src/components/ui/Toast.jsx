import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useRecruitment } from '../../context/RecruitmentContext';

export function ToastContainer() {
  const { toasts, removeToast } = useRecruitment();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-xl shadow-lg border border-slate-200 transition-all duration-200 animate-in slide-in-from-bottom-3",
            toast.type === 'success' && "border-emerald-200 bg-emerald-50/20",
            toast.type === 'warning' && "border-amber-200 bg-amber-50/20",
            toast.type === 'error' && "border-red-200 bg-red-50/20"
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
          {(!toast.type || toast.type === 'info') && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs text-slate-800 font-medium leading-relaxed">
            {toast.message}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
