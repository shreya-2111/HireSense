import React from 'react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-blue-50 text-blue-600',
  trend,
  className,
}) {
  return (
    <Card className={cn("p-5 flex items-start justify-between relative overflow-hidden", className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
          {trend && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>

      {Icon && (
        <div className={cn("p-2.5 rounded-xl border border-slate-100 shrink-0", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </Card>
  );
}
