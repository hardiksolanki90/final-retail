import { useState } from 'react';
import { InvoiceAdd } from '../../pages/Invoices/InvoiceAdd';
import type { InvoiceFormData } from '../../types/Invoice';
import type { SelectOption } from '../../components/ui/Select';

interface InvoiceAddModalData {
  initialData?: InvoiceFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  customerLobs?: SelectOption[];
  salesmen?: SelectOption[];
  orders?: SelectOption[];
  deliveries?: SelectOption[];
  paymentMethods?: SelectOption[];
}

interface InvoiceAddModalEvent {
  eventType: 'InvoiceCreated' | 'InvoiceUpdated';
  invoice: InvoiceFormData;
}

export default function useInvoiceAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: InvoiceAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: InvoiceAddModalData = {}): Promise<InvoiceFormData | null> {
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

  function onEvent(event: InvoiceAddModalEvent) {
    if (event.eventType === 'InvoiceCreated' || event.eventType === 'InvoiceUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.invoice);
    }
  }

  async function onSubmit(data: InvoiceFormData) {
    const eventType = state.data?.initialData ? 'InvoiceUpdated' : 'InvoiceCreated';
    onEvent({ eventType, invoice: data });
  }

  const InvoiceAddModalView = () => (
    <InvoiceAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    InvoiceAddModalView,
  };
}