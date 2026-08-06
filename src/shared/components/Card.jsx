import React from 'react';
import { cn } from '../utils/cn.js';

export const Card = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("bg-surface rounded-card border border-default shadow-sm overflow-hidden", className)} 
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("px-6 py-4 border-b border-default bg-surface-hover", className)} 
      {...props}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3 
      ref={ref} 
      className={cn("text-card-title text-primary", className)} 
      {...props}
    >
      {children}
    </h3>
  );
});
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = "CardContent";
