import { useState } from 'react';
import { CountryAdd } from '../../pages/Settings/Country/CountryAdd';
import type { CountryFormData } from '../../types/Country';

interface CountryAddModalData {
  initialData?: CountryFormData;
  isLoading?: boolean;
}

interface CountryAddModalEvent {
  eventType: 'CountryCreated' | 'CountryUpdated';
  country: CountryFormData;
}

export default function useCountryAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CountryAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CountryAddModalData = {}): Promise<CountryFormData | null> {
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

  function onEvent(event: CountryAddModalEvent) {
    if (event.eventType === 'CountryCreated' || event.eventType === 'CountryUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.country);
    }
  }

  const CountryAddModalView = () => (
    <CountryAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    CountryAddModalView,
  };
}