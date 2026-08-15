import { useState } from 'react';
import { BankAdd } from '../../pages/Settings/Bank/BankAdd';
import type { BankFormData } from '../../types/Bank';

interface BankAddModalData {
  initialData?: BankFormData;
  isLoading?: boolean;
}

interface BankAddModalEvent {
  eventType: 'BankCreated' | 'BankUpdated';
  bank: BankFormData;
}

export default function useBankAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: BankAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: BankAddModalData = {}): Promise<BankFormData | null> {
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

  function onEvent(event: BankAddModalEvent) {
    if (event.eventType === 'BankCreated' || event.eventType === 'BankUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.bank);
    }
  }

  const BankAddModalView = () => (
    <BankAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    BankAddModalView,
  };
}