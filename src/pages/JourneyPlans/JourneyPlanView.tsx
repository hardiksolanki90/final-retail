import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ShieldAlert } from 'lucide-react';
import type { DayCustomersMap, JourneyPlanCustomerRow, JourneyPlanFullFormData, JourneyPlanFullListResponse } from '../../types/JourneyPlan';
import { getJourneyPlanList } from '../../api/JourneyPlanApi';
import { useJourneyPlanDetail } from '../../hooks/JourneyPlans/useJourneyPlans';
import { cachedFirstPage } from '../../lib/recordCache';
import { EntityViewDrawer } from '../shared/RecordView/EntityViewDrawer';
import { API_PAGE_SIZE } from '../shared/RecordView/RecordRail';
import { InfoSection, InfoSectionsSkeleton, PendingValue } from '../shared/RecordView/InfoSection';
import { RecordTable, type RecordColumn } from '../shared/RecordView/RecordTable';
import { StatusPill } from '../shared/RecordView/StatusPill';

const fetchPlans = async (page: number, search: string) => {
  const res = await getJourneyPlanList(page, search || undefined, API_PAGE_SIZE);
  return { items: res.data, hasMore: page < res.lastPage };
};

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/** One journey plan's customers by day: weeks (empty for a day-wise plan) → days (week start first) → rows. Only weeks / days that have customers. */
function scheduleOf(dayCustomers: DayCustomersMap | undefined, firstDay?: string) {
  const start = Math.max(DAYS.indexOf(firstDay ?? 'monday'), 0);
  const order = [...DAYS.slice(start), ...DAYS.slice(0, start)];
  const byWeek = new Map<string, Map<string, JourneyPlanCustomerRow[]>>();
  Object.entries(dayCustomers ?? {}).forEach(([key, rows]) => {
    if (!rows || rows.length === 0) return;
    const [week, day] = key.includes('-') ? key.split('-') : ['', key];
    byWeek.set(week, (byWeek.get(week) ?? new Map()).set(day, rows));
  });
  const weeks = [...byWeek.keys()].sort();
  return { weeks, days: (week: string) => order.filter((d) => byWeek.get(week)?.has(d)), rows: (week: string, day: string) => byWeek.get(week)?.get(day) ?? [] };
}

const tabCls = (active: boolean) =>
  `relative shrink-0 cursor-pointer whitespace-nowrap px-3 pb-2 pt-2.5 leading-5 transition-colors ${active ? 'font-semibold text-[var(--rv-accent)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--rv-accent)]' : 'text-[var(--rv-secondary)] hover:text-[var(--rv-ink)]'}`;

/** Schedule & customers: Week 1…5 tabs (week-wise plans), a day tab row beneath, and that day's customers in a scrolling table. */
function ScheduleSection({ dayCustomers, firstDay }: { dayCustomers?: DayCustomersMap; firstDay?: string }) {
  const schedule = scheduleOf(dayCustomers, firstDay);
  const [pickedWeek, setPickedWeek] = useState('');
  const [pickedDay, setPickedDay] = useState('');
  const week = schedule.weeks.includes(pickedWeek) ? pickedWeek : (schedule.weeks[0] ?? '');
  const days = schedule.days(week);
  const day = days.includes(pickedDay) ? pickedDay : (days[0] ?? '');
  const rows = schedule.rows(week, day);

  return (
    <section className="overflow-hidden rounded-[4px] border border-[var(--rv-border)]">
      <h3 className="flex h-10 items-center bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]">Schedule &amp; Customers</h3>
      {schedule.weeks.length === 0 ? (
        <p className="px-[14px] py-8 text-center text-[var(--rv-secondary)]">No customers are scheduled in this plan yet</p>
      ) : (
        <>
          {week && (
            <div role="tablist" aria-label="Week" className="flex gap-1 overflow-x-auto border-b border-[var(--rv-line)] px-[14px]">
              {schedule.weeks.map((w) => (
                <button key={w} type="button" role="tab" aria-selected={w === week} onClick={() => setPickedWeek(w)} className={tabCls(w === week)}>
                  {w.replace('week', 'Week ')}
                </button>
              ))}
            </div>
          )}
          <div role="tablist" aria-label="Day" className="flex gap-1 overflow-x-auto border-b border-[var(--rv-line)] bg-[var(--rv-tint)] px-[14px]">
            {days.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={d === day} onClick={() => setPickedDay(d)} className={tabCls(d === day)}>
                {capitalise(d)}
                <span className="ml-1.5 rounded-full bg-[var(--rv-accent-soft)] px-1.5 py-0.5 text-xs font-medium text-[var(--rv-accent)]">{schedule.rows(week, d).length}</span>
              </button>
            ))}
          </div>
          <div className="max-h-[60vh] min-h-[320px] overflow-auto">
            <RecordTable columns={customerColumns} rows={rows} rowKey={(c, i) => c.id || String(i)} emptyLabel="No customers on this day" bare />
          </div>
        </>
      )}
    </section>
  );
}

