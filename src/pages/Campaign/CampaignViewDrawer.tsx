import { useState } from 'react';
import {
  CircleUserRound,
  Image as ImageIcon,
  SquarePen,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';
import type { CampaignRecord } from '../../api/CampaignApi';
import { getCampaignDetails, getCampaignList } from '../../api/CampaignApi';
import { useAuth } from '../../context/AuthContext';
import { useMoney } from '../../hooks/Currency/useMoney';
import { CAMPAIGN_DETAIL_KEY } from '../../hooks/Campaign/useCampaignDetail';
import { RecordViewDrawer, type RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { StatusPill } from '../shared/RecordView/StatusPill';

const formatDateTime = (val?: string | null): string => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return val;
  }
};

const fetchCampaigns = async (page: number, search: string, pageSize: number) => {
  const res = await getCampaignList(page, pageSize, search ? { search } : {});
  return { items: res.data, hasMore: res.currentPage < res.lastPage };
};

/* ── Tab 1: Overview (Includes Campaign Info, Customer, Salesman & Remarks) ───────────────────── */
function OverviewTab({ data, row }: { data: CampaignRecord | null; row: any | null }) {
  const { format } = useMoney();
  const shown = data ?? row;

  if (!shown) {
    return (
      <InfoSectionsSkeleton
        titles={['Campaign Information', 'Customer Details', 'Salesman Details', 'Feedback & Remarks']}
      />
    );
  }

  const code = shown.campaign_id || shown.campaignCode || shown.code || `CAM-${shown.id ?? ''}`;
  const statusStr = String(shown.status ?? 'active').toLowerCase();
  const isActive = statusStr === '1' || statusStr === 'active';
  const rawStart = shown.start_date || shown.startDate || shown.date;
  const rawEnd = shown.end_date || shown.endDate;

  const cust = shown.customer;
  const sm = shown.salesman;

  const customerName =
    [cust?.firstname, cust?.lastname].filter(Boolean).join(' ') ||
    shown.customerName ||
    shown.customer ||
    '—';

  const customerCode =
    cust?.customer_code ||
    cust?.customerinfo?.customer_code ||
    '';

  const salesmanName =
    sm?.name ||
    [sm?.firstname, sm?.lastname].filter(Boolean).join(' ') ||
    shown.salesmanName ||
    shown.salesman ||
    '—';

  const salesmanCode =
    sm?.salesman_code ||
    sm?.salesmanCode ||
    sm?.salesmaninfo?.salesman_code ||
    '';

  return (
    <div className="mt-3 space-y-4">
      {/* 1. Campaign Information */}
      <InfoSection
        title="Campaign Information"
        rows={[
          { label: 'Campaign Code', value: <span className="font-mono font-medium">{code}</span> },
          { label: 'Campaign Type', value: shown.type || '—' },
          {
            label: 'Budget',
            value: shown.budget !== null && shown.budget !== undefined && shown.budget !== '' ? format(shown.budget) : '—',
          },
          {
            label: 'Status',
            value: (
              <StatusPill
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            ),
          },
          { label: 'Start Date & Time', value: formatDateTime(rawStart) },
          { label: 'End Date & Time', value: formatDateTime(rawEnd) },
          { label: 'Created At', value: formatDateTime(shown.created_at) },
        ]}
      />

      {/* 2. Customer Details */}
      <InfoSection
        title="Customer Details"
        rows={[
          { label: 'Customer Name', value: customerName },
          { label: 'Shop Name', value: cust?.shop_name || '—' },
          {
            label: 'Customer Code',
            value: customerCode ? <span className="font-mono font-medium">{customerCode}</span> : '—',
          },
          { label: 'Mobile / Phone', value: cust?.phone_number || '—' },
          { label: 'Email Address', value: cust?.email || '—' },
          { label: 'Office Address', value: cust?.address || '—' },
        ]}
      />

      {/* 3. Salesman Details */}
      <InfoSection
        title="Salesman Details"
        rows={[
          { label: 'Salesman Name', value: salesmanName },
          {
            label: 'Salesman Code',
            value: salesmanCode ? <span className="font-mono font-medium">{salesmanCode}</span> : '—',
          },
          { label: 'Mobile / Phone', value: sm?.phone_number || '—' },
          { label: 'Email Address', value: sm?.email || '—' },
        ]}
      />

      {/* 4. Feedback & Remarks */}
      <InfoSection title="Feedback & Remarks">
        <div className="p-4 text-sm text-[var(--rv-ink)]">
          {shown.feedback ? (
            <p className="whitespace-pre-line leading-relaxed">{shown.feedback}</p>
          ) : (
            <p className="italic text-[var(--rv-muted)]">No feedback or remarks provided.</p>
          )}
        </div>
      </InfoSection>
    </div>
  );
}

