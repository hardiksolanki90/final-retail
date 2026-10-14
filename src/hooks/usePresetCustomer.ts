import { useLocation } from 'react-router-dom';

/** Customer handed over in router state by the customer view's "Create …" buttons, so a new document starts with it picked; ignored when editing. */
export function usePresetCustomer(isEdit: boolean): { id: string; label: string } | null {
  const customer = (useLocation().state as { customer?: { id?: string | null; label?: string | null } } | null)?.customer;
  return !isEdit && customer?.id ? { id: customer.id, label: customer.label || customer.id } : null;
}
