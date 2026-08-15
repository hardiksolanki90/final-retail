import { useState } from 'react';
import { ConsumerSurveyAdd } from '../../pages/Surveys/ConsumerSurveyAdd';
import type { ConsumerSurveyFormData } from '../../types/Survey';
import type { SelectOption } from '../../components/ui/Select';

interface ConsumerSurveyAddModalData {
  initialData?: ConsumerSurveyFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
}

interface ConsumerSurveyAddModalEvent {
  eventType: 'ConsumerSurveyCreated' | 'ConsumerSurveyUpdated';
  consumerSurvey: ConsumerSurveyFormData;
}

export default function useConsumerSurveyAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: ConsumerSurveyAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: ConsumerSurveyAddModalData = {}): Promise<ConsumerSurveyFormData | null> {
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

  function onEvent(event: ConsumerSurveyAddModalEvent) {
    if (event.eventType === 'ConsumerSurveyCreated' || event.eventType === 'ConsumerSurveyUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.consumerSurvey);
    }
  }

  const ConsumerSurveyAddModalView = () => (
    <ConsumerSurveyAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    ConsumerSurveyAddModalView,
  };
}