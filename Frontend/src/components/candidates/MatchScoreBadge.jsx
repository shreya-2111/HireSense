import React from 'react';
import { cn, formatScore } from '../../utils/cn';

export function MatchScoreBadge({ score = 0, showScoreNumber = true, size = 'md' }) {
  const { label, color } = formatScore(score);

  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    blue: "bg-blue-50 text-blue-700 border-blue-200/90",
    amber: "bg-amber-50 text-amber-700 border-amber-200/90",
    slate: "bg-slate-100 text-slate-700 border-slate-200/90",
  };

  const dotColors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    slate: "bg-slate-400",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
    lg: "text-sm px-3 py-1.5 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shadow-2xs whitespace-nowrap",
        colorStyles[color],
        sizes[size]
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[color])} />
      {showScoreNumber && <span>{score}%</span>}
      <span>{label}</span>
    </span>
  );
}
