import { useState } from 'react';
import { ItemAdd } from '../../pages/Items/ItemAdd';
import type { ItemFormData, ItemUom } from '../../types/Item';
import type { SelectOption } from '../../components/ui/Select';

interface ItemAddModalData {
  initialData?: ItemFormData;
  isLoading?: boolean;
  categories?: SelectOption[];
  brands?: SelectOption[];
  uoms?: ItemUom[];
}

interface ItemAddModalEvent {
  eventType: 'ItemCreated' | 'ItemUpdated';
  item: ItemFormData;
}

export default function useItemAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ItemAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ItemAddModalData = {}): Promise<ItemFormData | null> {
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

  function onEvent(event: ItemAddModalEvent) {
    if (event.eventType === 'ItemCreated' || event.eventType === 'ItemUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.item);
    }
  }

  async function onSubmit(data: ItemFormData) {
    const eventType = state.data?.initialData ? 'ItemUpdated' : 'ItemCreated';
    onEvent({ eventType, item: data });
  }

  const ItemAddModalView = () => (
    <ItemAdd
      isOpen={state.isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={state.data?.initialData}
      isLoading={state.data?.isLoading}
      categories={state.data?.categories}
      brands={state.data?.brands}
      uoms={state.data?.uoms}
    />
  );

  return {
    open,
    ItemAddModalView,
  };
}