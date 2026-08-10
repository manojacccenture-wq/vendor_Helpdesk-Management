import React, { useMemo } from 'react';
import { cn } from '../utils/cn.js';

/**
 * Reusable, generic Table component.
 *
 * Renders a data table from a columns configuration and a data array.
 * Uses CSS Grid for precise column width distribution.
 * Supports custom cell renderers, fixed/flexible column widths, alignment, loading, and empty states.
 *
 * @param {Object} props
 * @param {Array} props.columns - Column configuration objects
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.rowKey - Function that returns a unique key for each row
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {string} props.className - Additional class for the outer container
 * @param {React.ReactNode} props.loadingContent - Custom loading content
 * @param {React.ReactNode} props.emptyContent - Custom empty content
 *
 * Column config:
 * {
 *   key: string,           // Accessor key for the data object
 *   header: string,        // Column header label
 *   width?: string,        // Fixed width as CSS value (e.g., "150px", "20%")
 *   flex?: number,         // Flex ratio for remaining space (e.g., 1, 2, 3)
 *   align?: 'left' | 'center' | 'right',
 *   nowrap?: boolean,      // Whether header/text should not wrap
 *   truncate?: boolean,    // Whether to truncate text with ellipsis (for flexible columns)
 *   className?: string,    // Additional class for td/th
 *   headerClassName?: string, // Additional class for th only
 *   cellClassName?: string,   // Additional class for td only
 *   render?: (row, index) => React.ReactNode, // Custom cell renderer
 *   visible?: boolean,     // Whether column is visible (default: true)
 * }
 */
export const Table = ({
  columns = [],
  data = [],
  rowKey,
  isLoading = false,
  emptyMessage = 'No data found.',
  className,
  loadingContent,
  emptyContent,
}) => {
  // Filter to only visible columns
  const visibleColumns = columns.filter(col => col.visible !== false);
  const colCount = visibleColumns.length;

  // Calculate grid template columns from column configuration
  const gridTemplateColumns = useMemo(() => {
    const parts = visibleColumns.map(col => {
      if (col.width) {
        // Fixed-width column: use exact pixel/percentage value
        return col.width;
      } else if (col.flex) {
        // Flexible column: use fr units
        return `${col.flex}fr`;
      } else {
        // Default: flexible column with 1fr
        return '1fr';
      }
    });
    return parts.join(' ');
  }, [visibleColumns]);

  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const gridStyle = { gridTemplateColumns };

  return (
    <div className={cn('w-full bg-surface border border-default rounded-control overflow-hidden', className)}>
      <div className='overflow-x-auto'>
        <div className='w-full text-left'>
          {/* ─── Header ─── */}
          <div
            role='row'
            className='grid border-b border-default bg-surface-hover'
            style={gridStyle}
          >
            {visibleColumns.map((col) => (
              <div
                key={col.key}
                role='columnheader'
                className={cn(
                  'py-3 px-4 text-secondary',
                  col.align && getAlignmentClass(col.align),
                  col.nowrap !== false && 'whitespace-nowrap',
                  // Flexible columns with truncation
                  !col.width && col.truncate !== false && 'overflow-hidden text-ellipsis',
                  col.headerClassName
                )}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* ─── Body ─── */}
          <div role='rowgroup'>
            {/* Loading State */}
            {isLoading ? (
              <div role='row' className='grid' style={gridStyle}>
                <div role='cell' className='py-12 text-center' style={{ gridColumn: `1 / -1` }}>
                  {loadingContent || (
                    <span className='text-secondary'>Loading...</span>
                  )}
                </div>
              </div>
            ) : data.length === 0 ? (
              /* Empty State */
              <div role='row' className='grid' style={gridStyle}>
                <div role='cell' className='py-12 text-center' style={{ gridColumn: `1 / -1` }}>
                  {emptyContent || (
                    <span className='text-secondary'>{emptyMessage}</span>
                  )}
                </div>
              </div>
            ) : (
              /* Data Rows */
              data.map((row, index) => (
                <div
                  key={rowKey ? rowKey(row, index) : index}
                  role='row'
                  className='grid border-b border-default hover:bg-surface-hover/50 transition-colors divide-y sm:divide-y-0 sm:divide-x divide-default'
                  style={gridStyle}
                >
                  {visibleColumns.map((col) => (
                    <div
                      key={col.key}
                      role='cell'
                      className={cn(
                        'py-3 px-4',
                        col.align && getAlignmentClass(col.align),
                        // Flexible columns with truncation
                        !col.width && col.truncate !== false && 'overflow-hidden text-ellipsis whitespace-nowrap',
                        col.cellClassName
                      )}
                    >
                      {col.render
                        ? col.render(row, index)
                        : row[col.key] ?? '—'
                      }
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Table.displayName = 'Table';
export default Table;
