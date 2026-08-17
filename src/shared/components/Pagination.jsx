import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';
import { Select } from './Select.jsx';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Pagination — shared pagination bar with Previous/Next navigation.
 *
 * Optional props for total count & page-size selector:
 *  - totalItems      {number}   Total records across all pages
 *  - itemsPerPage    {number}   Current page size
 *  - onItemsPerPageChange {function} Called when user picks a new page size
 *  - pageSizeOptions {number[]} Override the default [10, 25, 50, 100]
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onNext,
  onPrev,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) => {
  const hasTotal = typeof totalItems === 'number' && totalItems >= 0;
  const hasPageSize = typeof itemsPerPage === 'number' && typeof onItemsPerPageChange === 'function';

  // Compute range for "Showing X–Y of Z records"
  const startItem = hasTotal && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = hasTotal && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
      {/* Left side — range info + page info */}
      <div className="text-sm text-secondary">
        {hasTotal && itemsPerPage ? (
          <span>
            Showing {startItem}–{endItem} of {totalItems} records
            <span className="ml-3 text-secondary/70">
              (Page {currentPage} of {totalPages})
            </span>
          </span>
        ) : (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Right side — rows per page selector + prev/next */}
      <div className="flex items-center gap-3">
        {hasPageSize && (
          <div className="flex items-center gap-1.5 text-sm text-secondary">
            <label className="whitespace-nowrap">Rows per page:</label>
            <Select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              options={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))}
              className="!h-8 !w-auto !text-sm !px-2"
            />
          </div>
        )}

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
    </div>
  );
};
