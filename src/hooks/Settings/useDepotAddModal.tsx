import { useState } from 'react';
import { DepotAdd } from '../../pages/Settings/Depot/DepotAdd';
import type { DepotFormData } from '../../types/Depot';

interface DepotAddModalData {
  initialData?: DepotFormData;
  isLoading?: boolean;
}

interface DepotAddModalEvent {
  eventType: 'DepotCreated' | 'DepotUpdated';
  depot: DepotFormData;
}

export default function useDepotAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: DepotAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: DepotAddModalData = {}): Promise<DepotFormData | null> {
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

  function onEvent(event: DepotAddModalEvent) {
    if (event.eventType === 'DepotCreated' || event.eventType === 'DepotUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.depot);
    }
  }

  const DepotAddModalView = () => (
    <DepotAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    DepotAddModalView,
  };
}