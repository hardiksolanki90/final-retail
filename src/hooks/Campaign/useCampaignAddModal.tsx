import { useState } from 'react';
import { CampaignAdd } from '../../pages/Campaign/CampaignAdd';
import type { CampaignFormData } from '../../types/Campaign';
import type { SelectOption } from '../../components/ui/Select';

interface CampaignAddModalData {
  initialData?: CampaignFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  products?: SelectOption[];
  channels?: SelectOption[];
  regions?: SelectOption[];
}

interface CampaignAddModalEvent {
  eventType: 'CampaignCreated' | 'CampaignUpdated';
  campaign: CampaignFormData;
}

export default function useCampaignAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: CampaignAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: CampaignAddModalData = {}): Promise<CampaignFormData | null> {
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

  function onEvent(event: CampaignAddModalEvent) {
    if (event.eventType === 'CampaignCreated' || event.eventType === 'CampaignUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.campaign);
    }
  }

  const CampaignAddModalView = () => (
    <CampaignAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    CampaignAddModalView,
  };
}