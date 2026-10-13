import { ADDON_TYPES, type AddonType, type CatalogService, type RateCardCatalog } from './rateCardCatalogTypes';

const KNOWN: ReadonlySet<string> = new Set(ADDON_TYPES);

export const isAddonType = (type: string): type is AddonType => KNOWN.has(type);

/**
 * Known add-ons only, sorted by `order` (a service's catalog `addons`, else the
 * catalog order). Saved add-ons come back in no set order (rate-card-addons §Reading).
 */
export const orderAddons = <T extends { type: string }>(
  addons: readonly T[],
  order: readonly AddonType[] = ADDON_TYPES,
): (T & { type: AddonType })[] => {
  const rank = (type: AddonType) => {
    const index = order.indexOf(type);
    return index === -1 ? order.length : index;
  };
  return addons
    .filter((addon): addon is T & { type: AddonType } => isAddonType(addon.type))
    .sort((a, b) => rank(a.type) - rank(b.type));
};

const knownServiceAddons = (service: CatalogService): CatalogService => ({
  ...service,
  addons: service.addons.filter(isAddonType),
});

/** The catalog without add-on types this build can't render; the raw copy stays cached. */
export const withKnownAddons = (catalog: RateCardCatalog): RateCardCatalog => ({
  ...catalog,
  platforms: catalog.platforms.map(platform => ({
    ...platform,
    services: platform.services.map(knownServiceAddons),
  })),
  platform_agnostic_services: catalog.platform_agnostic_services.map(knownServiceAddons),
  addons: catalog.addons.filter(addon => isAddonType(addon.type)),
});
