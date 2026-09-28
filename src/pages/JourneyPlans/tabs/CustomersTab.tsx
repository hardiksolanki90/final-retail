import { useState, useEffect } from 'react';
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Users, Copy, Plus, Trash2, Search } from 'lucide-react';
import type {
  JourneyPlanFullFormData,
  DayOfWeek,
  WeekNumber,
  JourneyPlanCustomerRow,
} from '../../../types/JourneyPlan';
import { Modal } from '../../../components/ui/Modal';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Input } from '../../../components/ui/Input';
import { Button, CancelButton } from '../../../components/ui/Button';

interface Props {
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
  customers: SelectOption[];
  customersLoading?: boolean;
  customersLoadingMore?: boolean;
  customersHasMore?: boolean;
  onCustomersLoadMore?: () => void;
  onCustomersSearchChange?: (query: string) => void;
}

const ALL_DAYS: { key: DayOfWeek; short: string }[] = [
  { key: 'monday', short: 'Mon' },
  { key: 'tuesday', short: 'Tue' },
  { key: 'wednesday', short: 'Wed' },
  { key: 'thursday', short: 'Thu' },
  { key: 'friday', short: 'Fri' },
  { key: 'saturday', short: 'Sat' },
  { key: 'sunday', short: 'Sun' },
];

const ALL_WEEKS: { key: WeekNumber; label: string }[] = [
  { key: 'week1', label: 'Week 1' },
  { key: 'week2', label: 'Week 2' },
  { key: 'week3', label: 'Week 3' },
  { key: 'week4', label: 'Week 4' },
  { key: 'week5', label: 'Week 5' },
];

// Day Wise keys the row map by plain day ("monday"); Week Wise keys it by
// week+day ("week1-monday") so each week keeps an independent customer list.
function dayCustomerKey(day: DayOfWeek, week?: WeekNumber | null) {
  return week ? `${week}-${day}` : day;
}

// Rotates the day chips so the week starts on the Schedule tab's chosen
// "First Day of the Week" (e.g. Friday -> Fri, Sat, Sun, Mon, Tue, Wed, Thu).
function rotateFromFirstDay(days: typeof ALL_DAYS, firstDay?: DayOfWeek) {
  const idx = days.findIndex((d) => d.key === firstDay);
  if (idx <= 0) return days;
  return [...days.slice(idx), ...days.slice(0, idx)];
}

// ── tiny helpers ──────────────────────────────────────────────────────────────
let rowIdCounter = 100;
function newId() {
  return String(++rowIdCounter);
}

