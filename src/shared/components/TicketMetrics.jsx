import { useRef, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from './Card.jsx';

/**
 * TicketMetrics — Shared component for displaying ticket count metrics.
 *
 * Renders metrics as a horizontally scrollable row with scroll-hint fade indicators.
 * Each role provides its own metric configuration.
 *
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric configurations
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {boolean} props.isError - Whether an error occurred
 * @param {string} props.className - Additional classes for the container
 *
 * Metric config:
 * {
 *   label: string,           // Display label (e.g., "New tickets")
 *   value: number,           // Metric value
 *   icon: React.Component,   // Icon component from lucide-react
 *   iconBg: string,          // Background class for icon container (e.g., "bg-surface-active")
 *   iconColor: string,       // Text color class for icon (e.g., "text-primary")
 *   valueColor?: string,     // Text color class for value (default: "text-primary")
 *   labelColor?: string,     // Text color class for label (default: "text-secondary")
 *   cardClassName?: string,  // Additional classes for the Card
 * }
 */
export const TicketMetrics = ({
  metrics = [],
  isLoading = false,
  isError = false,
  className,
}) => {
  const scrollRef = useRef(null);
  const resizeRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Stable scroll-state updater — no dependencies
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 1);
    setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  // Callback ref — attaches scroll/resize listeners on mount, cleans up on unmount.
  // Uses requestAnimationFrame for initial measurement after first paint.
  const scrollContainerRef = useCallback((node) => {
    // Cleanup previous element
    if (scrollRef.current) {
      scrollRef.current.removeEventListener('scroll', updateScrollState);
      if (resizeRef.current) {
        resizeRef.current.disconnect();
        resizeRef.current = null;
      }
    }

    scrollRef.current = node;

    if (!node) return;

    // Initial measurement after first paint (before paint, actually)
    requestAnimationFrame(updateScrollState);

    // Attach scroll listener
    node.addEventListener('scroll', updateScrollState, { passive: true });

    // Attach ResizeObserver
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);
    resizeRef.current = observer;
  }, [updateScrollState]);

  // Re-check scroll state when metrics data changes (render-phase measurement)
  // This runs synchronously during render — no useEffect needed
  const prevMetricsRef = useRef(metrics);
  const prevIsLoadingRef = useRef(isLoading);
  if (prevMetricsRef.current !== metrics || prevIsLoadingRef.current !== isLoading) {
    prevMetricsRef.current = metrics;
    prevIsLoadingRef.current = isLoading;
    // Defer measurement to after this render commits
    requestAnimationFrame(updateScrollState);
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-danger bg-danger-soft p-4 rounded-card mb-8 shadow-sm">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load ticket metrics. Please try again.</span>
      </div>
    );
  }

  return (
    <div className={`mb-8 ${className || ''}`}>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hidden scroll-snap-x"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const valueColor = metric.valueColor || 'text-primary';
            const labelColor = metric.labelColor || 'text-secondary';

            return (
              <Card
                key={metric.label || index}
                className={`relative flex-none p-6 rounded-card shadow-sm flex items-center justify-between metric-card scroll-snap-start ${metric.cardClassName || ''} ${metric.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={metric.onClick}
              >
                <div className="min-w-0">
                  <p className={`${labelColor} mb-1 truncate`}>{metric.label}</p>
                  <h2 className={valueColor}>
                    {isLoading ? '...' : metric.value ?? 0}
                  </h2>
                </div>
                {metric.active && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                )}
                <div className={`w-12 h-12 rounded-control ${metric.iconBg || 'bg-surface-active'} flex items-center justify-center flex-shrink-0`}>
                  {Icon && <Icon className={`w-6 h-6 ${metric.iconColor || 'text-primary'}`} />}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Left fade — visible when scrolled past the start */}
        <div
          className={`scroll-fade-left ${canScrollLeft ? 'fade-visible' : 'fade-hidden'}`}
        />

        {/* Right fade — visible when more cards exist to the right */}
        <div
          className={`scroll-fade-right ${canScrollRight ? 'fade-visible' : 'fade-hidden'}`}
        />
      </div>
    </div>
  );
};

export default TicketMetrics;
