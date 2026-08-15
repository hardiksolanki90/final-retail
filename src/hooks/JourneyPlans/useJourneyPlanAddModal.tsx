import { useState } from 'react';
import { JourneyPlanAdd } from '../../pages/JourneyPlans/JourneyPlanAdd';
import type { JourneyPlanFormData } from '../../types/JourneyPlan';
import type { SelectOption } from '../../components/ui/Select';

interface JourneyPlanAddModalData {
  initialData?: JourneyPlanFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  routes?: SelectOption[];
  customers?: SelectOption[];
  beats?: SelectOption[];
}

interface JourneyPlanAddModalEvent {
  eventType: 'JourneyPlanCreated' | 'JourneyPlanUpdated';
  journeyPlan: JourneyPlanFormData;
}

export default function useJourneyPlanAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: JourneyPlanAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: JourneyPlanAddModalData = {}): Promise<JourneyPlanFormData | null> {
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

  function onEvent(event: JourneyPlanAddModalEvent) {
    if (event.eventType === 'JourneyPlanCreated' || event.eventType === 'JourneyPlanUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.journeyPlan);
    }
  }

  const JourneyPlanAddModalView = () => (
    <JourneyPlanAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    JourneyPlanAddModalView,
  };
}