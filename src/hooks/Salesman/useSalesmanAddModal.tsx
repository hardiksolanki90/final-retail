import { useState } from 'react';
import SalesmanAdd from '../../pages/Salesman/SalesmanAdd';
import SalesmanProvider from '../../providers/SalesmanProvider';
import type { SalesmanFormData } from '../../types/Salesman';
import type { SelectOption } from '../../components/ui/Select';

interface SalesmanAddModalData {
  initialData?: SalesmanFormData;
  isLoading?: boolean;
  routes?: SelectOption[];
  warehouses?: SelectOption[];
}

interface SalesmanAddModalEvent {
  eventType: 'SalesmanCreated' | 'SalesmanUpdated';
  salesman: SalesmanFormData;
}

export default function useSalesmanAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: SalesmanAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: SalesmanAddModalData = {}): Promise<SalesmanFormData | null> {
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

  function onEvent(event: SalesmanAddModalEvent) {
    if (event.eventType === 'SalesmanCreated' || event.eventType === 'SalesmanUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.salesman);
    }
  }

  async function onSubmit(data: SalesmanFormData) {
    const eventType = state.data?.initialData ? 'SalesmanUpdated' : 'SalesmanCreated';
    onEvent({ eventType, salesman: data });
  }

  const SalesmanAddModalView = () => (
    <SalesmanProvider>
      <SalesmanAdd
        isOpen={state.isOpen}
        onClose={onClose}
        onEvent={onEvent}
        data={state.data?.initialData}
      />
    </SalesmanProvider>
  );

  return {
    open,
    SalesmanAddModalView,
  };
}