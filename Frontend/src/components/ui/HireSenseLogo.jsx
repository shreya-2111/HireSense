import React from 'react';
import logoImg from '../../assets/hiresense-logo.png';
import iconImg from '../../assets/hiresense-icon.png';

export function HireSenseLogo({
  variant = 'full', // 'full' | 'icon'
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  alt = 'HireSense — Hiring with Intelligence'
}) {
  if (variant === 'icon') {
    const sizeMap = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };
    const sizeClass = sizeMap[size] || size;

    return (
      <img
        src={iconImg}
        alt={alt}
        className={`inline-block object-contain select-none shrink-0 ${sizeClass} ${className}`}
        loading="eager"
      />
    );
  }

  // Full Logo variant
  const fullSizeMap = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };
  const fullSizeClass = fullSizeMap[size] || size;

  return (
    <img
      src={logoImg}
      alt={alt}
      className={`inline-block object-contain select-none shrink-0 w-auto ${fullSizeClass} ${className}`}
      loading="eager"
    />
  );
}
