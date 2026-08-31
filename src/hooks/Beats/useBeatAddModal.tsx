import { useState } from 'react';
import { BeatAdd } from '../../pages/Beats/BeatAdd';
import type { BeatFormData } from '../../types/Beat';

interface BeatAddModalData {
  editData?: any;
}

export default function useBeatAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  const [state, setState] = useState<{ isOpen: boolean; data: BeatAddModalData | null }>({
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

  function onSubmit() {
    setState({ isOpen: false, data: null });
    resolver?.(true);
  }

  const BeatAddModalView = () => (
    <BeatAdd isOpen={state.isOpen} onClose={onClose} onSubmit={onSubmit} editData={state.data?.editData} />
  );

  return { open, BeatAddModalView };
}
