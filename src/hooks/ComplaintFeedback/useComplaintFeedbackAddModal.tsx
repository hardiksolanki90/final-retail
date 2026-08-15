import { useState } from 'react';
import { ComplaintFeedbackAdd } from '../../pages/ComplaintFeedbacks/ComplaintFeedbackAdd';
import type { ComplaintFeedbackFormData } from '../../types/ComplaintFeedback';
import type { SelectOption } from '../../components/ui/Select';

interface ComplaintFeedbackAddModalData {
  initialData?: ComplaintFeedbackFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  salesmen?: SelectOption[];
  orders?: SelectOption[];
  categories?: SelectOption[];
}

interface ComplaintFeedbackAddModalEvent {
  eventType: 'ComplaintFeedbackCreated' | 'ComplaintFeedbackUpdated';
  complaintFeedback: ComplaintFeedbackFormData;
}

export default function useComplaintFeedbackAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ComplaintFeedbackAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ComplaintFeedbackAddModalData = {}): Promise<ComplaintFeedbackFormData | null> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({ data, isOpen: true });
    });
  }

  function onClose() {
    if (state.isOpen) {
      setState({ isOpen: false, data: null });
      resolver?.(null);
    }
  }

  function onEvent(event: ComplaintFeedbackAddModalEvent) {
    if (event.eventType === 'ComplaintFeedbackCreated' || event.eventType === 'ComplaintFeedbackUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.complaintFeedback);
    }
  }

  const ComplaintFeedbackAddModalView = () => (
    <ComplaintFeedbackAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ComplaintFeedbackAddModalView,
  };
}