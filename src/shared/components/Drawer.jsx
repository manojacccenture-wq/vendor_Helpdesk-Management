import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../utils/cn.js';

/**
 * Drawer — Generic reusable slide-out drawer component.
 *
 * Handles only the common drawer UI/behaviour:
 *   - Backdrop overlay
 *   - Slide-in panel from the right
 *   - Header with optional icon, title, close button, and custom actions
 *   - Scrollable content area
 *   - Optional fixed footer
 *   - Optional resize handle on the left edge
 *
 * Does NOT contain any domain-specific logic (Comments, History, Tickets, etc.).
 *
 * @param {Object}   props
 * @param {boolean}  props.open              - Whether the drawer is visible
 * @param {Function} props.onClose           - Called when the user clicks the backdrop or close button
 * @param {string}   props.title             - Header title text
 * @param {string}   [props.subtitle]        - Optional subtitle displayed below the title
 * @param {ReactNode}[props.icon]            - Optional icon displayed before the title
 * @param {Function} [props.headerActions]   - Render prop: (onClose) => ReactNode — extra header actions rendered before the close button
 * @param {ReactNode}[props.children]        - Drawer body content (rendered inside the scrollable area)
 * @param {ReactNode}[props.footer]          - Optional fixed footer rendered below the scrollable area
 * @param {string}   [props.className]       - Additional classes applied to the outer overlay wrapper
 * @param {string}   [props.scrollableClassName] - Additional classes applied to the scrollable content area
 * @param {Object}   [props.scrollableRef]   - Ref forwarded to the scrollable content div
 * @param {string}   [props.ariaLabel]       - Accessible label for the close button
 * @param {boolean}  [props.resizable]       - Enable resize handle on the left edge (default: false)
 * @param {number}   [props.defaultWidth]    - Initial width when resizable (default: 640)
 * @param {number}   [props.minWidth]        - Minimum width when resizable (default: 400)
 * @param {number}   [props.maxWidth]        - Maximum width when resizable (default: 900)
 */
export const Drawer = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerActions,
  children,
  footer,
  className,
  scrollableClassName,
  scrollableRef,
  ariaLabel,
  resizable = false,
  defaultWidth = 640,
  minWidth = 400,
  maxWidth = 900,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, minWidth, maxWidth]);

  if (!open) return null;

  return (
    <div className={cn('fixed inset-0 z-50 flex justify-end', className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'relative flex flex-col h-full bg-surface shadow-xl animate-slide-in-right',
          resizable ? '' : 'w-full max-w-[480px] sm:w-[480px]'
        )}
        style={resizable ? { width } : undefined}
      >
        {/* ─── Resize Handle (left edge) ─── */}
        {resizable && (
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 z-10',
              'cursor-col-resize transition-colors',
              'hover:bg-info/40',
              isDragging ? 'bg-info/40' : 'bg-transparent'
            )}
            aria-label="Resize drawer"
          />
        )}

        {/* ─── Header (Fixed) ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-default bg-surface shrink-0">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h2 className="text-card-title text-primary leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-caption text-secondary mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {typeof headerActions === 'function' ? headerActions(onClose) : headerActions}
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2"
              aria-label={ariaLabel || 'Close'}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div
          ref={scrollableRef}
          className={cn('flex-1 overflow-y-auto px-6', scrollableClassName)}
        >
          {children}
        </div>

        {/* ─── Optional Footer ─── */}
        {footer && (
          <div className="shrink-0 border-t border-default bg-surface">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

export default Drawer;
