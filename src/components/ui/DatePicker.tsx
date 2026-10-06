import { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format, isValid, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, setMonth, setYear, getYear, getMonth } from 'date-fns';
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────
export interface DatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  onChange: (date: Date | null) => void;
  selected?: Date | null;
  dateFormat?: string;
  placeholderText?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeCaption?: string;
  timeIntervals?: number;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function generateYears(center: number, range = 12): number[] {
  const start = center - range;
  const end = center + range;
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

function generateTimeSlots(interval: number): string[] {
  const slots: string[] = [];
  for (let m = 0; m < 1440; m += interval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const d = new Date(2000, 0, 1, h, min);
    slots.push(format(d, 'h:mm aa'));
  }
  return slots;
}

// ─── Dropdown (shared month / year picker) ─────────────────────────────
interface DropdownProps {
  value: string;
  options: { label: string; value: string | number }[];
  onSelect: (value: string | number) => void;
}

function Dropdown({ value, options, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-sm font-semibold
                   text-gray-800 dark:text-gray-200
                   hover:bg-primary-50 dark:hover:bg-primary-900/30
                   transition-colors cursor-pointer select-none"
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 max-h-52 w-36 overflow-y-auto
                     rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800
                     shadow-xl ring-1 ring-black/5
                     py-1 scrollbar-thin"
        >
          {options.map((opt) => {
            const isActive = String(opt.value) === String(value) || opt.label === value;
            return (
              <button
                key={opt.value}
                type="button"
                data-active={isActive}
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer
                  ${isActive ? 'bg-primary-500 text-white font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Calendar Grid ─────────────────────────────────────────────────────
interface CalendarGridProps {
  viewDate: Date;
  selected: Date | null;
  onSelect: (d: Date) => void;
  onViewChange: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

function CalendarGrid({ viewDate, selected, onSelect, onViewChange, minDate, maxDate }: CalendarGridProps) {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let cursor = calStart;
  while (cursor <= calEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const years = useMemo(() => generateYears(getYear(viewDate)), [viewDate]);

  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: i }));
  const yearOptions = years.map((y) => ({ label: String(y), value: y }));

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onViewChange(subMonths(viewDate, 1))}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          <Dropdown value={MONTHS[getMonth(viewDate)]} options={monthOptions} onSelect={(v) => onViewChange(setMonth(viewDate, Number(v)))} />
          <Dropdown value={String(getYear(viewDate))} options={yearOptions} onSelect={(v) => onViewChange(setYear(viewDate, Number(v)))} />
        </div>

        <button
          type="button"
          onClick={() => onViewChange(addMonths(viewDate, 1))}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-[11px] font-semibold uppercase tracking-wide
                       text-gray-400 dark:text-gray-500 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, viewDate);
          const sel = selected && isSameDay(day, selected);
          const today = isToday(day);
          const disabled = isDisabled(day);

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) onSelect(day);
              }}
              className={`
                relative w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm
                transition-all duration-150 cursor-pointer
                ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
                ${
                  sel
                    ? 'bg-primary-500 text-white font-semibold shadow-md shadow-primary-500/30'
                    : today
                      ? 'font-semibold text-primary-600 dark:text-primary-400'
                      : inMonth
                        ? 'text-gray-800 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                        : 'text-gray-300 dark:text-gray-600'
                }
              `}
            >
              {format(day, 'd')}
              {today && !sel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-center">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            onViewChange(now);
            onSelect(now);
          }}
          className="text-xs font-medium text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300
                     px-3 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20
                     transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>
    </div>
  );
}

// ─── Time List ─────────────────────────────────────────────────────────
interface TimeListProps {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
  caption?: string;
}

