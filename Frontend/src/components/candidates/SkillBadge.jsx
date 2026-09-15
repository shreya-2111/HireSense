import React from 'react';
import { Check, AlertCircle, Sparkles, Link2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SkillBadge({
  name,
  type = 'matched', // 'matched' | 'direct' | 'inferred' | 'related' | 'missing'
  size = 'sm',
  evidence,
  confidence,
  relationship,
  className
}) {
  const isDirect = type === 'matched' || type === 'direct';
  const isInferred = type === 'inferred';
  const isRelated = type === 'related';
  const isMissing = type === 'missing';

  let badgeStyles = "bg-slate-100 text-slate-600 border-slate-200";
  let icon = <AlertCircle className={cn("shrink-0 text-slate-400", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />;

  if (isDirect) {
    badgeStyles = "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    icon = <Check className={cn("shrink-0 text-emerald-600", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />;
  } else if (isInferred) {
    badgeStyles = "bg-blue-50 text-blue-800 border-blue-200";
    icon = <Sparkles className={cn("shrink-0 text-blue-600", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />;
  } else if (isRelated) {
    badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
    icon = <Link2 className={cn("shrink-0 text-amber-600", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />;
  } else if (isMissing) {
    badgeStyles = "bg-rose-50/70 text-rose-700 border-rose-200";
    icon = <X className={cn("shrink-0 text-rose-500", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5")} />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors select-none",
        badgeStyles,
        size === 'sm' ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      title={evidence ? `${name} (Evidence: ${evidence}${confidence ? ` • ${confidence}%` : ''})` : name}
    >
      {icon}
      <span>{name}</span>
      {evidence && (
        <span className={cn(
          "font-normal opacity-85 ml-0.5 px-1 rounded",
          isInferred ? "bg-blue-100/80 text-blue-900" : isRelated ? "bg-amber-100/80 text-amber-900" : "bg-black/5"
        )}>
          via {evidence}
        </span>
      )}
      {confidence && (
        <span className="text-[9px] font-semibold opacity-75">
          {confidence}%
        </span>
      )}
    </span>
  );
}
