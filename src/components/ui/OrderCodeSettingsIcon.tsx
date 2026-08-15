import { useState } from 'react';
import { Settings } from 'lucide-react';

interface OrderCodeModalProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}

/**
 * Renders a Settings gear icon next to a label.
 * Clicking it opens a modal to configure a code/number field
 * either via auto-generate or manual prefix+number entry.
 */
export function OrderCodeSettingsIcon({ label, value, onChange }: OrderCodeModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [num, setNum] = useState('');

  const handleSave = () => {
    if (mode === 'manual') {
      const combined = [prefix, num].filter(Boolean).join('-');
      onChange(combined || '');
    } else {
      onChange('');
    }
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        title={`Configure ${label || 'Code'}`}
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {label || 'Order Code'}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Your {label || 'code'} number is set on auto generate mode to save your time.
                Are you sure about changing this setting?
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`codeMode-${label}`}
                    value="auto"
                    checked={mode === 'auto'}
                    onChange={() => setMode('auto')}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Continue auto-generating {label || 'Code'}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`codeMode-${label}`}
                    value="manual"
                    checked={mode === 'manual'}
                    onChange={() => setMode('manual')}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I will add them manually each time
                  </span>
                </label>
              </div>

              {mode === 'manual' && (
                <div className="mt-5 flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={e => setPrefix(e.target.value)}
                      placeholder="e.g. ORD"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={num}
                      onChange={e => setNum(e.target.value)}
                      placeholder="e.g. 10000"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 text-sm rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
