import React from 'react';
import { cn } from '../utils/cn.js';

const buttonVariants = {
  primary: "bg-success text-white hover:bg-success-hover border-transparent",
  secondary: "bg-surface-active text-primary hover:border-default border-transparent",
  outline: "bg-transparent text-success border-success hover:bg-success-soft",
  ghost: "bg-transparent text-secondary hover:bg-surface-active border-transparent",
  black: "bg-primary text-white "
};

const buttonSizes = {
  sm: "h-8 px-3 btn-sm",
  md: "h-10 px-4 btn-md",
  lg: "h-12 px-6 btn-lg"
};

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  type = 'button',
  children,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-control border transition-colors focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";