function TimeList({ slots, selected, onSelect, caption }: TimeListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'center' });
    }
  }, [selected]);

  return (
    <div className="flex flex-col w-full">
      {caption && <div className="px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{caption}</div>}
      <div ref={listRef} className="overflow-y-auto max-h-64 px-2 pb-2 scrollbar-thin">
        {slots.map((slot) => {
          const isActive = slot === selected;
          return (
            <button
              key={slot}
              type="button"
              data-active={isActive}
              onClick={() => onSelect(slot)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 cursor-pointer
                ${isActive ? 'bg-primary-500 text-white font-medium shadow-sm shadow-primary-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DatePicker ───────────────────────────────────────────────────
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      required,
      onChange,
      selected = null,
      dateFormat = 'MMM d, yyyy',
      placeholderText = 'Select date',
      showTimeSelect = false,
      showTimeSelectOnly = false,
      timeCaption = 'Time',
      timeIntervals = 30,
      minDate,
      maxDate,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selected && isValid(selected) ? selected : new Date());
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const timeSlots = useMemo(() => generateTimeSlots(timeIntervals), [timeIntervals]);

    // Close on outside click
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      function handleEsc(e: KeyboardEvent) {
        if (e.key === 'Escape') setOpen(false);
      }
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('keydown', handleEsc);
      };
    }, []);

    // Sync viewDate when selected changes externally
    useEffect(() => {
      if (selected && isValid(selected)) setViewDate(selected);
    }, [selected]);

    const displayValue = useMemo(() => {
      if (!selected || !isValid(selected)) return '';
      try {
        return format(selected, dateFormat);
      } catch {
        return format(selected, 'MMM d, yyyy');
      }
    }, [selected, dateFormat]);

    const selectedTimeStr = useMemo(() => {
      if (!selected || !isValid(selected)) return null;
      return format(selected, 'h:mm aa');
    }, [selected]);

    const handleDateSelect = useCallback(
      (day: Date) => {
        if (showTimeSelect && selected) {
          // preserve existing time when selecting new date
          const d = new Date(day);
          d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
          onChange(d);
        } else {
          onChange(day);
        }
        if (!showTimeSelect) setOpen(false);
      },
      [onChange, selected, showTimeSelect]
    );

    const handleTimeSelect = useCallback(
      (slot: string) => {
        // parse "h:mm aa" → hours, minutes
        const parts = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!parts) return;
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const ampm = parts[3].toUpperCase();
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;

        const base = selected ? new Date(selected) : new Date();
        base.setHours(h, m, 0, 0);
        onChange(base);
        if (showTimeSelectOnly) setOpen(false);
      },
      [onChange, selected, showTimeSelectOnly]
    );

    const inputId = useMemo(() => `dp-${Math.random().toString(36).substr(2, 9)}`, []);

    const icon = showTimeSelectOnly ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />;

    return (
      <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
        <div ref={ref}>
          {/* Label */}
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}
              {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
            </label>
          )}

          {/* Input trigger */}
          <button
            id={inputId}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg border transition-all duration-200
              bg-white dark:bg-gray-800
              text-left text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              dark:disabled:bg-gray-900 dark:disabled:text-gray-500
              cursor-pointer
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : open
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
          >
            <span className={`flex-1 truncate ${selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{displayValue || placeholderText}</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2 shrink-0">{icon}</span>
          </button>

          {/* Error / helper */}
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          {helperText && !error && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
        </div>

        {/* Popover */}
        {open && (
          <div
            ref={popoverRef}
            className={`
              absolute z-50 mt-1.5 left-0
              rounded-2xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              shadow-2xl shadow-gray-900/10 dark:shadow-black/30
              ring-1 ring-black/5
              overflow-hidden
              animate-[fadeInScale_0.15s_ease-out]
              ${showTimeSelectOnly ? 'w-48' : 'w-max'}
            `}
          >
            <div className="flex">
              {/* Calendar panel */}
              {!showTimeSelectOnly && <CalendarGrid viewDate={viewDate} selected={selected} onSelect={handleDateSelect} onViewChange={setViewDate} minDate={minDate} maxDate={maxDate} />}

              {/* Time panel */}
              {(showTimeSelect || showTimeSelectOnly) && (
                <div className={`${!showTimeSelectOnly ? 'border-l border-gray-100 dark:border-gray-700 w-36' : 'w-full'}`}>
                  <TimeList slots={timeSlots} selected={selectedTimeStr} onSelect={handleTimeSelect} caption={timeCaption} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
