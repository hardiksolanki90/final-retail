import { useState } from 'react';
import { MerchandiserReplacementAdd } from '../../pages/Settings/MerchandiserReplacement/MerchandiserReplacementAdd';
import type { MerchandiserReplacementFormData } from '../../types/MerchandiserReplacement';
import type { SelectOption } from '../../components/ui/Select';

interface MerchandiserReplacementAddModalData {
  initialData?: MerchandiserReplacementFormData;
  isLoading?: boolean;
  merchandisers?: SelectOption[];
  reasons?: SelectOption[];
}

interface MerchandiserReplacementAddModalEvent {
  eventType: 'MerchandiserReplacementCreated' | 'MerchandiserReplacementUpdated';
  merchandiserReplacement: MerchandiserReplacementFormData;
}

export default function useMerchandiserReplacementAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: MerchandiserReplacementAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: MerchandiserReplacementAddModalData = {}): Promise<MerchandiserReplacementFormData | null> {
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

  function onEvent(event: MerchandiserReplacementAddModalEvent) {
    if (event.eventType === 'MerchandiserReplacementCreated' || event.eventType === 'MerchandiserReplacementUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.merchandiserReplacement);
    }
  }

  const MerchandiserReplacementAddModalView = () => (
    <MerchandiserReplacementAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    MerchandiserReplacementAddModalView,
  };
}