// ── Add Customer Modal ────────────────────────────────────────────────────────
function AddCustomerModal({
  isOpen,
  customers,
  customersLoading,
  customersLoadingMore,
  customersHasMore,
  onCustomersLoadMore,
  onCustomersSearchChange,
  onAdd,
  onClose,
}: {
  isOpen: boolean;
  customers: SelectOption[];
  customersLoading?: boolean;
  customersLoadingMore?: boolean;
  customersHasMore?: boolean;
  onCustomersLoadMore?: () => void;
  onCustomersSearchChange?: (query: string) => void;
  onAdd: (row: JourneyPlanCustomerRow) => void;
  onClose: () => void;
}) {
  const [customerId, setCustomerId] = useState('');
  const [msl, setMsl] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function reset() {
    setCustomerId('');
    setMsl(false);
    setStartTime('');
    setEndTime('');
  }

  function handleAdd() {
    const selected = customers.find((c) => c.value === customerId);
    if (!selected) return;
    onAdd({
      id: newId(),
      customerId: String(selected.value),
      sequence: 0,
      code: selected.code ?? '',
      customerName: selected.label,
      mslPerform: msl,
      startTime,
      endTime,
    });
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add Customer"
      size="sm"
      footer={
        <>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <Button onClick={handleAdd} disabled={!customerId}>
            Add
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Customer"
          value={customerId}
          onChange={(e) => setCustomerId(String(e.target.value))}
          options={customers}
          placeholder="Search customer..."
          isLoading={customersLoading}
          isLoadingMore={customersLoadingMore}
          hasMore={customersHasMore}
          onLoadMore={onCustomersLoadMore}
          onSearchChange={onCustomersSearchChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input type="time" label="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input type="time" label="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <Checkbox label="MSL Perform" checked={msl} onChange={(e) => setMsl(e.target.checked)} />
      </div>
    </Modal>
  );
}

// ── Main Customers Tab ────────────────────────────────────────────────────────
export function CustomersTab({
  watch,
  setValue,
  customers,
  customersLoading,
  customersLoadingMore,
  customersHasMore,
  onCustomersLoadMore,
  onCustomersSearchChange,
}: Props) {
  const journeyPlanBase = watch('journeyPlanBase');
  const isWeekWise = journeyPlanBase === 'week_wise';
  const selectedWeeks = watch('selectedWeeks') ?? [];
  const firstDayOfWeek = watch('firstDayOfWeek');
  const orderedDays = rotateFromFirstDay(ALL_DAYS, firstDayOfWeek);

  const [activeDay, setActiveDay] = useState<DayOfWeek>(firstDayOfWeek || 'monday');
  const [activeWeek, setActiveWeek] = useState<WeekNumber | null>(null);
  const [showModal, setShowModal] = useState(false);
  const dayCustomers = watch('dayCustomers');
  const overviewStartTime = watch('startTime');
  const overviewEndTime = watch('endTime');

  // Keep activeDay synced to the first day in the rotated list
  // whenever firstDayOfWeek changes in the Schedule tab.
  useEffect(() => {
    if (firstDayOfWeek) {
      setActiveDay(firstDayOfWeek);
    }
  }, [firstDayOfWeek]);

  // Keep activeWeek pinned to a week that's actually selected in the
  // Schedule tab (weeks can be picked/unpicked while this tab is open).
  useEffect(() => {
    if (!isWeekWise) return;
    if (activeWeek && selectedWeeks.includes(activeWeek)) return;
    setActiveWeek(selectedWeeks[0] ?? null);
  }, [isWeekWise, selectedWeeks, activeWeek]);

  const currentWeek = isWeekWise ? activeWeek : null;
  const currentKey = dayCustomerKey(activeDay, currentWeek);
  const noWeekSelected = isWeekWise && !currentWeek;
  const rows: JourneyPlanCustomerRow[] = noWeekSelected ? [] : dayCustomers?.[currentKey] ?? [];

  // Render every customer the salesman's API returned straight into the
  // active day's list — "Add Customer" only needs to append extras on top,
  // not be the only way to populate the list. Seed each row's time range
  // from the Overview tab's Start/End Time, if set.
  useEffect(() => {
    if (noWeekSelected) return;
    if (rows.length === 0 && customers.length > 0) {
      setValue('dayCustomers', {
        ...dayCustomers,
        [currentKey]: customers.map((c, i) => ({
          id: newId(),
          customerId: String(c.value),
          sequence: i + 1,
          code: c.code ?? '',
          customerName: c.label,
          mslPerform: false,
          startTime: overviewStartTime ?? '',
          endTime: overviewEndTime ?? '',
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, currentKey, noWeekSelected, overviewStartTime, overviewEndTime]);

  function setRows(newRows: JourneyPlanCustomerRow[]) {
    setValue('dayCustomers', {
      ...dayCustomers,
      [currentKey]: newRows,
    });
  }

  function handleDelete(id: string) {
    const updated = rows
      .filter((r) => r.id !== id)
      .map((r, i) => ({ ...r, sequence: i + 1 }));
    setRows(updated);
  }

  function handleAdd(row: JourneyPlanCustomerRow) {
    const newRow: JourneyPlanCustomerRow = { ...row, sequence: rows.length + 1 };
    setRows([...rows, newRow]);
  }

  // Copies the active day's list across all 7 days — within the active
  // week only when Week Wise, so it never overwrites other weeks.
  function handleCopyToAll() {
    const copied: JourneyPlanFullFormData['dayCustomers'] = { ...dayCustomers };
    ALL_DAYS.forEach(({ key }) => {
      copied[dayCustomerKey(key, currentWeek)] = rows.map((r, i) => ({ ...r, id: newId(), sequence: i + 1 }));
    });
    setValue('dayCustomers', copied);
  }

  function handleMslChange(id: string, checked: boolean) {
    setRows(rows.map((r) => (r.id === id ? { ...r, mslPerform: checked } : r)));
  }

  function handleTimeChange(id: string, field: 'startTime' | 'endTime', value: string) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <div className="space-y-4">
      {/* Week chip selector — Week Wise only */}
      {isWeekWise && (
        <div className="flex flex-wrap gap-2">
          {ALL_WEEKS.filter(({ key }) => selectedWeeks.includes(key)).map(({ key, label }) => {
            const count = ALL_DAYS.reduce((sum, { key: day }) => sum + (dayCustomers?.[dayCustomerKey(day, key)]?.length ?? 0), 0);
            const isActive = activeWeek === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveWeek(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {noWeekSelected ? (
        <div className="flex flex-col items-center justify-center gap-2 text-center py-12 rounded-lg border border-dashed border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)]">
            No weeks selected. Choose weeks in the Schedule tab first.
          </p>
        </div>
      ) : (
        <>
          {/* Day chip selector */}
          <div className="flex flex-wrap gap-2">
            {orderedDays.map(({ key, short }, idx) => {
              const count = dayCustomers?.[dayCustomerKey(key, currentWeek)]?.length ?? 0;
              const isActive = activeDay === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDay(key)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {short}
                  {count > 0 && (
                    <span className={`text-[11px] font-semibold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />} onClick={handleCopyToAll}>
              Copy to all Days
            </Button>
            <Button type="button" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowModal(true)}>
              Add Customers
            </Button>
          </div>

          {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Seq
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  Code
                  <Search className="w-3 h-3" />
                </span>
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  Customer
                  <Search className="w-3 h-3" />
                </span>
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                MSL Perform
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Start Time
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                End Time
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      No customers added for this day yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Add a customer
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-4 py-2.5 text-[var(--text-primary)]">{row.sequence}</td>
                  <td className="px-4 py-2.5 text-[var(--text-primary)]">{row.code || '—'}</td>
                  <td className="px-4 py-2.5 text-[var(--text-primary)] max-w-[220px] truncate">
                    {row.customerName}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={row.mslPerform}
                        onChange={(e) => handleMslChange(row.id, e.target.checked)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="time"
                      value={row.startTime}
                      onChange={(e) => handleTimeChange(row.id, 'startTime', e.target.value)}
                      className="px-2 py-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="time"
                      value={row.endTime}
                      onChange={(e) => handleTimeChange(row.id, 'endTime', e.target.value)}
                      className="px-2 py-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 text-[var(--text-primary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      <AddCustomerModal
        isOpen={showModal}
        customers={customers}
        customersLoading={customersLoading}
        customersLoadingMore={customersLoadingMore}
        customersHasMore={customersHasMore}
        onCustomersLoadMore={onCustomersLoadMore}
        onCustomersSearchChange={onCustomersSearchChange}
        onAdd={handleAdd}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
