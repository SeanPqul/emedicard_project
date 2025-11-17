'use client';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

/**
 * ResponsiveModal component that provides a fully responsive modal
 * with proper mobile support (full screen on small devices)
 */
export default function ResponsiveModal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  className = '' 
}: ResponsiveModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn overflow-y-auto" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`bg-white rounded-xl sm:rounded-2xl w-full ${sizeClasses[size]} shadow-2xl relative transform transition-all animate-slideUp my-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ResponsiveModalHeader component for modal headers
 */
export function ResponsiveModalHeader({ 
  title, 
  subtitle, 
  onClose, 
  children,
  className = '' 
}: { 
  title?: string; 
  subtitle?: string; 
  onClose?: () => void; 
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * ResponsiveModalBody component for modal body content
 */
export function ResponsiveModalBody({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ResponsiveModalFooter component for modal footer actions
 */
export function ResponsiveModalFooter({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end ${className}`}>
      {children}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <ResponsiveModal isOpen={isOpen} onClose={handleClose} size="lg">
 *   <ResponsiveModalHeader title="Edit Profile" subtitle="Update your account information" onClose={handleClose} />
 *   <ResponsiveModalBody>
 *     <p>Modal content goes here...</p>
 *   </ResponsiveModalBody>
 *   <ResponsiveModalFooter>
 *     <button onClick={handleClose}>Cancel</button>
 *     <button onClick={handleSave}>Save Changes</button>
 *   </ResponsiveModalFooter>
 * </ResponsiveModal>
 */
