import { useState } from 'react';
import { Image as ImageIcon, MessageSquareText } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { getComplaintFeedback, getComplaintFeedbacks } from '../../api/ComplaintFeedbackApi';
import { useComplaintFeedback } from '../../hooks/ComplaintFeedbacks/useComplaintFeedbacks';
import type { ComplaintFeedback, ComplaintFeedbackListParams } from '../../types/ComplaintFeedback';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { RecordViewDrawer } from '../shared/RecordView/RecordViewDrawer';

interface ComplaintFeedbackViewProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintFeedback | null;
  seed?: { items: ComplaintFeedback[]; hasMore: boolean; updatedAt?: number } | null;
  pageSize?: number;
  listParams?: ComplaintFeedbackListParams;
  onSelect?: (complaint: ComplaintFeedback) => void;
}

function displayDate(value?: string | null) {
  if (!value) return '—';
  const date = parseISO(value);
  return isValid(date) ? format(date, 'd MMM yyyy h:mm a') : '—';
}

function Overview({ complaint, loading }: { complaint: ComplaintFeedback | null; loading: boolean }) {
  if (loading && !complaint) return <InfoSectionsSkeleton titles={['Complaint & Feedback Details', 'Description']} />;
  if (!complaint) return null;

  return <div className="mt-3 space-y-4">
    <InfoSection title="Complaint & Feedback Details" rows={[
      { label: 'Date', value: displayDate(complaint.date || complaint.createdAt) },
      { label: 'Route', value: complaint.routeName },
      { label: 'Complaint ID', value: complaint.complaintId },
      { label: 'Merchandiser', value: complaint.merchandiserName },
      { label: 'Feedback Title', value: complaint.title },
      { label: 'Item Code', value: complaint.itemCode },
      { label: 'Item Name', value: complaint.itemName },
      { label: 'Type', value: complaint.type === 'complaint' ? 'Complaint' : 'Suggestion' },
    ]} />
    <InfoSection title="Description"><p className="whitespace-pre-wrap px-[14px] py-4 text-[var(--rv-ink)]">{complaint.description || '—'}</p></InfoSection>
  </div>;
}

function ImageGallery({ images }: { images: string[] }) {
  if (images.length === 0) return <div className="mt-3 flex min-h-52 flex-col items-center justify-center rounded border border-dashed border-[var(--rv-border)] text-[var(--rv-muted)]"><ImageIcon className="mb-2 h-8 w-8" /><p>No images attached.</p></div>;

  return <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="overflow-hidden rounded border border-[var(--rv-border)] bg-[var(--rv-head)]"><img src={image} alt={`Complaint feedback attachment ${index + 1}`} loading="lazy" className="h-64 w-full object-contain" /></a>)}</div>;
}

export function ComplaintFeedbackView({ isOpen, onClose, complaint, seed, pageSize = 15, listParams = {}, onSelect }: ComplaintFeedbackViewProps) {
  const [selectedUuid, setSelectedUuid] = useState<string | null>(complaint?.uuid ?? null);
  const [selectedRow, setSelectedRow] = useState<ComplaintFeedback | null>(complaint);

  const activeUuid = selectedUuid ?? complaint?.uuid ?? null;
  const { data, isLoading } = useComplaintFeedback(isOpen ? activeUuid : null);
  const shown = data ?? selectedRow ?? complaint;

  return <RecordViewDrawer<ComplaintFeedback>
    isOpen={isOpen && Boolean(shown || activeUuid)}
    onClose={onClose}
    title={shown ? `${shown.complaintId} - ${shown.title}` : null}
    rail={{
      queryKey: `complaint-feedback-${pageSize}-${JSON.stringify(listParams)}`,
      seed,
      prefetch: { key: (item) => ['complaint-feedback-detail', item.uuid], fetch: (item) => getComplaintFeedback(item.uuid) },
      placeholder: 'Search complaints',
      fetchPage: async (page, search) => {
        const response = await getComplaintFeedbacks({ ...listParams, page, perPage: pageSize, search: search || listParams.search });
        return { items: response.data, hasMore: response.meta.has_more_pages };
      },
      toCard: (item) => ({ key: item.uuid, title: item.title, subtitle: item.complaintId, amount: displayDate(item.date || item.createdAt) }),
      selectedKey: activeUuid,
      keyboard: true,
      onSelect: (item) => {
        setSelectedUuid(item.uuid);
        setSelectedRow(item);
        onSelect?.(item);
      },
    }}
    tabs={[
      { key: 'overview', label: 'Overview', icon: MessageSquareText, content: <Overview complaint={shown ?? null} loading={isLoading} /> },
      { key: 'images', label: `Images (${shown?.images.length ?? 0})`, icon: ImageIcon, content: <ImageGallery images={shown?.images ?? []} /> },
    ]}
  />;
}
