import { useState } from 'react';
import { SalesmanLoadAdd } from '../../pages/SalesmanLoad/SalesmanLoadAdd';
import type { SalesmanLoadFormData } from '../../types/SalesmanLoad';
import type { SelectOption } from '../../components/ui/Select';

interface SalesmanLoadAddModalData {
  initialData?: SalesmanLoadFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  vehicles?: SelectOption[];
  routes?: SelectOption[];
  items?: SelectOption[];
}

interface SalesmanLoadAddModalEvent {
  eventType: 'SalesmanLoadCreated' | 'SalesmanLoadUpdated';
  salesmanLoad: SalesmanLoadFormData;
}

export default function useSalesmanLoadAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: SalesmanLoadAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: SalesmanLoadAddModalData = {}): Promise<SalesmanLoadFormData | null> {
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

  function onEvent(event: SalesmanLoadAddModalEvent) {
    if (event.eventType === 'SalesmanLoadCreated' || event.eventType === 'SalesmanLoadUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.salesmanLoad);
    }
  }

  const SalesmanLoadAddModalView = () => (
    <SalesmanLoadAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    SalesmanLoadAddModalView,
  };
}