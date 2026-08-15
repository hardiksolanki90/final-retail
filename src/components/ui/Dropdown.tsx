import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 min-w-48 py-1
            bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item) => {
            if (item.divider) {
              return (
                <div
                  key={item.key}
                  className="my-1 border-t border-gray-200 dark:border-gray-700"
                />
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={`
                  w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors
                  ${item.disabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Button Dropdown - A dropdown with a button trigger
export interface ButtonDropdownProps {
  label: string;
  items: DropdownItem[];
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function ButtonDropdown({
  label,
  items,
  variant = 'outline',
  size = 'md',
  icon,
  align = 'right',
  className = '',
}: ButtonDropdownProps) {
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <Dropdown
      align={align}
      items={items}
      className={className}
      trigger={
        <button
          className={`
            inline-flex items-center gap-2 font-medium rounded-lg transition-colors
            ${variantStyles[variant]}
            ${sizeStyles[size]}
          `}
        >
          {icon}
          {label}
          <ChevronDown className="w-4 h-4" />
        </button>
      }
    />
  );
}
