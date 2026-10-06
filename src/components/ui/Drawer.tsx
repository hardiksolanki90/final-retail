import { useEffect, useRef, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import { SkeletonRegion } from './skeleton';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
  width?: string;
  footer?: ReactNode;
  headerActions?: ReactNode;
  /** The drawer's data is still loading: the skeleton covers the body (the form stays mounted but inert). */
  isLoading?: boolean;
  /** Placeholder shaped like this drawer's content. Without one, a spinner covers the body (legacy — being phased out). */
  skeleton?: ReactNode;
}

export function Drawer({ isOpen, onClose, title, children, position = 'right', width = 'w-80', footer, headerActions, isLoading = false, skeleton }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="drawer-overlay absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Content */}
      <div ref={drawerRef} className={`drawer-content absolute top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full ${width} bg-white dark:bg-gray-900 shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-2">
            {headerActions && <div>{headerActions}</div>}
            <button onClick={onClose} className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Close drawer">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 min-h-0">
          <div className="h-full overflow-y-auto" inert={isLoading}>
            {children}
          </div>
          {isLoading &&
            (skeleton ? (
              <SkeletonRegion label={`Loading ${title}`} className="absolute inset-0 z-10 overflow-hidden bg-white dark:bg-gray-900">
                {skeleton}
              </SkeletonRegion>
            ) : (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-900" role="status" aria-live="polite">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-label="Loading" />
              </div>
            ))}
        </div>

        {/* Footer */}
        {footer && <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">{footer}</div>}
      </div>
    </div>
  );
}
