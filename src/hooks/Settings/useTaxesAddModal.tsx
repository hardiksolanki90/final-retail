import { useState } from 'react';
import { TaxesAdd } from '../../pages/Settings/Taxes/TaxesAdd';
import type { TaxFormData } from '../../types/Tax';

interface TaxesAddModalData {
  initialData?: TaxFormData;
  isLoading?: boolean;
}

interface TaxesAddModalEvent {
  eventType: 'TaxCreated' | 'TaxUpdated';
  tax: TaxFormData;
}

export default function useTaxesAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: TaxesAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: TaxesAddModalData = {}): Promise<TaxFormData | null> {
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

  function onEvent(event: TaxesAddModalEvent) {
    if (event.eventType === 'TaxCreated' || event.eventType === 'TaxUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.tax);
    }
  }

  const TaxesAddModalView = () => (
    <TaxesAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    TaxesAddModalView,
  };
}