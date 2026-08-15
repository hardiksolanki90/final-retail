import { useState, type ReactNode } from 'react';

export interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'line' | 'pills';
  className?: string;
}

export function Tabs({
  tabs,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onChange,
  variant = 'line',
  className = '',
}: TabsProps) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || tabs[0]?.key || ''
  );

  const activeKey = controlledActiveKey ?? internalActiveKey;

  function handleTabClick(key: string) {
    if (controlledActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  }

  const activeTab = tabs.find((tab) => tab.key === activeKey);

  function getLineTabClass(isActive: boolean, isDisabled: boolean): string {
    const base = 'relative px-5 py-3 text-sm font-medium tracking-wide uppercase transition-colors';
    const indicator = 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary-600 dark:after:bg-primary-400 after:rounded-t';

    if (isDisabled) return `${base} text-gray-400 dark:text-gray-600 cursor-not-allowed`;
    if (isActive) return `${base} text-primary-600 dark:text-primary-400 ${indicator}`;
    return `${base} text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/40`;
  }

  function getPillTabClass(isActive: boolean, isDisabled: boolean): string {
    const base = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';

    if (isDisabled) return `${base} text-gray-400 dark:text-gray-600 cursor-not-allowed`;
    if (isActive) return `${base} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm`;
    return `${base} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`;
  }

  const lineStyles = {
    container: 'border-b border-gray-200 dark:border-gray-700 overflow-x-auto',
    tab: getLineTabClass,
  };

  const pillStyles = {
    container: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
    tab: getPillTabClass,
  };

  const styles = variant === 'line' ? lineStyles : pillStyles;

  return (
    <div className={className}>
      <div className={`flex ${styles.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && handleTabClick(tab.key)}
            disabled={tab.disabled}
            className={styles.tab(tab.key === activeKey, !!tab.disabled)}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab?.content}
      </div>
    </div>
  );
}

export interface TabPanelProps {
  children: ReactNode;
  value: string;
  activeValue: string;
  className?: string;
}

export function TabPanel({ children, value, activeValue, className = '' }: TabPanelProps) {
  if (value !== activeValue) return null;
  return <div className={className}>{children}</div>;
}
