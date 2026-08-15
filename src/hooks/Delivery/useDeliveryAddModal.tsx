import { useState } from 'react';
import { DeliveryAdd } from '../../pages/Deliveries/DeliveryAdd';
import type { DeliveryFormData } from '../../types/Delivery';
import type { SelectOption } from '../../components/ui/Select';

interface DeliveryAddModalData {
  initialData?: DeliveryFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  customerLobs?: SelectOption[];
  warehouses?: SelectOption[];
  drivers?: SelectOption[];
  vehicles?: SelectOption[];
  orders?: SelectOption[];
}

interface DeliveryAddModalEvent {
  eventType: 'DeliveryCreated' | 'DeliveryUpdated';
  delivery: DeliveryFormData;
}

export default function useDeliveryAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: DeliveryAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: DeliveryAddModalData = {}): Promise<DeliveryFormData | null> {
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

  function onEvent(event: DeliveryAddModalEvent) {
    if (event.eventType === 'DeliveryCreated' || event.eventType === 'DeliveryUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.delivery);
    }
  }

  async function onSubmit(data: DeliveryFormData) {
    const eventType = state.data?.initialData ? 'DeliveryUpdated' : 'DeliveryCreated';
    onEvent({ eventType, delivery: data });
  }

  const DeliveryAddModalView = () => (
    <DeliveryAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    DeliveryAddModalView,
  };
}