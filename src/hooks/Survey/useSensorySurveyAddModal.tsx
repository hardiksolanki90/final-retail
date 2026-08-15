import { useState } from 'react';
import { SensorySurveyAdd } from '../../pages/Surveys/SensorySurveyAdd';
import type { SensorySurveyFormData } from '../../types/Survey';
import type { SelectOption } from '../../components/ui/Select';

interface SensorySurveyAddModalData {
  initialData?: SensorySurveyFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  products?: SelectOption[];
}

interface SensorySurveyAddModalEvent {
  eventType: 'SensorySurveyCreated' | 'SensorySurveyUpdated';
  sensorySurvey: SensorySurveyFormData;
}

export default function useSensorySurveyAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: SensorySurveyAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: SensorySurveyAddModalData = {}): Promise<SensorySurveyFormData | null> {
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

  function onEvent(event: SensorySurveyAddModalEvent) {
    if (event.eventType === 'SensorySurveyCreated' || event.eventType === 'SensorySurveyUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.sensorySurvey);
    }
  }

  const SensorySurveyAddModalView = () => (
    <SensorySurveyAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    SensorySurveyAddModalView,
  };
}