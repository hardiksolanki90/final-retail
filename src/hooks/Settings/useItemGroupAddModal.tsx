import { useState } from 'react';
import { ItemGroupAdd } from '../../pages/Settings/ItemGroup/ItemGroupAdd';
import type { ItemGroupFormData } from '../../types/ItemGroup';

interface ItemGroupAddModalData {
  initialData?: ItemGroupFormData;
  isLoading?: boolean;
}

interface ItemGroupAddModalEvent {
  eventType: 'ItemGroupCreated' | 'ItemGroupUpdated';
  itemGroup: ItemGroupFormData;
}

export default function useItemGroupAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ItemGroupAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ItemGroupAddModalData = {}): Promise<ItemGroupFormData | null> {
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

  function onEvent(event: ItemGroupAddModalEvent) {
    if (event.eventType === 'ItemGroupCreated' || event.eventType === 'ItemGroupUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.itemGroup);
    }
  }

  const ItemGroupAddModalView = () => (
    <ItemGroupAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ItemGroupAddModalView,
  };
}