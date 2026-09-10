import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-300 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    dangerOutline: "bg-white hover:bg-red-50 text-red-600 border border-red-200 focus:ring-red-300",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm",
    successOutline: "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 focus:ring-emerald-300",
    amber: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-sm",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
    icon: "p-2 rounded-lg",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={cn("shrink-0", size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4")} />
      ) : null}

      {children}

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className={cn("shrink-0", size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4")} />
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
