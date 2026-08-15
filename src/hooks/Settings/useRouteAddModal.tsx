import { useState } from 'react';
import { RouteAdd } from '../../pages/Settings/Route/RouteAdd';
import type { RouteFormData } from '../../types/Route';

interface RouteAddModalData {
  initialData?: RouteFormData;
  isLoading?: boolean;
}

interface RouteAddModalEvent {
  eventType: 'RouteCreated' | 'RouteUpdated';
  route: RouteFormData;
}

export default function useRouteAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: RouteAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: RouteAddModalData = {}): Promise<RouteFormData | null> {
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

  function onEvent(event: RouteAddModalEvent) {
    if (event.eventType === 'RouteCreated' || event.eventType === 'RouteUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.route);
    }
  }

  const RouteAddModalView = () => (
    <RouteAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    RouteAddModalView,
  };
}