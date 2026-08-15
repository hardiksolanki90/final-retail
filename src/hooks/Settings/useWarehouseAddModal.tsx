import { useState } from 'react';
import { WarehouseAdd } from '../../pages/Settings/Warehouse/WarehouseAdd';
import type { WarehouseFormData } from '../../types/Warehouse';

interface WarehouseAddModalData {
  initialData?: WarehouseFormData;
  isLoading?: boolean;
}

interface WarehouseAddModalEvent {
  eventType: 'WarehouseCreated' | 'WarehouseUpdated';
  warehouse: WarehouseFormData;
}

export default function useWarehouseAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: WarehouseAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: WarehouseAddModalData = {}): Promise<WarehouseFormData | null> {
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

  function onEvent(event: WarehouseAddModalEvent) {
    if (event.eventType === 'WarehouseCreated' || event.eventType === 'WarehouseUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.warehouse);
    }
  }

  const WarehouseAddModalView = () => (
    <WarehouseAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    WarehouseAddModalView,
  };
}