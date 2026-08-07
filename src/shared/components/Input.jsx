import React from 'react';
import { cn } from '../utils/cn.js';

export const Input = React.forwardRef(({ className, type = "text", error, label, ...props }, ref) => {
  // Parse label to separate text from required asterisk
  const isRequired = label?.endsWith(' *');
  const labelText = isRequired ? label.slice(0, -2) : label;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-primary-hover">
          {labelText}
          {isRequired && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-control border border-hover bg-surface px-3 py-2 text-primary file:border-0 file:bg-transparent file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-surface-hover",
          error && "border-danger focus-visible:ring-danger",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <small className="text-danger">{error}</small>}
    </div>
  );
});
Input.displayName = "Input";
