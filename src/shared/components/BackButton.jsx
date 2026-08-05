import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * BackButton - A centralized back navigation component
 * 
 * This component provides consistent back navigation across the application.
 * It can either use the default browser history or navigate to a specific path.
 * 
 * @param {Object} props
 * @param {string} [props.to] - Optional path to navigate to. If not provided, uses browser history (navigate(-1))
 * @param {string} [props.label] - Optional label to display next to the arrow icon
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Optional custom click handler (overrides default navigation)
 */
export const BackButton = ({ 
  to, 
  label, 
  className = '',
  onClick,
  ...props 
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleClick} 
      className={`p-2 ${className}`}
      {...props}
    >
      <ArrowLeft className="w-5 h-5" />
      {label && (
        <span className="ml-2">{label}</span>
      )}
    </Button>
  );
};

BackButton.displayName = "BackButton";
