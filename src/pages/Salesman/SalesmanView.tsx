import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, ShieldAlert, UserRound } from 'lucide-react';
import type { Salesman, SalesmanListResponse, SalesmanLoginHistory } from '../../types/Salesman';
import { getSalesmanList } from '../../api/SalesmanApi';
import { useSalesmanDetail } from '../../hooks/Salesman/useSalesmanDetail';
import { useSalesmanLoginHistory } from '../../hooks/Salesman/useSalesmanLoginHistory';
import { cachedFirstPage } from '../../lib/recordCache';
import { EntityViewDrawer } from '../shared/RecordView/EntityViewDrawer';
import { API_PAGE_SIZE } from '../shared/RecordView/RecordRail';
import { InfoSection, InfoSectionsSkeleton, PendingValue } from '../shared/RecordView/InfoSection';
import { RecordTable, type RecordColumn } from '../shared/RecordView/RecordTable';
import { StatusPill } from '../shared/RecordView/StatusPill';
import SalesmanAdd from './SalesmanAdd';

const fullName = (s: Salesman) => s.user?.fullName || [s.user?.firstname, s.user?.lastname].filter(Boolean).join(' ') || 'Unknown';

const fetchSalesmen = async (page: number, search: string, perPage: number) => {
  const res = await getSalesmanList(page, search || undefined, perPage);
  return { items: res.data, hasMore: res.meta.has_more_pages };
};

const loginColumns: RecordColumn<SalesmanLoginHistory>[] = [
  { key: 'loginAt', label: 'Date & Time', render: (l) => l.loginAt ?? '—' },
  { key: 'appVersion', label: 'Version', render: (l) => l.appVersion ?? '—' },
  { key: 'deviceName', label: 'Device Name', render: (l) => l.deviceName ?? '—' },
  { key: 'ip', label: 'IP Address', render: (l) => l.ip ?? '—' },
];

/** The Login Info tab: its own request, made only once the tab is opened. */
function LoginInfoTab({ userId }: { userId?: number }) {
  const logins = useSalesmanLoginHistory(userId);
  return (
    <div className="mt-[17px]">
      <RecordTable columns={loginColumns} rows={logins.data ?? []} rowKey={(l) => String(l.id)} isLoading={logins.isLoading} emptyLabel="No login history available" />
    </div>
  );
}

/** Salesman / merchandiser view (route /salesman/view/:uuid): every salesman on the left; Profile and Login Info tabs on the right. */
export function SalesmanView() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { salesman, isLoading, isError } = useSalesmanDetail(uuid);
  // The Salesman page's own first page (no search / filters) from the cache, taken once on opening: the left list starts from it, at that page's size, instead of asking again.
  const queryClient = useQueryClient();
  const [cached] = useState(() => cachedFirstPage<SalesmanListResponse>(queryClient, 'salesman-list', (k) => k[1] === '' && k[2] === 1 && !Object.values((k[4] ?? {}) as object).some(Boolean)));
  const pageSize = cached ? Number(cached.key[3]) : API_PAGE_SIZE;
  // The list row that opened this view (passed in router state): names the salesman at once while the full record loads.
  const stateRow = (useLocation().state as { row?: Salesman } | null)?.row;
  const row = stateRow?.uuid === uuid ? stateRow : undefined;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const base = salesman ?? row;
  const entityLabel = base?.salesmanType?.name === 'Merchandiser' ? 'Merchandiser' : 'Salesman';
  const title = base ? [base.salesmanCode, fullName(base)].filter(Boolean).join(' - ') : null;
  const full = Boolean(salesman);
  const pend = <PendingValue />;
  // A value from the full record; until it arrives, the row's value if the list carries one, else a placeholder.
  const val = (detail: ReactNode, fromRow?: ReactNode) => (full ? detail : (fromRow ?? pend));

  const profile =
    isError && !base ? (
      <div className="flex flex-col items-center gap-3 py-20 text-[var(--rv-secondary)]">
        <ShieldAlert className="h-8 w-8 text-[var(--rv-danger)]" />
        <p>Couldn't load this {entityLabel.toLowerCase()}.</p>
      </div>
    ) : isLoading && !base ? (
      <InfoSectionsSkeleton titles={['General Details', 'Assignment & Roles', 'Security & Access']} />
    ) : base ? (
      <div className="mt-3 space-y-4">
        <InfoSection
          title="General Details"
          rows={[
            { label: `${entityLabel} Name`, value: fullName(base) },
            { label: `${entityLabel} Code`, value: base.salesmanCode },
            { label: 'Employee Code', value: base.employeeCode },
            { label: 'Designation', value: base.designation },
            { label: 'Email', value: base.user?.email },
            { label: 'Mobile', value: base.user?.mobile },
            { label: 'Joining Date', value: base.joiningDate },
            { label: 'Status', value: <StatusPill label={base.status ? 'Active' : 'Inactive'} tone={base.status ? 'success' : 'neutral'} /> },
          ]}
        />
        <InfoSection
          title="Assignment & Roles"
          rows={[
            { label: `${entityLabel} Type`, value: base.salesmanType?.name },
            { label: `${entityLabel} Role`, value: base.salesmanRole?.name },
            { label: `${entityLabel} Category`, value: val(base.salesmanCategory?.name) },
            { label: 'Assigned Route', value: base.route?.name },
            { label: 'Supervisor', value: base.supervisor?.name },
          ]}
        />
        <InfoSection
          title="Security & Access"
          rows={[
            {
              label: 'Ordering',
              value: val(salesman && <StatusPill label={salesman.canTakeOrders ? 'Ready for orders' : 'Cannot take orders'} tone={salesman.canTakeOrders ? 'success' : 'danger'} />),
            },
            {
              label: 'Block Status',
              value: val(salesman && (salesman.isBlocked ? <StatusPill label={`Blocked (${salesman.blockStartDate || '?'} to ${salesman.blockEndDate || '?'})`} tone="danger" /> : 'Not blocked')),
            },
            { label: 'Login Type', value: val(salesman?.user?.loginType) },
          ]}
        />
      </div>
    ) : null;

  return (
    <>
      <EntityViewDrawer<Salesman>
        isOpen
        onClose={() => navigate('/salesman')}
        title={title}
        rail={{
          queryKey: `salesman-${pageSize}`,
          seed: cached ? { items: cached.data.data, hasMore: cached.data.meta.has_more_pages, updatedAt: cached.updatedAt } : null,
          placeholder: 'Search Salesmen',
          fetchPage: (page, search) => fetchSalesmen(page, search, pageSize),
          toCard: (s) => ({ key: s.uuid, title: fullName(s), subtitle: s.salesmanCode || null, amount: s.route?.name ?? null }),
          selectedKey: uuid,
          onSelect: (s) => navigate(`/salesman/view/${s.uuid}`, { state: { row: s } }),
          keyboard: !isEditOpen,
        }}
        onEdit={() => setIsEditOpen(true)}
        editPermission="salesman.edit"
        tabs={[
          { key: 'profile', label: 'Profile', icon: UserRound, content: profile },
          { key: 'logins', label: 'Login Info', icon: Clock, content: <LoginInfoTab userId={salesman?.userId} /> },
        ]}
      />
      <SalesmanAdd isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} data={salesman ?? null} />
    </>
  );
}

export default SalesmanView;
