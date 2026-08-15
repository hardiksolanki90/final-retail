import { useState } from 'react';
import { RegionAdd } from '../../pages/Settings/Region/RegionAdd';
import type { RegionFormData } from '../../types/Region';

interface RegionAddModalData {
  initialData?: RegionFormData;
  isLoading?: boolean;
}

interface RegionAddModalEvent {
  eventType: 'RegionCreated' | 'RegionUpdated';
  region: RegionFormData;
}

export default function useRegionAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: RegionAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: RegionAddModalData = {}): Promise<RegionFormData | null> {
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

  function onEvent(event: RegionAddModalEvent) {
    if (event.eventType === 'RegionCreated' || event.eventType === 'RegionUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.region);
    }
  }

  const RegionAddModalView = () => (
    <RegionAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    RegionAddModalView,
  };
}