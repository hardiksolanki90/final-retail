import { useState } from 'react';
import {
  LayoutGrid,
  Image as ImageIcon,
  SquarePen,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';
import type { PlanogramRecord } from '../../api/PlanogramApi';
import { getPlanogramDetails, getPlanogramList } from '../../api/PlanogramApi';
import { useAuth } from '../../context/AuthContext';
import { PLANOGRAM_DETAIL_KEY } from '../../hooks/Planogram/usePlanogramDetail';
import { RecordViewDrawer, type RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { StatusPill } from '../shared/RecordView/StatusPill';

const formatDate = (val?: string | null): string => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return val;
  }
};

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

const fetchPlanograms = async (page: number, search: string, pageSize: number) => {
  const res = await getPlanogramList(page, pageSize, search ? { search } : {});
  return { items: res.data, hasMore: res.currentPage < res.lastPage };
};

/* ── Tab 1: Overview ─────────────────────────────────── */
function OverviewTab({ data, row }: { data: PlanogramRecord | null; row: any | null }) {
  const shown = data ?? row;

  if (!shown) {
    return (
      <InfoSectionsSkeleton
        titles={['Planogram Information', 'Customer Details', 'Salesman Details', 'Description']}
      />
    );
  }

  const code =
    shown.planogram_id || shown.planogramCode || shown.code || `PLG-${shown.id ?? ''}`;
  const statusStr = String(shown.status ?? 'active').toLowerCase();
  const isActive = statusStr === '1' || statusStr === 'active';

  const cust = shown.customer;
  const sm = shown.salesman;

  const customerName =
    [cust?.firstname, cust?.lastname].filter(Boolean).join(' ') ||
    shown.customerName ||
    '—';

  const customerCode =
    cust?.customer_code ||
    cust?.customerinfo?.customer_code ||
    '';

  const salesmanName =
    sm?.name ||
    [sm?.firstname, sm?.lastname].filter(Boolean).join(' ') ||
    shown.salesmanName ||
    '—';

  const salesmanCode =
    sm?.salesman_code ||
    sm?.salesmaninfo?.salesman_code ||
    '';

  const shelfCount = shown.shelf_count ?? shown.shelfCount ?? '—';
  const productsPerShelf = shown.products_per_shelf ?? shown.productsPerShelf ?? '—';

  return (
    <div className="mt-3 space-y-4">
      {/* 1. Planogram Information */}
      <InfoSection
        title="Planogram Information"
        rows={[
          {
            label: 'Planogram Code',
            value: <span className="font-mono font-medium">{code}</span>,
          },
          { label: 'Name', value: shown.name || '—' },
          { label: 'Category', value: shown.category || '—' },
          { label: 'Shelf Count', value: shelfCount },
          { label: 'Products Per Shelf', value: productsPerShelf },
          { label: 'Date', value: formatDate(shown.date) },
          {
            label: 'Status',
            value: (
              <StatusPill
                label={isActive ? 'Active' : 'Inactive'}
                tone={isActive ? 'success' : 'neutral'}
              />
            ),
          },
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
            value: customerCode ? (
              <span className="font-mono font-medium">{customerCode}</span>
            ) : (
              '—'
            ),
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
            value: salesmanCode ? (
              <span className="font-mono font-medium">{salesmanCode}</span>
            ) : (
              '—'
            ),
          },
          { label: 'Mobile / Phone', value: sm?.phone_number || '—' },
          { label: 'Email Address', value: sm?.email || '—' },
        ]}
      />

      {/* 4. Description */}
      <InfoSection title="Description">
        <div className="p-4 text-sm text-[var(--rv-ink)]">
          {shown.description ? (
            <p className="whitespace-pre-line leading-relaxed">{shown.description}</p>
          ) : (
            <p className="italic text-[var(--rv-muted)]">No description provided.</p>
          )}
        </div>
      </InfoSection>
    </div>
  );
}

/* ── Tab 2: Pictures & Gallery ─────────────────────────────────── */
function PicturesTab({ data, row }: { data: PlanogramRecord | null; row: any | null }) {
  const shown = data ?? row;
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);

  const images: string[] = [];
  if (shown?.images && Array.isArray(shown.images)) {
    images.push(...shown.images);
  }
  if (shown?.planogram_images && Array.isArray(shown.planogram_images)) {
    shown.planogram_images.forEach((img: any) => {
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
        <h4 className="mt-3 text-sm font-semibold text-[var(--rv-text)]">No Images Attached</h4>
        <p className="mt-1 text-xs text-[var(--rv-muted)] max-w-sm">
          No planogram reference images have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--rv-text)]">
          Planogram Images ({images.length} {images.length === 1 ? 'image' : 'images'})
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
              alt={`Planogram image ${idx + 1}`}
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
                alt={`Enlarged planogram image ${selectedImgIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain"
              />

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) =>
                        prev !== null && prev > 0 ? prev - 1 : images.length - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIndex((prev) =>
                        prev !== null && prev < images.length - 1 ? prev + 1 : 0
                      );
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

/* ── PlanogramViewDrawer Component ───────────────────────────────── */
export interface PlanogramViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uuid: string | null;
  onSelect: (uuid: string, row: any) => void;
  row: any | null;
  data: PlanogramRecord | null;
  onEdit?: (planogram: any) => void;
  onDelete?: (planogram: any) => void;
  seed?: { items: any[]; hasMore: boolean } | null;
  pageSize?: number;
}

export function PlanogramViewDrawer({
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
}: PlanogramViewDrawerProps) {
  const { hasPermission } = useAuth();
  const shown = data ?? row;

  const title = shown
    ? [
        shown.planogram_id || shown.planogramCode || shown.code,
        shown.name,
      ]
        .filter(Boolean)
        .join(' - ')
    : null;

  const menu: RecordMenuItem[] = [];
  if (shown && onDelete) {
    menu.push({
      label: 'Delete Planogram',
      icon: Trash2,
      onClick: () => onDelete(shown),
    });
  }

  const imageCount =
    data?.planogram_images?.length ||
    data?.images?.length ||
    (row?.images?.length ?? 0);

  return (
    <RecordViewDrawer<any>
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      rail={{
        queryKey: `planogram-${pageSize}`,
        seed,
        prefetch: {
          key: (p) => [PLANOGRAM_DETAIL_KEY, String(p.uuid || p.id)],
          fetch: (p) => getPlanogramDetails(p.uuid || p.id),
        },
        placeholder: 'Search Planogram',
        fetchPage: (page, search) => fetchPlanograms(page, search, pageSize),
        toCard: (p: any) => ({
          key: String(p.uuid || p.id),
          title: p.planogram_id || p.planogramCode || p.code || `PLG-${p.id}`,
          subtitle: p.name || p.category || 'Planogram',
          amount:
            p.category ||
            [p.customer?.firstname, p.customer?.lastname].filter(Boolean).join(' ') ||
            null,
        }),
        selectedKey: uuid,
        keyboard: true,
        onSelect: (p) => {
          const rawUuid = String(p.uuid || p.id);
          onSelect(rawUuid, p);
        },
      }}
      action={
        shown && onEdit && hasPermission('planogram.edit')
          ? {
              label: 'Edit Planogram',
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
          icon: LayoutGrid,
          content: <OverviewTab data={data} row={shown} />,
        },
        {
          key: 'pictures',
          label: imageCount > 0 ? `Images (${imageCount})` : 'Images',
          icon: ImageIcon,
          content: <PicturesTab data={data} row={shown} />,
        },
      ]}
    />
  );
}
