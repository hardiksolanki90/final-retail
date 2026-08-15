import { useState } from 'react';
import { DebitNoteAdd } from '../../pages/DebitNotes/DebitNoteAdd';
import type { DebitNoteFormData } from '../../types/DebitNote';
import type { SelectOption } from '../../components/ui/Select';

interface DebitNoteAddModalData {
  initialData?: DebitNoteFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  invoices?: SelectOption[];
  reasons?: SelectOption[];
  items?: SelectOption[];
  uomOptions?: SelectOption[];
}

interface DebitNoteAddModalEvent {
  eventType: 'DebitNoteCreated' | 'DebitNoteUpdated';
  debitNote: DebitNoteFormData;
}

export default function useDebitNoteAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: DebitNoteAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: DebitNoteAddModalData = {}): Promise<DebitNoteFormData | null> {
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

  function onEvent(event: DebitNoteAddModalEvent) {
    if (event.eventType === 'DebitNoteCreated' || event.eventType === 'DebitNoteUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.debitNote);
    }
  }

  const DebitNoteAddModalView = () => (
    <DebitNoteAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    DebitNoteAddModalView,
  };
}