const customerColumns: RecordColumn<JourneyPlanCustomerRow>[] = [
  { key: 'sequence', label: '#', width: 'w-14', render: (c) => c.sequence },
  { key: 'customer', label: 'Customer', render: (c) => <span className="font-semibold text-[var(--rv-ink)]">{c.customerName || 'Unknown customer'}</span> },
  { key: 'code', label: 'Code', render: (c) => c.code || '—' },
  { key: 'time', label: 'Visit Time', render: (c) => (c.startTime && c.endTime ? `${c.startTime} - ${c.endTime}` : 'All day') },
  { key: 'msl', label: 'MSL Perform', render: (c) => <StatusPill label={c.mslPerform ? 'Yes' : 'No'} tone={c.mslPerform ? 'success' : 'neutral'} /> },
];

/** Journey plan view (route /journey-plan/view/:uuid): merged single tab with overview + schedule. */
export function JourneyPlanView() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const query = useJourneyPlanDetail(uuid);
  // The Journey Plan page's own first page from the cache, taken once on opening: the left list starts from it instead of asking again.
  const queryClient = useQueryClient();
  const [cached] = useState(() => cachedFirstPage<JourneyPlanFullListResponse>(queryClient, 'journey-plans', (k) => k[1] === 1 && k[2] === ''));
  const data = query.data ?? null;
  // The list row that opened this view (passed in router state): names the plan at once while the full record loads.
  const stateRow = (useLocation().state as { row?: JourneyPlanFullFormData } | null)?.row;
  const row = stateRow?.uuid === uuid ? stateRow : undefined;
  const base = data ?? row;
  const pend = <PendingValue />;
  const title = base?.journeyName || null;
  const days = Object.entries(data?.dayCustomers ?? {}).filter(([, customers]) => customers && customers.length > 0);

  const content =
    query.isError && !data && !row ? (
      <div className="flex flex-col items-center gap-3 py-20 text-[var(--rv-secondary)]">
        <ShieldAlert className="h-8 w-8 text-[var(--rv-danger)]" />
        <p>Couldn't load this journey plan.</p>
      </div>
    ) : !base ? (
      <div className="mt-3 space-y-4">
        <InfoSectionsSkeleton titles={['General Details', 'Timing Details', 'Schedule']} />
      </div>
    ) : (
      <div className="mt-3 space-y-4">
        {/* ── Overview: the list row's values at once, the rest once the full record arrives ── */}
        <InfoSection
          title="General Details"
          rows={[
            { label: 'Journey Name', value: base.journeyName },
            { label: 'Description', value: data ? data.description : pend },
            { label: 'Plan Base', value: data ? data.journeyPlanBase?.replace('_', ' ') : pend },
            { label: 'Merchandiser', value: data ? data.merchandiserName : pend },
            { label: 'Enforced Sequence', value: data ? (data.enforceFlag ? 'Yes' : 'No') : pend },
            { label: 'Customers', value: data ? days.reduce((n, [, customers]) => n + customers.length, 0) : pend },
            { label: 'Status', value: <StatusPill label={base.status ? 'Active' : 'Inactive'} tone={base.status ? 'success' : 'neutral'} /> },
          ]}
        />
        <InfoSection
          title="Timing Details"
          rows={[
            { label: 'Start Date', value: base.startDate },
            { label: 'End Date', value: base.noEnd ? 'No end date' : base.endDate },
            { label: 'Start Time', value: data ? data.startTime : pend },
            { label: 'End Time', value: data ? data.endTime : pend },
          ]}
        />

        {/* ── Schedule & Customers ── */}
        {data ? <ScheduleSection dayCustomers={data.dayCustomers} firstDay={data.firstDayOfWeek} /> : <InfoSectionsSkeleton titles={['Schedule & Customers']} />}
      </div>
    );

  return (
    <EntityViewDrawer<JourneyPlanFullFormData>
      isOpen
      onClose={() => navigate('/journey-plan')}
      title={title}
      rail={{
        queryKey: `journey-plan-${API_PAGE_SIZE}`,
        seed: cached ? { items: cached.data.data, hasMore: cached.data.currentPage < cached.data.lastPage, updatedAt: cached.updatedAt } : null,
        placeholder: 'Search Journey Plans',
        fetchPage: fetchPlans,
        toCard: (p) => ({ key: p.uuid ?? '', title: p.journeyName, subtitle: p.salesmanName || null, amount: p.status ? 'Active' : 'Inactive' }),
        selectedKey: uuid,
        onSelect: (p) => {
          if (p.uuid) navigate(`/journey-plan/view/${p.uuid}`, { state: { row: p } });
        },
      }}
      onEdit={() => navigate(`/journey-plan/edit/${uuid}`)}
      editPermission="journey-plan.edit"
      tabs={[{ key: 'overview', label: 'Overview', icon: CalendarDays, content }]}
    />
  );
}
