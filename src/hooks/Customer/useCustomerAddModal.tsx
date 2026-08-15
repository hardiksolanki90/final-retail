import { useState } from 'react';
import { CustomerAdd } from '../../pages/Customers/customerAdd';
import type { CustomerFormData } from '../../types/Customer';
import type { SelectOption } from '../../components/ui/Select';

interface CustomerAddModalData {
  initialData?: CustomerFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  routes?: SelectOption[];
  regions?: SelectOption[];
  countries?: SelectOption[];
  merchandisers?: SelectOption[];
  salesOrganisations?: SelectOption[];
}

interface CustomerAddModalEvent {
  eventType: 'CustomerCreated' | 'CustomerUpdated';
  customer: CustomerFormData;
}

export default function useCustomerAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CustomerAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CustomerAddModalData = {}): Promise<CustomerFormData | null> {
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

  function onEvent(event: CustomerAddModalEvent) {
    if (event.eventType === 'CustomerCreated' || event.eventType === 'CustomerUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.customer);
    }
  }

  async function onSubmit(data: CustomerFormData) {
    const eventType = state.data?.initialData ? 'CustomerUpdated' : 'CustomerCreated';
    onEvent({ eventType, customer: data });
  }

  const CustomerAddModalView = () => (
    <CustomerAdd
      isOpen={state.isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={state.data?.initialData}
      isLoading={state.data?.isLoading}
      salesmen={state.data?.salesmen}
      routes={state.data?.routes}
      regions={state.data?.regions}
      countries={state.data?.countries}
      merchandisers={state.data?.merchandisers}
      salesOrganisations={state.data?.salesOrganisations}
    />
  );

  return {
    open,
    CustomerAddModalView,
  };
}