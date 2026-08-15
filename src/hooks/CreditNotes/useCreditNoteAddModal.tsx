import { useState } from 'react';
import { CreditNoteAdd } from '../../pages/CreditNotes/CreditNoteAdd';
import type { CreditNoteFormData } from '../../types/CreditNote';
import type { SelectOption } from '../../components/ui/Select';

interface CreditNoteAddModalData {
  initialData?: CreditNoteFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  invoices?: SelectOption[];
  reasons?: SelectOption[];
  items?: SelectOption[];
  uomOptions?: SelectOption[];
}

interface CreditNoteAddModalEvent {
  eventType: 'CreditNoteCreated' | 'CreditNoteUpdated';
  creditNote: CreditNoteFormData;
}

export default function useCreditNoteAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CreditNoteAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CreditNoteAddModalData = {}): Promise<CreditNoteFormData | null> {
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

  function onEvent(event: CreditNoteAddModalEvent) {
    if (event.eventType === 'CreditNoteCreated' || event.eventType === 'CreditNoteUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.creditNote);
    }
  }

  const CreditNoteAddModalView = () => (
    <CreditNoteAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    CreditNoteAddModalView,
  };
}