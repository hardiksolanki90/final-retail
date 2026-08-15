import { useState } from 'react';
import { ReasonAdd } from '../../pages/Settings/Reason/ReasonAdd';
import type { ReasonFormData } from '../../types/Reason';

interface ReasonAddModalData {
  initialData?: ReasonFormData;
  isLoading?: boolean;
}

interface ReasonAddModalEvent {
  eventType: 'ReasonCreated' | 'ReasonUpdated';
  reason: ReasonFormData;
}

export default function useReasonAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ReasonAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ReasonAddModalData = {}): Promise<ReasonFormData | null> {
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

  function onEvent(event: ReasonAddModalEvent) {
    if (event.eventType === 'ReasonCreated' || event.eventType === 'ReasonUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.reason);
    }
  }

  const ReasonAddModalView = () => (
    <ReasonAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ReasonAddModalView,
  };
}