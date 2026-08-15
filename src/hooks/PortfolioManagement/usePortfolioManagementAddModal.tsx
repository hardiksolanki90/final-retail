import { useState } from 'react';
import { PortfolioManagementAdd } from '../../pages/PortfolioManagements/PortfolioManagementAdd';
import type { PortfolioManagementFormData } from '../../types/PortfolioManagement';
import type { SelectOption } from '../../components/ui/Select';

interface PortfolioManagementAddModalData {
  initialData?: PortfolioManagementFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  customers?: SelectOption[];
  items?: SelectOption[];
}

interface PortfolioManagementAddModalEvent {
  eventType: 'PortfolioManagementCreated' | 'PortfolioManagementUpdated';
  portfolioManagement: PortfolioManagementFormData;
}

export default function usePortfolioManagementAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: PortfolioManagementAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: PortfolioManagementAddModalData = {}): Promise<PortfolioManagementFormData | null> {
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

  function onEvent(event: PortfolioManagementAddModalEvent) {
    if (event.eventType === 'PortfolioManagementCreated' || event.eventType === 'PortfolioManagementUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.portfolioManagement);
    }
  }

  const PortfolioManagementAddModalView = () => (
    <PortfolioManagementAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    PortfolioManagementAddModalView,
  };
}