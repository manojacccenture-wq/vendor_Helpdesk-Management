import React from 'react';
import { cn } from '../utils/cn.js';

const buttonVariants = {
  primary: "bg-[#0F766E] text-white hover:bg-[#0D655E] border-transparent",
  secondary: "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] border-transparent",
  outline: "bg-transparent text-[#0F766E] border-[#0F766E] hover:bg-[#F0FDF4]",
  ghost: "bg-transparent text-[#64748B] hover:bg-[#F1F5F9] border-transparent"
};

const buttonSizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-6 text-[16px]"
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
        "inline-flex items-center justify-center font-[500] rounded-[6px] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
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
