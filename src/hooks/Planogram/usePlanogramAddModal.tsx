import { useState } from 'react';
import { PlanogramAdd } from '../../pages/Planogram/PlanogramAdd';
import type { PlanogramFormData } from '../../types/Planogram';
import type { SelectOption } from '../../components/ui/Select';

interface PlanogramAddModalData {
  initialData?: PlanogramFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  products?: SelectOption[];
  stores?: SelectOption[];
  categories?: SelectOption[];
}

interface PlanogramAddModalEvent {
  eventType: 'PlanogramCreated' | 'PlanogramUpdated';
  planogram: PlanogramFormData;
}

export default function usePlanogramAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: PlanogramAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: PlanogramAddModalData = {}): Promise<PlanogramFormData | null> {
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

  function onEvent(event: PlanogramAddModalEvent) {
    if (event.eventType === 'PlanogramCreated' || event.eventType === 'PlanogramUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.planogram);
    }
  }

  const PlanogramAddModalView = () => (
    <PlanogramAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    PlanogramAddModalView,
  };
}