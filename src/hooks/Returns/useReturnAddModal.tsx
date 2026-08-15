import { useState } from 'react';
import { ReturnAdd } from '../../pages/Returns/ReturnAdd';

interface ReturnFormData {
  returnNo: string;
  orderNo: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  reason: string;
  status: string;
}

interface ReturnAddModalData {
  initialData?: ReturnFormData;
  isLoading?: boolean;
}

interface ReturnAddModalEvent {
  eventType: 'ReturnCreated' | 'ReturnUpdated';
  return: ReturnFormData;
}

export default function useReturnAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ReturnAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ReturnAddModalData = {}): Promise<ReturnFormData | null> {
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

  function onEvent(event: ReturnAddModalEvent) {
    if (event.eventType === 'ReturnCreated' || event.eventType === 'ReturnUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.return);
    }
  }

  const ReturnAddModalView = () => (
    <ReturnAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ReturnAddModalView,
  };
}