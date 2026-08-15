import { useState } from 'react';
import { ShareOfShelfAdd } from '../../pages/ShareOfShelf/ShareOfShelfAdd';
import type { ShareOfShelfFormData } from '../../types/ShareOfShelf';
import type { SelectOption } from '../../components/ui/Select';

interface ShareOfShelfAddModalData {
  initialData?: ShareOfShelfFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  stores?: SelectOption[];
  brands?: SelectOption[];
  categories?: SelectOption[];
}

interface ShareOfShelfAddModalEvent {
  eventType: 'ShareOfShelfCreated' | 'ShareOfShelfUpdated';
  shareOfShelf: ShareOfShelfFormData;
}

export default function useShareOfShelfAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ShareOfShelfAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ShareOfShelfAddModalData = {}): Promise<ShareOfShelfFormData | null> {
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

  function onEvent(event: ShareOfShelfAddModalEvent) {
    if (event.eventType === 'ShareOfShelfCreated' || event.eventType === 'ShareOfShelfUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.shareOfShelf);
    }
  }

  const ShareOfShelfAddModalView = () => (
    <ShareOfShelfAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ShareOfShelfAddModalView,
  };
}