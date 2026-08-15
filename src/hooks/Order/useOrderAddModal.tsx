import { useState } from 'react';
import { OrderAdd } from '../../pages/Orders/OrderAdd';
import type { OrderFormData } from '../../types/Order';
import type { SelectOption } from '../../components/ui/Select';
import type { Item } from '../../types/Item';

interface OrderAddModalData {
  initialData?: OrderFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  salesmen?: SelectOption[];
  items?: Item[];
  depots?: SelectOption[];
  merchandisers?: SelectOption[];
}

interface OrderAddModalEvent {
  eventType: 'OrderCreated' | 'OrderUpdated';
  order: OrderFormData;
}

export default function useOrderAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: OrderAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: OrderAddModalData = {}): Promise<OrderFormData | null> {
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

  function onEvent(event: OrderAddModalEvent) {
    if (event.eventType === 'OrderCreated' || event.eventType === 'OrderUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.order);
    }
  }

  async function onSubmit(data: OrderFormData) {
    const eventType = state.data?.initialData ? 'OrderUpdated' : 'OrderCreated';
    onEvent({ eventType, order: data });
  }

  const OrderAddModalView = () => (
    <OrderAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    OrderAddModalView,
  };
}