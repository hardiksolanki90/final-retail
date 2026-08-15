import { useState } from 'react';
import { CurrencyAdd } from '../../pages/Settings/Currency/CurrencyAdd';
import type { CurrencyFormData } from '../../types/Currency';

interface CurrencyAddModalData {
  initialData?: CurrencyFormData;
  isLoading?: boolean;
}

interface CurrencyAddModalEvent {
  eventType: 'CurrencyCreated' | 'CurrencyUpdated';
  currency: CurrencyFormData;
}

export default function useCurrencyAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CurrencyAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CurrencyAddModalData = {}): Promise<CurrencyFormData | null> {
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

  function onEvent(event: CurrencyAddModalEvent) {
    if (event.eventType === 'CurrencyCreated' || event.eventType === 'CurrencyUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.currency);
    }
  }

  const CurrencyAddModalView = () => (
    <CurrencyAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    CurrencyAddModalView,
  };
}