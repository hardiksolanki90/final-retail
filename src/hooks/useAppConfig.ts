import { useAuth } from '../context/AuthContext';

/** Global app config (user, role, organisation, currency, menus) without the auth actions. */
export function useAppConfig() {
  const { config, user, organisation, currency, tax, sidebarMenu, settingsMenu, hasPermission, refreshConfig } = useAuth();
  return { config, user, organisation, currency, tax, sidebarMenu, settingsMenu, hasPermission, refreshConfig };
}
