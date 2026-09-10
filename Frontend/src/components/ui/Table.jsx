import React from 'react';
import { cn } from '../../utils/cn';

export function Table({ children, className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-left border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn("bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn("divide-y divide-slate-100 bg-white", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, isClickable = false, ...props }) {
  return (
    <tr
      className={cn(
        "transition-colors duration-100",
        isClickable ? "hover:bg-blue-50/40 cursor-pointer" : "hover:bg-slate-50/60",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th className={cn("px-4 py-3 text-left font-semibold text-slate-600 tracking-wider whitespace-nowrap", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn("px-4 py-3.5 text-slate-700 whitespace-nowrap align-middle", className)} {...props}>
      {children}
    </td>
  );
}
