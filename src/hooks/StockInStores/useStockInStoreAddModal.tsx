import { useState } from 'react';
import { StockInStoreAdd } from '../../pages/StockInStores/StockInStoreAdd';
import type { StockInStoreFormData } from '../../types/StockInStore';
import type { SelectOption } from '../../components/ui/Select';

interface StockInStoreAddModalData {
  initialData?: StockInStoreFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  stores?: SelectOption[];
  salesmen?: SelectOption[];
  items?: SelectOption[];
}

interface StockInStoreAddModalEvent {
  eventType: 'StockInStoreCreated' | 'StockInStoreUpdated';
  stockInStore: StockInStoreFormData;
}

export default function useStockInStoreAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: StockInStoreAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: StockInStoreAddModalData = {}): Promise<StockInStoreFormData | null> {
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

  function onEvent(event: StockInStoreAddModalEvent) {
    if (event.eventType === 'StockInStoreCreated' || event.eventType === 'StockInStoreUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.stockInStore);
    }
  }

  const StockInStoreAddModalView = () => (
    <StockInStoreAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    StockInStoreAddModalView,
  };
}