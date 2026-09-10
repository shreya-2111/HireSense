import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SkillBadge({ name, type = 'matched', size = 'sm', className }) {
  const isMatched = type === 'matched';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium transition-colors select-none",
        isMatched
          ? "bg-emerald-50 text-emerald-800 border-emerald-200/90"
          : "bg-slate-100 text-slate-600 border-slate-200",
        size === 'sm' ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      {isMatched ? (
        <Check className={cn("shrink-0 text-emerald-600", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />
      ) : (
        <AlertCircle className={cn("shrink-0 text-slate-400", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />
      )}
      <span>{name}</span>
    </span>
  );
}
