import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'Try adjusting your search criteria or add new items.',
  actionText,
  onAction,
  actionIcon,
  className,
}) {
  return (
    <div className={cn("text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-2", className)}>
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5 border border-slate-200/80">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="outline" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
