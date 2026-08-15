import { useState } from 'react';
import { OutletProductCodeAdd } from '../../pages/Settings/OutletProductCode/OutletProductCodeAdd';
import type { OutletProductCodeFormData } from '../../types/OutletProductCode';
import type { SelectOption } from '../../components/ui/Select';

interface OutletProductCodeAddModalData {
  initialData?: OutletProductCodeFormData;
  isLoading?: boolean;
  outlets?: SelectOption[];
  customers?: SelectOption[];
  products?: SelectOption[];
}

interface OutletProductCodeAddModalEvent {
  eventType: 'OutletProductCodeCreated' | 'OutletProductCodeUpdated';
  outletProductCode: OutletProductCodeFormData;
}

export default function useOutletProductCodeAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: OutletProductCodeAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: OutletProductCodeAddModalData = {}): Promise<OutletProductCodeFormData | null> {
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

  function onEvent(event: OutletProductCodeAddModalEvent) {
    if (event.eventType === 'OutletProductCodeCreated' || event.eventType === 'OutletProductCodeUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.outletProductCode);
    }
  }

  const OutletProductCodeAddModalView = () => (
    <OutletProductCodeAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    OutletProductCodeAddModalView,
  };
}