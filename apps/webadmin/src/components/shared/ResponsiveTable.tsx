'use client';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveTable component that wraps tables with proper responsive behavior
 * Provides horizontal scrolling on mobile and proper styling
 */
export default function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`responsive-table-wrapper ${className}`}>
      {children}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <ResponsiveTable>
 *   <table className="w-full">
 *     <thead>...</thead>
 *     <tbody>...</tbody>
 *   </table>
 * </ResponsiveTable>
 */
