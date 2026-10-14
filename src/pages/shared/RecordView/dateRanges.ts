/** Period choices for the record view's date filter; `rangeDates` turns one into from / to days (local time, inclusive). */
export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-7', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-30', label: 'Last 30 Days' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-365', label: 'Last 365 Days' },
  { value: 'all', label: 'All Time' },
];

export const DEFAULT_RANGE = 'last-365';

const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function rangeDates(range: string, today = new Date()): { from?: string; to?: string } {
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const back = (days: number) => ({ from: day(new Date(y, m, d - days)), to: day(today) });
  switch (range) {
    case 'today':
      return back(0);
    case 'yesterday':
      return { from: day(new Date(y, m, d - 1)), to: day(new Date(y, m, d - 1)) };
    case 'this-week':
      return back((today.getDay() + 6) % 7);
    case 'last-7':
      return back(6);
    case 'this-month':
      return { from: day(new Date(y, m, 1)), to: day(today) };
    case 'last-month':
      return { from: day(new Date(y, m - 1, 1)), to: day(new Date(y, m, 0)) };
    case 'last-30':
      return back(29);
    case 'this-year':
      return { from: day(new Date(y, 0, 1)), to: day(today) };
    case 'last-365':
      return back(364);
    default:
      return {};
  }
}
