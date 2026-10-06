import { getAppConfig } from '../api/AppConfigApi';
import { canEncrypt, decryptJSON, destroyKey, encryptJSON, rotateKey } from '../lib/secureStorage';
import { settingsMenu, sidebarMenu, type MenuSection, type SettingsMenuItem } from '../data/menuData';
import type { AppConfig, ConfigCurrency, ConfigOrganisation } from '../types/AppConfig';

const STORAGE_KEY = 'rc-app-config';
const CONFIG_VERSION = 1;
// Plain-text keys written by older builds — wiped on load/logout.
const LEGACY_KEYS = ['organisation', 'rc-user', 'user', 'token', 'rc-auth-token', 'isAuthenticated'];

export const fetchAppConfig = getAppConfig;

export async function loadStoredConfig(): Promise<AppConfig | null> {
  if (!canEncrypt()) return null;
  const config = await decryptJSON<AppConfig>(localStorage.getItem(STORAGE_KEY));
  if (!config || config.version !== CONFIG_VERSION || !config.user?.uuid) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return config;
}

let warnedInsecure = false;

export async function saveConfig(config: AppConfig, { newSession = false } = {}): Promise<void> {
  if (!canEncrypt()) {
    // Never fall back to plain text — config stays in memory, refetched on reload.
    if (!warnedInsecure) {
      console.info('App config not cached: encrypted storage needs HTTPS or localhost.');
      warnedInsecure = true;
    }
    return;
  }
  try {
    if (newSession) await rotateKey();
    localStorage.setItem(STORAGE_KEY, await encryptJSON(config));
  } catch (error) {
    // Storage/crypto unavailable — config still lives in memory for this tab.
    console.warn('Could not persist app config', error);
  }
}

export async function updateConfig(current: AppConfig, partial: Partial<AppConfig>): Promise<AppConfig> {
  const next = { ...current, ...partial };
  await saveConfig(next);
  return next;
}

export async function clearConfig(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  await destroyKey();
}

export function removeLegacyKeys(): void {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function hasPermission(config: AppConfig | null, permission: string): boolean {
  return config?.role?.permissions.includes(permission) ?? false;
}

export function getSidebarMenu(config: AppConfig | null): MenuSection[] {
  return sidebarMenu
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.permission || hasPermission(config, item.permission)) }))
    .filter((section) => section.items.length > 0);
}

export function getSettingsMenu(config: AppConfig | null): SettingsMenuItem[] {
  return settingsMenu.filter((item) => !item.permission || hasPermission(config, item.permission));
}

/** Default currency (currencies table), else the organisation's currency. */
export function getEffectiveCurrency(config: AppConfig | null): ConfigCurrency | null {
  if (!config) return null;
  if (config.currency.effective) return config.currency.effective;
  const code = config.currency.default?.code ?? config.currency.organisation;
  return code ? { code, symbol: null, decimalDigits: 2 } : null;
}

interface LoginUserPayload {
  uuid: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile?: string | null;
  usertype: number;
  role?: { name: string; permissions: string[] } | null;
  organisation?: ConfigOrganisation | null;
}

/**
 * In-memory fallback built from the login response when /app/config fails,
 * so a config outage never blocks login. Never persisted — the next app load
 * fetches the real config.
 */
export function configFromLoginUser(user: LoginUserPayload): AppConfig {
  const organisation = user.organisation ?? null;
  const defaultCurrency = organisation?.default_currency ?? null;
  const orgCode = organisation?.org_currency ?? null;
  return {
    version: CONFIG_VERSION,
    generatedAt: new Date().toISOString(),
    user: { uuid: user.uuid, firstname: user.firstname, lastname: user.lastname, email: user.email, mobile: user.mobile, usertype: user.usertype },
    role: user.role ? { name: user.role.name, permissions: user.role.permissions } : null,
    organisation,
    tax: null,
    currency: { organisation: orgCode, default: defaultCurrency, effective: defaultCurrency ?? (orgCode ? { code: orgCode, symbol: null, decimalDigits: 2 } : null) },
  };
}
