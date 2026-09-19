import type { Organisation } from '../types/Organisation';

export const STORAGE_KEY_ORG = 'organisation';

/**
 * Get cached organisation details from localStorage.
 */
export function getStoredOrganisation(): Organisation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORG);
    if (!raw) {
      const userRaw = localStorage.getItem('rc-user');
      if (userRaw) {
        const parsedUser = JSON.parse(userRaw);
        if (parsedUser?.organisation) {
          return parsedUser.organisation as Organisation;
        }
      }
      return null;
    }
    return JSON.parse(raw) as Organisation;
  } catch (error) {
    console.error('Failed to parse organisation from localStorage', error);
    return null;
  }
}

/**
 * Save organisation details to localStorage.
 */
export function setStoredOrganisation(org: Organisation | null): void {
  try {
    if (!org) {
      clearStoredOrganisation();
      return;
    }
    const serialized = JSON.stringify(org);
    localStorage.setItem(STORAGE_KEY_ORG, serialized);

    // Also update organisation inside rc-user if rc-user exists
    const userRaw = localStorage.getItem('rc-user');
    if (userRaw) {
      const parsedUser = JSON.parse(userRaw);
      parsedUser.organisation = org;
      localStorage.setItem('rc-user', JSON.stringify(parsedUser));
    }
  } catch (error) {
    console.error('Failed to save organisation to localStorage', error);
  }
}

/**
 * Remove organisation details from localStorage (e.g. on logout).
 */
export function clearStoredOrganisation(): void {
  localStorage.removeItem(STORAGE_KEY_ORG);
}

/**
 * Quick helper to get organisation's country details from localStorage.
 */
export function getStoredOrgCountry(): {
  code?: string;
  name?: string;
  dialCode?: string;
  currency?: string;
  currencyCode?: string;
  currencySymbol?: string;
} | null {
  const org = getStoredOrganisation();
  const c = org?.country;
  if (!c) return null;

  return {
    code: c.countryCode,
    name: c.name,
    dialCode: c.dialCode ?? undefined,
    currency: c.currency ?? undefined,
    currencyCode: c.currencyCode ?? undefined,
    currencySymbol: c.currencySymbol ?? undefined,
  };
}