/* ── Tab 2: Pictures & Gallery ─────────────────────────────────── */
function PicturesTab({ data, row }: { data: CampaignRecord | null; row: any | null }) {
  const shown = data ?? row;
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);

  const images: string[] = [];
  if (shown?.images && Array.isArray(shown.images)) {
    images.push(...shown.images);
  }
  if (shown?.campaign_picture_image && Array.isArray(shown.campaign_picture_image)) {
    shown.campaign_picture_image.forEach((img: any) => {
      const src = img.image_string || img.image || img.url;
      if (src && !images.includes(src)) images.push(src);
    });
  }
  if (shown?.image && typeof shown.image === 'string' && !images.includes(shown.image)) {
    images.push(shown.image);
  }

  if (images.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--rv-border)] p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--rv-hover)] text-[var(--rv-muted)]">
          <ImageIcon className="h-7 w-7" />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-[var(--rv-text)]">No Pictures Attached</h4>
        <p className="mt-1 text-xs text-[var(--rv-muted)] max-w-sm">
          No campaign images or marketing photographs have been uploaded for this campaign yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--rv-text)]">
          Campaign Media ({images.length} {images.length === 1 ? 'image' : 'images'})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImgIndex(idx)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--rv-border)] bg-[var(--rv-hover)] cursor-pointer transition-all hover:shadow-md"
          >
            <img
              src={imgUrl}
              alt={`Campaign picture ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
            <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImgIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedImgIndex(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-sm font-medium">
                Photo {selectedImgIndex + 1} of {images.length}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={images[selectedImgIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded p-1.5 hover:bg-white/20 transition-colors"
                  title="Open Original"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImgIndex(null)}
                  className="rounded p-1.5 hover:bg-white/20 transition-colors"
                  title="Close preview"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Main Preview Image */}
            <div className="relative overflow-hidden rounded-lg bg-black/40 flex items-center justify-center max-h-[75vh]">
              <img
                src={images[selectedImgIndex]}
                alt={`Enlarged campaign picture ${selectedImgIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CampaignViewDrawer Component ───────────────────────────────── */
export interface CampaignViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uuid: string | null;
  onSelect: (uuid: string, row: any) => void;
  row: any | null;
  data: CampaignRecord | null;
  onEdit?: (campaign: any) => void;
  onDelete?: (campaign: any) => void;
  seed?: { items: any[]; hasMore: boolean } | null;
  pageSize?: number;
}

export function CampaignViewDrawer({
  isOpen,
  onClose,
  uuid,
  onSelect,
  row,
  data,
  onEdit,
  onDelete,
  seed,
  pageSize = 15,
}: CampaignViewDrawerProps) {
  const { hasPermission } = useAuth();
  const shown = data ?? row;

  const title = shown
    ? [shown.campaign_id || shown.code, shown.type].filter(Boolean).join(' - ')
    : null;

  const menu: RecordMenuItem[] = [];
  if (shown && onDelete) {
    menu.push({
      label: 'Delete Campaign',
      icon: Trash2,
      onClick: () => onDelete(shown),
    });
  }

  const imageCount =
    (data?.images?.length || data?.campaign_picture_image?.length) ||
    (row?.images?.length || 0);

  return (
    <RecordViewDrawer<any>
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      rail={{
        queryKey: `campaign-${pageSize}`,
        seed,
        prefetch: {
          key: (c) => [CAMPAIGN_DETAIL_KEY, String(c.uuid || c.id)],
          fetch: (c) => getCampaignDetails(c.uuid || c.id),
        },
        placeholder: 'Search Campaign',
        fetchPage: (page, search) => fetchCampaigns(page, search, pageSize),
        toCard: (c: any) => ({
          key: String(c.uuid || c.id),
          title: c.campaign_id || c.code || `CAM-${c.id}`,
          subtitle: c.type || 'Campaign',
          amount:
            c.budget !== null && c.budget !== undefined && c.budget !== '' && c.budget !== '—'
              ? typeof c.budget === 'number'
                ? `$${c.budget.toLocaleString()}`
                : String(c.budget)
              : c.customer?.shop_name || [c.customer?.firstname, c.customer?.lastname].filter(Boolean).join(' ') || null,
        }),
        selectedKey: uuid,
        keyboard: true,
        onSelect: (c) => {
          const rawUuid = String(c.uuid || c.id);
          onSelect(rawUuid, c);
        },
      }}
      action={
        shown && onEdit && hasPermission('campaign.edit')
          ? {
              label: 'Edit Campaign',
              icon: SquarePen,
              onClick: () => onEdit(shown),
            }
          : null
      }
      menu={menu}
      tabs={[
        {
          key: 'overview',
          label: 'Overview',
          icon: CircleUserRound,
          content: <OverviewTab data={data} row={shown} />,
        },
        {
          key: 'pictures',
          label: imageCount > 0 ? `Pictures (${imageCount})` : 'Pictures',
          icon: ImageIcon,
          content: <PicturesTab data={data} row={shown} />,
        },
      ]}
    />
  );
}
