interface TwoOptionToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}

/** Sliding two-option pill switch — same segmented-control language as the code-settings modal. */
export function TwoOptionToggle({ value, onChange, trueLabel = 'Yes', falseLabel = 'No' }: TwoOptionToggleProps) {
  return (
    <div className="relative inline-grid grid-cols-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 w-48">
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-white dark:bg-gray-700 shadow-sm transition-transform duration-200 ease-out"
        style={{ transform: value ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
      />
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`relative z-10 py-1.5 rounded-md text-sm font-medium transition-colors ${
          value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {trueLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`relative z-10 py-1.5 rounded-md text-sm font-medium transition-colors ${
          !value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {falseLabel}
      </button>
    </div>
  );
}

export default TwoOptionToggle;
