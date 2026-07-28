import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export const FileUpload = React.forwardRef(({ className, label, error, onChange, value = null, multiple = false, ...props }, ref) => {
  const inputRef = useRef(null);
  const [internalError, setInternalError] = useState(null);
  
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
    setInternalError(null); // Clear previous errors
    
    if (e.target.files && e.target.files.length > 0) {
      const incomingFiles = Array.from(e.target.files);
      const validFiles = [];
      
      for (const file of incomingFiles) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          setInternalError("Only PDF, JPG and PNG files are allowed.");
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setInternalError("Max file size is 5MB per file.");
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
        validFiles.push(file);
      }
      
      if (onChange) {
        if (multiple) {
          const currentFiles = Array.isArray(value) ? value : [];
          
          if (currentFiles.length + validFiles.length > 5) {
            setInternalError("You can upload a maximum of 5 files.");
            if (inputRef.current) inputRef.current.value = "";
            return;
          }
          
          onChange([...currentFiles, ...validFiles]);
        } else {
          onChange(validFiles[0]);
        }
      }
      
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeFile = (indexToRemove) => {
    setInternalError(null);
    if (onChange) {
      if (multiple) {
        const currentFiles = Array.isArray(value) ? value : [];
        const newFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
        onChange(newFiles.length > 0 ? newFiles : null);
      } else {
        onChange(null);
      }
    }
  };

  // Helper to ensure value is array for rendering
  const filesList = multiple ? (Array.isArray(value) ? value : (value ? [value] : [])) : (value ? [value] : []);
  
  const displayError = internalError || error;

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
          displayError && "border-[#EF4444]",
          className
        )}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="h-8 w-8 text-[#94A3B8] mb-2" />
        <p className="text-[14px] text-[#475569] font-[500]">Click to upload or drag and drop</p>
        <p className="text-[12px] text-[#94A3B8]">
          {multiple ? "Max file size 5MB (up to 5 files)" : "Max file size 5MB"}
        </p>
        <input
          type="file"
          className="hidden"
          ref={setRefs}
          onChange={handleFileChange}
          multiple={multiple}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          {...props}
        />
      </div>

      {displayError && <span className="text-[12px] text-[#EF4444]">{displayError}</span>}

      {/* Uploaded File Items */}
      {filesList.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {filesList.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between bg-white border border-[#E2E8F0] p-3 rounded-[6px] shadow-sm">
              <span className="text-[13px] text-[#334155] truncate max-w-[80%]">{file.name}</span>
              <button 
                type="button" 
                onClick={() => removeFile(idx)}
                className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
FileUpload.displayName = "FileUpload";
