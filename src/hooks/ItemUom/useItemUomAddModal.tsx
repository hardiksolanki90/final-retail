import { useState } from 'react';
import { ItemUomAdd } from '../../pages/ItemUom/ItemUomAdd';
import type { ItemUomFormData } from '../../types/ItemUom';

interface ItemUomAddModalData {
  initialData?: ItemUomFormData;
  isLoading?: boolean;
}

interface ItemUomAddModalEvent {
  eventType: 'ItemUomCreated' | 'ItemUomUpdated';
  itemUom: ItemUomFormData;
}

export default function useItemUomAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ItemUomAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ItemUomAddModalData = {}): Promise<ItemUomFormData | null> {
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

  function onEvent(event: ItemUomAddModalEvent) {
    if (event.eventType === 'ItemUomCreated' || event.eventType === 'ItemUomUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.itemUom);
    }
  }

  const ItemUomAddModalView = () => (
    <ItemUomAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ItemUomAddModalView,
  };
}