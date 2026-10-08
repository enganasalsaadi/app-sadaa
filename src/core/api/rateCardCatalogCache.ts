import { appStorage, StorageKeys } from '@/core/storage';
import type { RateCardCatalog } from './rateCardCatalogTypes';

export interface CatalogCacheEntry {
  /** `null` when the server sent no ETag: the next read refetches in full. */
  etag: string | null;
  catalog: RateCardCatalog;
}

type CatalogCache = Partial<Record<string, CatalogCacheEntry>>;

const isEntry = (value: unknown): value is CatalogCacheEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  const { catalog } = entry;
  return (
    (typeof entry.etag === 'string' || entry.etag === null) &&
    typeof catalog === 'object' &&
    catalog !== null &&
    Array.isArray((catalog as Record<string, unknown>).platforms)
  );
};

/** Stored JSON → per-language entries; anything unreadable is dropped, never thrown. */
export const parseCatalogCache = (raw: string | undefined): CatalogCache => {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, entry]) => isEntry(entry)));
  } catch {
    return {};
  }
};

export const readCatalogCache = (language: string): CatalogCacheEntry | null =>
  parseCatalogCache(appStorage.get(StorageKeys.RATE_CARD_CATALOG_CACHE))[language] ?? null;

export const writeCatalogCache = (language: string, entry: CatalogCacheEntry): void => {
  const cache = parseCatalogCache(appStorage.get(StorageKeys.RATE_CARD_CATALOG_CACHE));
  cache[language] = entry;
  appStorage.set(StorageKeys.RATE_CARD_CATALOG_CACHE, JSON.stringify(cache));
};
