import { AlertCircle } from 'lucide-react';
import { Card } from './Card.jsx';

/**
 * TicketMetrics — Shared component for displaying ticket count metrics.
 *
 * Used by both Helpdesk and Vendor dashboards.
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
  if (isError) {
    return (
      <div className="flex items-center gap-2 text-danger bg-danger-soft p-4 rounded-card mb-8 shadow-sm">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load ticket metrics. Please try again.</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-8 ${className || ''}`}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const valueColor = metric.valueColor || 'text-primary';
        const labelColor = metric.labelColor || 'text-secondary';

        return (
          <Card
            key={metric.label || index}
            className={`flex-1 p-6 rounded-card shadow-sm flex items-center justify-between ${metric.cardClassName || ''}`}
          >
            <div>
              <p className={`${labelColor} mb-1`}>{metric.label}</p>
              <h2 className={valueColor}>
                {isLoading ? '...' : metric.value ?? 0}
              </h2>
            </div>
            <div className={`w-12 h-12 rounded-control ${metric.iconBg || 'bg-surface-active'} flex items-center justify-center`}>
              {Icon && <Icon className={`w-6 h-6 ${metric.iconColor || 'text-primary'}`} />}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TicketMetrics;
