import { useState } from 'react';
import { PalletAdd } from '../../pages/Pallet/PalletAdd';
import type { PalletFormData } from '../../types/Pallet';
import type { SelectOption } from '../../components/ui/Select';

interface PalletAddModalData {
  initialData?: PalletFormData;
  isLoading?: boolean;
  warehouses?: SelectOption[];
  items?: SelectOption[];
  suppliers?: SelectOption[];
}

interface PalletAddModalEvent {
  eventType: 'PalletCreated' | 'PalletUpdated';
  pallet: PalletFormData;
}

export default function usePalletAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: PalletAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: PalletAddModalData = {}): Promise<PalletFormData | null> {
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

  function onEvent(event: PalletAddModalEvent) {
    if (event.eventType === 'PalletCreated' || event.eventType === 'PalletUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.pallet);
    }
  }

  const PalletAddModalView = () => (
    <PalletAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    PalletAddModalView,
  };
}