import { useState } from 'react';
import { RouteItemGroupingAdd } from '../../pages/RouteItemGroupings/RouteItemGroupingAdd';
import type { RouteItemGroupingFormData } from '../../types/RouteItemGrouping';
import type { SelectOption } from '../../components/ui/Select';

interface RouteItemGroupingAddModalData {
  initialData?: RouteItemGroupingFormData;
  isLoading?: boolean;
  routes?: SelectOption[];
  items?: SelectOption[];
}

interface RouteItemGroupingAddModalEvent {
  eventType: 'RouteItemGroupingCreated' | 'RouteItemGroupingUpdated';
  routeItemGrouping: RouteItemGroupingFormData;
}

export default function useRouteItemGroupingAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: RouteItemGroupingAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: RouteItemGroupingAddModalData = {}): Promise<RouteItemGroupingFormData | null> {
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

  function onEvent(event: RouteItemGroupingAddModalEvent) {
    if (event.eventType === 'RouteItemGroupingCreated' || event.eventType === 'RouteItemGroupingUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.routeItemGrouping);
    }
  }

  const RouteItemGroupingAddModalView = () => (
    <RouteItemGroupingAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    RouteItemGroupingAddModalView,
  };
}