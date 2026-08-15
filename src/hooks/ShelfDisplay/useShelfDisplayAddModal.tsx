import { useState } from 'react';
import { ShelfDisplayAdd } from '../../pages/ShelfDisplay/ShelfDisplayAdd';
import type { ShelfDisplayFormData } from '../../types/ShelfDisplay';
import type { SelectOption } from '../../components/ui/Select';

interface ShelfDisplayAddModalData {
  initialData?: ShelfDisplayFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  stores?: SelectOption[];
  products?: SelectOption[];
  shelfTypes?: SelectOption[];
}

interface ShelfDisplayAddModalEvent {
  eventType: 'ShelfDisplayCreated' | 'ShelfDisplayUpdated';
  shelfDisplay: ShelfDisplayFormData;
}

export default function useShelfDisplayAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ShelfDisplayAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ShelfDisplayAddModalData = {}): Promise<ShelfDisplayFormData | null> {
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

  function onEvent(event: ShelfDisplayAddModalEvent) {
    if (event.eventType === 'ShelfDisplayCreated' || event.eventType === 'ShelfDisplayUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.shelfDisplay);
    }
  }

  const ShelfDisplayAddModalView = () => (
    <ShelfDisplayAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ShelfDisplayAddModalView,
  };
}