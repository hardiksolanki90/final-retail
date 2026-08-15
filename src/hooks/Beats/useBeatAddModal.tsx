import { useState } from 'react';
import { BeatAdd } from '../../pages/Beats/BeatAdd';
import type { BeatFormData } from '../../types/Beat';
import type { SelectOption } from '../../components/ui/Select';

interface BeatAddModalData {
  initialData?: BeatFormData;
  isLoading?: boolean;
  routes?: SelectOption[];
  regions?: SelectOption[];
  salesmen?: SelectOption[];
}

interface BeatAddModalEvent {
  eventType: 'BeatCreated' | 'BeatUpdated';
  beat: BeatFormData;
}

export default function useBeatAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: BeatAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: BeatAddModalData = {}): Promise<BeatFormData | null> {
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

  function onEvent(event: BeatAddModalEvent) {
    if (event.eventType === 'BeatCreated' || event.eventType === 'BeatUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.beat);
    }
  }

  const BeatAddModalView = () => (
    <BeatAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    BeatAddModalView,
  };
}