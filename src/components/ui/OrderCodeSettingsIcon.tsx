import { useState } from 'react';
import { Settings, Sparkles, Keyboard, X } from 'lucide-react';
import { SaveButton, CancelButton } from './Button';

interface OrderCodeModalProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

/**
 * Renders a Settings gear icon next to a label.
 * Clicking it opens a modal to configure a code/number field
 * either via auto-generate or manual prefix+number entry.
 */
export function OrderCodeSettingsIcon({ label, value, onChange, className = '' }: OrderCodeModalProps) {
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

  const handleOpen = () => {
    if (value) {
      const [existingPrefix, ...rest] = value.split('-');
      setMode('manual');
      setPrefix(existingPrefix ?? '');
      setNum(rest.join('-'));
    } else {
      setMode('auto');
      setPrefix('');
      setNum('');
    }
    setOpen(true);
  };

  const previewCode = [prefix, num].filter(Boolean).join('-');

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${className}`}
        title={`Configure ${label || 'Code'}`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden"
            style={{ animation: 'codeModalIn 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <style>{`
              @keyframes codeModalIn {
                from { opacity: 0; transform: translateY(6px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                  <Settings className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {label || 'Order Code'}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Numbering settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 -mt-1 -mr-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-2">
              {/* Segmented mode toggle */}
              <div className="relative grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div
                  className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-gray-700 shadow-sm transition-transform duration-200 ease-out"
                  style={{ transform: mode === 'manual' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
                />
                <button
                  type="button"
                  onClick={() => setMode('auto')}
                  className={`relative z-10 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'auto'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`relative z-10 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'manual'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  Manual
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {mode === 'auto'
                  ? `${label || 'This code'} generates automatically each time — no setup needed.`
                  : `Compose ${label || 'the code'} from a fixed prefix and a running number.`}
              </p>

              {mode === 'manual' && (
                <div className="mt-4 space-y-3">
                  {/* Joined prefix + number capsule */}
                  <div className="flex items-stretch rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                    <div className="flex-1 min-w-0">
                      <span className="block px-3 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Prefix
                      </span>
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="ORD"
                        className="w-full px-3 pb-1.5 bg-transparent text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center px-1 text-gray-300 dark:text-gray-600 font-mono select-none">–</div>
                    <div className="flex-1 min-w-0 border-l border-gray-200 dark:border-gray-700">
                      <span className="block px-3 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Number
                      </span>
                      <input
                        type="text"
                        value={num}
                        onChange={(e) => setNum(e.target.value)}
                        placeholder="10000"
                        className="w-full px-3 pb-1.5 bg-transparent text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-primary-500 dark:text-primary-400/80">
                      Preview
                    </span>
                    <span className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300 truncate">
                      {previewCode || 'e.g. ORD-10000'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 mt-4 border-t border-gray-100 dark:border-gray-800">
              <SaveButton onClick={handleSave} className="flex-1">
                Save
              </SaveButton>
              <CancelButton onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </CancelButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
