import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export const FileUpload = React.forwardRef(({ className, label, error, onChange, value = null, multiple = false, disabled = false, isUploading = false, ...props }, ref) => {
  const inputRef = useRef(null);
  const [internalError, setInternalError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  
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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event-like object to reuse existing handleFileChange
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      handleFileChange(syntheticEvent);
      e.dataTransfer.clearData();
    }
  }, [handleFileChange]);

  // Helper to ensure value is array for rendering
  const filesList = multiple ? (Array.isArray(value) ? value : (value ? [value] : [])) : (value ? [value] : []);
  
  const displayError = internalError || error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-primary-hover">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed border-hover rounded-control p-6 bg-surface-hover hover:bg-surface-active transition-colors cursor-pointer",
          displayError && "border-danger",
          isDragging && "border-success bg-success-soft",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed hover:bg-surface-hover",
          className
        )}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud className="h-8 w-8 text-muted mb-2" />
        <p className="text-secondary">Click to upload or drag and drop</p>
        <small className="text-muted">
          {multiple ? "Max file size 5MB (up to 5 files)" : "Max file size 5MB"}
        </small>
        <input
          type="file"
          className="hidden"
          ref={setRefs}
          onChange={handleFileChange}
          multiple={multiple}
          disabled={disabled || isUploading}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          {...props}
        />
      </div>

      {displayError && <small className="text-danger">{displayError}</small>}

      {/* Uploaded File Items */}
      {filesList.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {filesList.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between bg-surface border border-default p-3 rounded-control shadow-sm">
              <span className="text-primary-hover truncate max-w-[80%]">{file.name}</span>
              <button 
                type="button" 
                onClick={() => removeFile(idx)}
                className="text-muted hover:text-danger transition-colors"
                disabled={disabled || isUploading}
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
