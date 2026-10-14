import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComplaintFeedback, getComplaintFeedback, getComplaintFeedbacks } from '../../api/ComplaintFeedbackApi';
import { showToast } from '../../lib/toast';
import type { ComplaintFeedbackFormData, ComplaintFeedbackListParams } from '../../types/ComplaintFeedback';

export const COMPLAINT_FEEDBACK_LIST_KEY = 'complaint-feedbacks';
export const COMPLAINT_FEEDBACK_DETAIL_KEY = 'complaint-feedback-detail';

type ApiError = { response?: { data?: { message?: string } } };

export function useComplaintFeedbacks(params: ComplaintFeedbackListParams) {
  return useQuery({
    queryKey: [COMPLAINT_FEEDBACK_LIST_KEY, params],
    queryFn: () => getComplaintFeedbacks(params),
    placeholderData: keepPreviousData,
  });
}

export function useComplaintFeedback(uuid: string | null) {
  return useQuery({
    queryKey: [COMPLAINT_FEEDBACK_DETAIL_KEY, uuid],
    queryFn: () => getComplaintFeedback(uuid as string),
    enabled: Boolean(uuid),
  });
}

export function useComplaintFeedbackActions() {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: (payload: ComplaintFeedbackFormData) => createComplaintFeedback(payload),
      onSuccess: () => {
        showToast.success('Complaint feedback created successfully');
        void queryClient.invalidateQueries({ queryKey: [COMPLAINT_FEEDBACK_LIST_KEY] });
      },
      onError: (error: ApiError) => showToast.error(error.response?.data?.message || 'Failed to create complaint feedback'),
    }),
  };
}
