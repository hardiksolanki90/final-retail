export type JourneyPlanBase = 'day_wise' | 'week_wise';

export type WeekNumber = 'week1' | 'week2' | 'week3' | 'week4' | 'week5';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/** One customer row inside the Customers tab */
export interface JourneyPlanCustomerRow {
  id: string; // local unique id
  customerId: string; // real customer uuid — required for save
  sequence: number;
  code: string;
  customerName: string;
  mslPerform: boolean;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

/**
 * All customer rows keyed by day (Day Wise: `"monday"`) or by week+day
 * (Week Wise: `"week1-monday"`) — see `dayCustomerKey()` in CustomersTab.
 */
export type DayCustomersMap = Record<string, JourneyPlanCustomerRow[]>;

/** Full form state across all 3 tabs */
export interface JourneyPlanFullFormData {
  // Tab 1 – Overview
  journeyName: string;
  description: string;
  startDate: string;
  noEnd: boolean;
  endDate: string;
  startTime: string;
  endTime: string;

  // Tab 2 – Schedule
  journeyPlanBase: JourneyPlanBase;
  selectedWeeks: WeekNumber[];
  firstDayOfWeek: DayOfWeek;
  enforceFlag: boolean;
  salesmanId: string;

  // Tab 3 – Customers (per-day lists)
  dayCustomers: DayCustomersMap;

  uuid?: string;
  merchandiserName?: string;
  salesmanName?: string;
  status?: boolean;
}

export interface JourneyPlanFullListResponse {
  data: JourneyPlanFullFormData[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
