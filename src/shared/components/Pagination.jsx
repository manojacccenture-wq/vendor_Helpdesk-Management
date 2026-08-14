import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Pagination = ({ currentPage, totalPages, onNext, onPrev }) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-secondary">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onPrev} 
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onNext} 
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
