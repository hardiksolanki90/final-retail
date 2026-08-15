import { useState } from 'react';
import { VanAdd } from '../../pages/Settings/Van/VanAdd';
import type { VanFormData } from '../../types/Van';

interface VanAddModalData {
  initialData?: VanFormData;
  isLoading?: boolean;
}

interface VanAddModalEvent {
  eventType: 'VanCreated' | 'VanUpdated';
  van: VanFormData;
}

export default function useVanAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: VanAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: VanAddModalData = {}): Promise<VanFormData | null> {
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

  function onEvent(event: VanAddModalEvent) {
    if (event.eventType === 'VanCreated' || event.eventType === 'VanUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.van);
    }
  }

  const VanAddModalView = () => (
    <VanAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    VanAddModalView,
  };
}