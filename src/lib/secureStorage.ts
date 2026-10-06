// AES-GCM-256 encryption for values cached in localStorage, via Web Crypto.
//
// The key is generated as non-extractable (its raw bytes can never be read)
// and persisted in IndexedDB, which can store CryptoKey objects. It is rotated
// on every login and destroyed on logout, so old ciphertext becomes unreadable.
//
// Limit: this protects data at rest (DevTools, disk, copied profiles). Script
// running inside the app (XSS) can still call decryptJSON, so never store
// anything here the frontend doesn't genuinely need.

const DB_NAME = 'rc-secure';
const STORE = 'keys';
const KEY_ID = 'app-config';
const FORMAT_VERSION = 1;

/**
 * Web Crypto (crypto.subtle) exists only in secure contexts — HTTPS or
 * localhost. On plain-HTTP hosts (e.g. http://retail-chain.test) nothing is
 * persisted; callers keep the data in memory instead of storing plain text.
 */
export const canEncrypt = (): boolean => Boolean(globalThis.isSecureContext && globalThis.crypto?.subtle);

interface Envelope {
  v: number;
  iv: string;
  ct: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = run(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function readKey(): Promise<CryptoKey | undefined> {
  return withStore<CryptoKey | undefined>('readonly', (s) => s.get(KEY_ID));
}

/** Replaces the key; anything encrypted with the old one can no longer be read. */
export async function rotateKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await withStore('readwrite', (s) => s.put(key, KEY_ID));
  return key;
}

export async function destroyKey(): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.delete(KEY_ID));
  } catch {
    // IndexedDB unavailable (private mode etc.) — nothing to destroy.
  }
}

const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export async function encryptJSON(value: unknown): Promise<string> {
  const key = (await readKey()) ?? (await rotateKey());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  const envelope: Envelope = { v: FORMAT_VERSION, iv: toB64(iv), ct: toB64(ct) };
  return JSON.stringify(envelope);
}

/** Returns null for missing, tampered, or foreign-key data — never throws. */
export async function decryptJSON<T>(stored: string | null): Promise<T | null> {
  if (!stored) return null;
  try {
    const envelope = JSON.parse(stored) as Envelope;
    if (envelope.v !== FORMAT_VERSION) return null;
    const key = await readKey();
    if (!key) return null;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(envelope.iv) }, key, fromB64(envelope.ct));
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}
