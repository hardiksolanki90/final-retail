export interface JourneyPlan {
  id?: string;
  uuid?: string;
  planCode: string;
  planName: string;
  salesmanId: string;
  routeId: string;
  startDate: string;
  endDate: string;
  customers: string[];
  visitFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  notes?: string;
  status?: 'active' | 'inactive' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface JourneyPlanFormData {
  planCode: string;
  planName: string;
  salesmanId: string;
  routeId: string;
  startDate: string;
  endDate: string;
  customers: string[];
  visitFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  notes?: string;
  status?: 'active' | 'inactive';
}

export interface JourneyPlanListResponse {
  data: JourneyPlan[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

// ─── New types for the multi-step Add form ────────────────────────────────────

export type JourneyPlanBase = 'day_wise' | 'week_wise';

export type WeekNumber = 'week1' | 'week2' | 'week3' | 'week4' | 'week5';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/** One customer row inside the Customers tab */
export interface JourneyPlanCustomerRow {
  id: string;              // local unique id
  sequence: number;
  code: string;
  customerName: string;
  mslPerform: boolean;
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
}

/** All customer rows keyed by day */
export type DayCustomersMap = Record<DayOfWeek, JourneyPlanCustomerRow[]>;

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
  merchandiserId: string;

  // Tab 3 – Customers (per-day lists)
  dayCustomers: DayCustomersMap;
}
