import type { CustomerSelectOption } from '../types/Customer';

/** Customer dropdown labels as "CODE - Shop - Name", so a customer is found by its code or its name. */
export const withCustomerCode = (customers: CustomerSelectOption[]): CustomerSelectOption[] => customers.map((c) => (c.code ? { ...c, label: `${c.code} - ${c.label}` } : c));
