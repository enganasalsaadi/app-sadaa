import type { CatalogService, RateCardCatalog, RateService } from '@/core/api';

/** Services a creator can price in one place: a linked platform, or `null` = in person. */
export interface RateServiceGroup {
  platform: string | null;
  /** Catalog label for a platform; `null` for the in-person group (the app names it). */
  label: string | null;
  services: CatalogService[];
}

/**
 * Editor rule (handoff §3): the services of the creator's linked platforms, in
 * the given order, then the platform-free ones. Platforms the catalog does not
 * price are left out.
 */
export const buildRateServiceGroups = (
  catalog: RateCardCatalog,
  linkedPlatforms: readonly string[],
): RateServiceGroup[] => {
  const groups: RateServiceGroup[] = [];
  for (const key of new Set(linkedPlatforms)) {
    const platform = catalog.platforms.find(entry => entry.key === key);
    if (platform && platform.services.length > 0) {
      groups.push({ platform: platform.key, label: platform.label, services: platform.services });
    }
  }
  if (catalog.platform_agnostic_services.length > 0) {
    groups.push({ platform: null, label: null, services: catalog.platform_agnostic_services });
  }
  return groups;
};

export const findCatalogService = (
  catalog: RateCardCatalog,
  platform: string | null,
  service: RateService,
): CatalogService | null => {
  const services =
    platform === null
      ? catalog.platform_agnostic_services
      : catalog.platforms.find(entry => entry.key === platform)?.services ?? [];
  return services.find(entry => entry.key === service) ?? null;
};

/** Package values are numbers or strings server-side; forms key them as strings. */
export const toPackageKey = (value: string | number | null | undefined): string | null =>
  value == null ? null : String(value);

/** The catalog's own value (number or string) for a form key, so the API gets its type back. */
export const toPackageValue = (
  service: CatalogService,
  key: string | null,
): string | number | null =>
  key == null ? null : service.package?.options.find(option => String(option.value) === key)?.value ?? null;

const HOURS_PER_DAY = 24;

/**
 * Rush must be strictly faster than the normal delivery (handoff §3: 24h needs
 * 2+ days, 48h needs 3+ days).
 */
export const isRushAllowed = (deliveryHours: number, deliveryDays: number): boolean =>
  deliveryHours < deliveryDays * HOURS_PER_DAY;
