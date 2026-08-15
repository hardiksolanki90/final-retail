import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`
              peer sr-only
            `}
            {...props}
          />
          <div
            className={`
              w-5 h-5 border rounded flex items-center justify-center transition-colors cursor-pointer
              ${props.checked || indeterminate
                ? 'bg-primary-600 border-primary-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error ? 'border-red-500' : ''}
              peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2
              ${className}
            `}
            onClick={() => {
              if (!props.disabled) {
                const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
                checkbox?.click();
              }
            }}
          >
            {props.checked && !indeterminate && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
            {indeterminate && (
              <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={`ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer ${
              props.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
