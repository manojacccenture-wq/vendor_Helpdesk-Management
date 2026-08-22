import { Search } from 'lucide-react';
import { Input } from './Input.jsx';
import { Select } from './Select.jsx';
import { Button } from './Button.jsx';

/**
 * TicketToolbar — Shared toolbar component with configurable filters and actions.
 *
 * Used by both Helpdesk and Vendor dashboards.
 * Each role provides its own filter/action configuration.
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Current search value
 * @param {Function} props.onSearchChange - Search change handler
 * @param {Array} props.filters - Array of filter configurations
 * @param {Function} props.onClearFilters - Clear all filters handler
 * @param {Array} props.actions - Optional array of action button configurations
 * @param {string} props.className - Additional classes for the container
 *
 * Filter config:
 * {
 *   value: string,           // Current filter value
 *   onChange: Function,      // Change handler
 *   options: Array,          // Array of { label, value } options
 *   isLoading: boolean,      // Whether options are loading
 *   placeholder: string,     // Placeholder when loading
 *   width: string,           // Tailwind width class (e.g., "sm:w-36")
 * }
 *
 * Action config:
 * {
 *   label: string,           // Button label
 *   onClick: Function,       // Click handler
 *   variant: string,         // Button variant (e.g., "primary", "ghost")
 *   className: string,       // Additional classes
 * }
 */
export const TicketToolbar = ({
  searchTerm,
  onSearchChange,
  filters = [],
  onClearFilters,
  actions = [],
  className,
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 ${className || ''}`}>
      
      {/* Filters Left */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted z-10" />
          <Input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter, index) => (
          <div key={filter.label || index} className={`relative w-full ${filter.width || 'sm:w-36'}`}>
            <Select 
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              options={filter.options || []}
              disabled={filter.isLoading}
            />
          </div>
        ))}

        {/* Clear Filters */}
        <Button 
          variant="ghost"
          onClick={onClearFilters}
          className="whitespace-nowrap"
        >
          Clear filters
        </Button>
      </div>

      {/* Actions Right */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button 
              key={action.label || index}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title}
              className={`w-full sm:w-auto ${action.className || ''}`}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

    </div>
  );
};

export default TicketToolbar;
