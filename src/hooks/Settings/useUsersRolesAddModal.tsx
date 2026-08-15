import { useState } from 'react';
import { UsersRolesAdd } from '../../pages/Settings/UsersRoles/UsersRolesAdd';
import type { UserRoleFormData } from '../../types/UsersRoles';
import type { SelectOption } from '../../components/ui/Select';

interface UsersRolesAddModalData {
  initialData?: UserRoleFormData;
  isLoading?: boolean;
  permissions?: SelectOption[];
}

interface UsersRolesAddModalEvent {
  eventType: 'UsersRolesCreated' | 'UsersRolesUpdated';
  usersRoles: UserRoleFormData;
}

export default function useUsersRolesAddModal() {
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);
  
  const [state, setState] = useState<{
    isOpen: boolean;
    data: UsersRolesAddModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  function open(data: UsersRolesAddModalData = {}): Promise<UserRoleFormData | null> {
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

  function onEvent(event: UsersRolesAddModalEvent) {
    if (event.eventType === 'UsersRolesCreated' || event.eventType === 'UsersRolesUpdated') {
      setState({ isOpen: false, data: null });
      resolver?.(event.usersRoles);
    }
  }

  const UsersRolesAddModalView = () => (
    <UsersRolesAdd
      isOpen={state.isOpen}
      onClose={onClose}
      data={state.data}
      onEvent={onEvent}
    />
  );

  return {
    open,
    UsersRolesAddModalView,
  };
}