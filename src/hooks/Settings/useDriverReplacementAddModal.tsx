import { useState } from 'react';
import { DriverReplacementAdd } from '../../pages/Settings/DriverReplacement/DriverReplacementAdd';
import type { DriverReplacementFormData } from '../../types/DriverReplacement';
import type { SelectOption } from '../../components/ui/Select';

interface DriverReplacementAddModalData {
  initialData?: DriverReplacementFormData;
  isLoading?: boolean;
  drivers?: SelectOption[];
  reasons?: SelectOption[];
}

interface DriverReplacementAddModalEvent {
  eventType: 'DriverReplacementCreated' | 'DriverReplacementUpdated';
  driverReplacement: DriverReplacementFormData;
}

export default function useDriverReplacementAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: DriverReplacementAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: DriverReplacementAddModalData = {}): Promise<DriverReplacementFormData | null> {
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

  function onEvent(event: DriverReplacementAddModalEvent) {
    if (event.eventType === 'DriverReplacementCreated' || event.eventType === 'DriverReplacementUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.driverReplacement);
    }
  }

  const DriverReplacementAddModalView = () => (
    <DriverReplacementAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    DriverReplacementAddModalView,
  };
}