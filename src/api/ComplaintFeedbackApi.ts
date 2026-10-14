import axiosInstance from '../lib/axios';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type { ComplaintFeedback, ComplaintFeedbackFormData, ComplaintFeedbackListParams } from '../types/ComplaintFeedback';

export const getComplaintFeedbacks = async ({
  page = 1,
  perPage = 15,
  search,
  date,
  route,
  complaintId,
  merchandiserName,
  title,
  itemCode,
  itemName,
  type,
}: ComplaintFeedbackListParams): Promise<NormalizedListResponse<ComplaintFeedback>> => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search) params.set('search', search);
  if (date) params.set('date', date);
  if (route) params.set('route', route);
  if (complaintId) params.set('complaintId', complaintId);
  if (merchandiserName) params.set('merchandiserName', merchandiserName);
  if (title) params.set('title', title);
  if (itemCode) params.set('itemCode', itemCode);
  if (itemName) params.set('itemName', itemName);
  if (type) params.set('type', type);

  return unwrapPaginated<ComplaintFeedback>((await axiosInstance.get(`/complaint-feedback/list?${params.toString()}`)).data, 'complaintFeedbacks', perPage);
};

export const getComplaintFeedback = async (uuid: string): Promise<ComplaintFeedback> =>
  (await axiosInstance.get(`/complaint-feedback/edit/${uuid}`)).data.data;

export const createComplaintFeedback = async (form: ComplaintFeedbackFormData): Promise<ComplaintFeedback> =>
  (await axiosInstance.post('/complaint-feedback/add', {
    title: form.title,
    salesmanId: form.merchandiserId,
    itemId: form.itemId || null,
    type: form.type,
    description: form.description,
  })).data.data;
