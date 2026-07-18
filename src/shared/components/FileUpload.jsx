import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

export const FileUpload = React.forwardRef(({ className, label, error, onChange, value = null, ...props }, ref) => {
  const inputRef = useRef(null);
  
  // Create a combined ref handling
  const setRefs = (element) => {
    inputRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (onChange) {
        onChange(selectedFile);
      }
      
      // Reset input value so same file can be uploaded again if removed
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeFile = () => {
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[14px] font-[500] text-[#334155]">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-[8px] p-6 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer",
          error && "border-[#EF4444]",
          className
        )}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="h-8 w-8 text-[#94A3B8] mb-2" />
        <p className="text-[14px] text-[#475569] font-[500]">Click to upload or drag and drop</p>
        <p className="text-[12px] text-[#94A3B8]">Max file size 10MB</p>
        <input
          type="file"
          className="hidden"
          ref={setRefs}
          onChange={handleFileChange}
          {...props}
        />
      </div>

      {error && <span className="text-[12px] text-[#EF4444]">{error}</span>}

      {/* Uploaded File Item */}
      {value && (
        <ul className="mt-3 flex flex-col gap-2">
          <li className="flex items-center justify-between bg-white border border-[#E2E8F0] p-3 rounded-[6px] shadow-sm">
            <span className="text-[13px] text-[#334155] truncate max-w-[80%]">{value.name}</span>
            <button 
              type="button" 
              onClick={removeFile}
              className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
});
FileUpload.displayName = "FileUpload";
