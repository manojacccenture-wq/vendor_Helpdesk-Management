import React from 'react';
import { cn } from '../utils/cn.js';

export const Select = React.forwardRef(({ className, error, label, options = [], placeholder, ...props }, ref) => {
  // Parse label to separate text from required asterisk
  const isRequired = label?.endsWith(' *');
  const labelText = isRequired ? label.slice(0, -2) : label;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[14px] font-[500] text-[#334155]">
          {labelText}
          {isRequired && <span className="text-[#EF4444]"> *</span>}
        </label>
      )}
      <select
        className={cn(
          "flex h-10 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 py-2 text-[14px] text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-[#F8FAFC]",
          error && "border-[#EF4444] focus-visible:ring-[#EF4444]",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[12px] text-[#EF4444]">{error}</span>}
    </div>
  );
});
Select.displayName = "Select";
