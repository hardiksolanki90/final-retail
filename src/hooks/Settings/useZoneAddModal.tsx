import { useState } from 'react';
import { ZoneAdd } from '../../pages/Settings/Zone/ZoneAdd';
import type { ZoneFormData } from '../../types/Zone';

interface ZoneAddModalData {
  initialData?: ZoneFormData;
  isLoading?: boolean;
}

interface ZoneAddModalEvent {
  eventType: 'ZoneCreated' | 'ZoneUpdated';
  zone: ZoneFormData;
}

export default function useZoneAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ZoneAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ZoneAddModalData = {}): Promise<ZoneFormData | null> {
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

  function onEvent(event: ZoneAddModalEvent) {
    if (event.eventType === 'ZoneCreated' || event.eventType === 'ZoneUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.zone);
    }
  }

  const ZoneAddModalView = () => (
    <ZoneAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ZoneAddModalView,
  };
}