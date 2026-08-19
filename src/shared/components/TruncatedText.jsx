import { useRef, useState, useEffect } from 'react';
import { cn } from '../utils/cn.js';

/**
 * TruncatedText — Renders text with a native tooltip only when truncated.
 *
 * Detects truncation via scrollWidth > clientWidth.
 * Uses the project's existing `title` attribute pattern for the tooltip.
 *
 * @param {Object} props
 * @param {string} [props.as]        - HTML tag to render (default: 'span')
 * @param {string} [props.className] - Additional CSS classes
 * @param {ReactNode} props.children - Text content
 */
export const TruncatedText = ({ as: Tag = 'span', className, children, ...props }) => {
  const ref = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  return (
    <Tag
      ref={ref}
      className={cn('truncate', className)}
      title={isTruncated ? children : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default TruncatedText;
