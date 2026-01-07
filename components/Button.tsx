import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-interactive';

  const variantStyles = {
    primary: 'bg-clay text-white hover:bg-clay-dark shadow-soft hover:shadow-card',
    secondary: 'bg-sage text-white hover:bg-sage-dark shadow-soft hover:shadow-card',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft',
    ghost: 'bg-transparent text-warm-700 hover:bg-warm-100',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
