import React from 'react';
import { cn } from '../../utils/cn';

export function Avatar({
  initials,
  src,
  alt = '',
  size = 'md',
  status,
  className,
}) {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-semibold",
    xl: "w-16 h-16 text-lg font-bold",
  };

  const statusColors = {
    online: "bg-emerald-500",
    busy: "bg-amber-500",
    offline: "bg-slate-300",
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-slate-100 text-slate-700 font-medium border border-slate-200 overflow-hidden select-none",
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials || 'U'}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white",
            statusColors[status] || "bg-slate-400"
          )}
        />
      )}
    </div>
  );
}
