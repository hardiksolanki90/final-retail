import { useState } from 'react';
import { AssetTrackingAdd } from '../../pages/AssetTracking/AssetTrackingAdd';
import type { AssetTrackingFormData } from '../../types/AssetTracking';
import type { SelectOption } from '../../components/ui/Select';

interface AssetTrackingAddModalData {
  initialData?: AssetTrackingFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  categories?: SelectOption[];
}

interface AssetTrackingAddModalEvent {
  eventType: 'AssetTrackingCreated' | 'AssetTrackingUpdated';
  assetTracking: AssetTrackingFormData;
}

export default function useAssetTrackingAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: AssetTrackingAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: AssetTrackingAddModalData = {}): Promise<AssetTrackingFormData | null> {
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

  function onEvent(event: AssetTrackingAddModalEvent) {
    if (event.eventType === 'AssetTrackingCreated' || event.eventType === 'AssetTrackingUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.assetTracking);
    }
  }

  const AssetTrackingAddModalView = () => (
    <AssetTrackingAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    AssetTrackingAddModalView,
  };
}