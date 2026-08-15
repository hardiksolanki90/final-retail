import { useState } from 'react';
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type {
  JourneyPlanFullFormData,
  DayOfWeek,
  JourneyPlanCustomerRow,
} from '../../../types/JourneyPlan';

interface Props {
  watch: UseFormWatch<JourneyPlanFullFormData>;
  setValue: UseFormSetValue<JourneyPlanFullFormData>;
}

const ALL_DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Monday' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wednesday' },
  { key: 'thursday', label: 'Thursday', short: 'Thursday' },
  { key: 'friday', label: 'Friday', short: 'Friday' },
  { key: 'saturday', label: 'Saturday', short: 'Saturday' },
  { key: 'sunday', label: 'Sunday', short: 'Sunday' },
];

// ── tiny helpers ──────────────────────────────────────────────────────────────
let rowIdCounter = 100;
function newId() {
  return String(++rowIdCounter);
}

// ── Sample data matching screenshot ──────────────────────────────────────────
const SAMPLE_ROWS: JourneyPlanCustomerRow[] = [
  {
    id: '1',
    sequence: 1,
    code: '176590',
    customerName: 'Nesto Hypermarket LLC-Br 3-Arab Mall',
    mslPerform: true,
    startTime: '19:01',
    endTime: '00:58',
  },
  {
    id: '2',
    sequence: 2,
    code: '177254',
    customerName: 'Abraj Al Taawun Hypermarket LLC',
    mslPerform: false,
    startTime: '06:50',
    endTime: '22:31',
  },
  {
    id: '3',
    sequence: 3,
    code: '185102',
    customerName: 'Souq Al Madina Hypermarket LLC',
    mslPerform: true,
    startTime: '04:43',
    endTime: '00:43',
  },
  {
    id: '4',
    sequence: 4,
    code: '185463',
    customerName: 'Trolleys Supermarket LLC-SHU.BR',
    mslPerform: true,
    startTime: '01:18',
    endTime: '01:23',
  },
  {
    id: '5',
    sequence: 5,
    code: '186450',
    customerName: 'Hyper Ramez Branch 2',
    mslPerform: true,
    startTime: '17:00',
    endTime: '05:56',
  },
];

/** Format 24h "HH:MM" → "hh:MM AM/PM" */
function fmt12(time: string): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

const inputCls =
  'block w-full px-2 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

// ── Add Customer Modal ────────────────────────────────────────────────────────
function AddCustomerModal({
  onAdd,
  onClose,
}: {
  onAdd: (row: JourneyPlanCustomerRow) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [msl, setMsl] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function handleAdd() {
    if (!code.trim() && !name.trim()) return;
    onAdd({ id: newId(), sequence: 0, code, customerName: name, mslPerform: msl, startTime, endTime });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add Customer</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} className={inputCls} placeholder="e.g. 176590" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Customer Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Customer name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
          <input type="checkbox" checked={msl} onChange={e => setMsl(e.target.checked)} className="w-4 h-4 accent-gray-900 dark:accent-white rounded" />
          MSL Perform
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Customers Tab ────────────────────────────────────────────────────────
export function CustomersTab({ watch, setValue }: Props) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('monday');
  const [showModal, setShowModal] = useState(false);
  const dayCustomers = watch('dayCustomers');

  // Initialise sample data only for Monday if empty
  const rows: JourneyPlanCustomerRow[] =
    activeDay === 'monday' && (!dayCustomers?.monday || dayCustomers.monday.length === 0)
      ? SAMPLE_ROWS
      : (dayCustomers?.[activeDay] ?? []);

  function setRows(newRows: JourneyPlanCustomerRow[]) {
    setValue('dayCustomers', {
      ...dayCustomers,
      [activeDay]: newRows,
    } as JourneyPlanFullFormData['dayCustomers']);
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

  function handleCopyToAll() {
    const copied: JourneyPlanFullFormData['dayCustomers'] = {} as any;
    ALL_DAYS.forEach(({ key }) => {
      copied[key] = rows.map((r, i) => ({ ...r, id: newId(), sequence: i + 1 }));
    });
    setValue('dayCustomers', copied);
  }

  function handleMslChange(id: string, checked: boolean) {
    setRows(rows.map((r) => (r.id === id ? { ...r, mslPerform: checked } : r)));
  }

  function handleTimeChange(
    id: string,
    field: 'startTime' | 'endTime',
    value: string
  ) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <div className="space-y-4">
      {/* Day Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border-color)]">
        {ALL_DAYS.map(({ key, short }, idx) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDay(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap
              ${
                activeDay === key
                  ? 'text-[var(--text-primary)] border-b-2 border-primary-500 -mb-px'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
                ${
                  activeDay === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }`}
            >
              {idx + 1}
            </span>
            {short}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyToAll}
          className="px-3 py-1.5 text-sm font-medium rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          Copy to all Days
        </button>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-sm font-medium rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Add Customers
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-[var(--border-color)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Sequence
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  Code
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" />
                  </svg>
                </span>
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  Customer
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" />
                  </svg>
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
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                >
                  No customers added. Click "Add Customers" to begin.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-primary)]">
                    {row.sequence}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-primary)]">
                    {row.code}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-primary)] max-w-[200px]">
                    {row.customerName}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={row.mslPerform}
                      onChange={(e) => handleMslChange(row.id, e.target.checked)}
                      className="w-4 h-4 accent-gray-900 dark:accent-white rounded"
                    />
                  </td>
                  {/* Start Time editable */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text-primary)] text-sm min-w-[80px]">
                        {fmt12(row.startTime)}
                      </span>
                      <button
                        type="button"
                        title="Edit start time"
                        onClick={() => {
                          const t = prompt('Start time (HH:MM)', row.startTime);
                          if (t !== null) handleTimeChange(row.id, 'startTime', t);
                        }}
                        className="p-0.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  {/* End Time editable */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text-primary)] text-sm min-w-[80px]">
                        {fmt12(row.endTime)}
                      </span>
                      <button
                        type="button"
                        title="Edit end time"
                        onClick={() => {
                          const t = prompt('End time (HH:MM)', row.endTime);
                          if (t !== null) handleTimeChange(row.id, 'endTime', t);
                        }}
                        className="p-0.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 text-[var(--text-primary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <AddCustomerModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
