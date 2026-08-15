import { useState } from 'react';
import { CompetitorInfoAdd } from '../../pages/CompetitorInfos/CompetitorInfoAdd';
import type { CompetitorInfoFormData } from '../../types/CompetitorInfo';
import type { SelectOption } from '../../components/ui/Select';

interface CompetitorInfoAddModalData {
  initialData?: CompetitorInfoFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  salesmen?: SelectOption[];
  competitors?: SelectOption[];
  brands?: SelectOption[];
  categories?: SelectOption[];
}

interface CompetitorInfoAddModalEvent {
  eventType: 'CompetitorInfoCreated' | 'CompetitorInfoUpdated';
  competitorInfo: CompetitorInfoFormData;
}

export default function useCompetitorInfoAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CompetitorInfoAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CompetitorInfoAddModalData = {}): Promise<CompetitorInfoFormData | null> {
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

  function onEvent(event: CompetitorInfoAddModalEvent) {
    if (event.eventType === 'CompetitorInfoCreated' || event.eventType === 'CompetitorInfoUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.competitorInfo);
    }
  }

  const CompetitorInfoAddModalView = () => (
    <CompetitorInfoAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    CompetitorInfoAddModalView,
  };
}