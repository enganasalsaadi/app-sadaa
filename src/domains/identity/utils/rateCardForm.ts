import type { CatalogService, RateCardCatalog } from '@/core/api';
import {
  fromPriceUsd,
  toPackageKey,
  toPackageValue,
  toPriceUsd,
  type RateCard,
  type RateCardAddonInput,
  type RateCardInput,
  type RateCardPatch,
} from '@/domains/auth';
import { RATE_GROUP_IN_PERSON, RUSH_ADDON } from '../constants/rateCards';
import type { RateCardFormValues } from '../schemas/rateCardSchema';

/** Server delivery default when no service is picked yet (handoff §4.1). */
const FALLBACK_DELIVERY_DAYS = 5;
const FALLBACK_REVISIONS = 1;
/** Marks a priced service that has no package: one card per service. */
const NO_PACKAGE = '';

export const groupToPlatform = (group: string): string | null =>
  group === RATE_GROUP_IN_PERSON ? null : group;

export const platformToGroup = (platform: string | null): string => platform ?? RATE_GROUP_IN_PERSON;

/** Package keys (or `NO_PACKAGE`) already priced for one service, `exceptId` = the card being edited. */
export const takenPackageKeys = (
  cards: readonly RateCard[],
  platform: string | null,
  service: string,
  exceptId: string | null = null,
): Set<string> =>
  new Set(
    cards
      .filter(card => card.id !== exceptId && card.platform === platform && card.service.key === service)
      .map(card => toPackageKey(card.package?.value) ?? NO_PACKAGE),
  );

/** Whether a new card can still be added for this service (a free package, or no card yet). */
export const hasFreeSlot = (
  service: CatalogService,
  taken: ReadonlySet<string>,
): boolean =>
  service.package
    ? service.package.options.some(option => !taken.has(String(option.value)))
    : !taken.has(NO_PACKAGE);

/** A blank form; `group` preset when opened from a platform's "Add". */
export const emptyRateCardForm = (group: string | null): RateCardFormValues => ({
  group,
  service: null,
  packageValue: null,
  price: null,
  deliveryDays: FALLBACK_DELIVERY_DAYS,
  revisions: FALLBACK_REVISIONS,
  retention: null,
  rushEnabled: false,
  rushHours: null,
  rushPrice: null,
});

/**
 * Catalog defaults for a freshly picked service. The package is the catalog
 * default when still free, else the first free one.
 */
export const serviceDefaults = (
  service: CatalogService,
  taken: ReadonlySet<string>,
): Pick<RateCardFormValues, 'packageValue' | 'deliveryDays' | 'revisions' | 'retention'> => {
  const pkg = service.package;
  const free = pkg?.options.map(option => String(option.value)).filter(key => !taken.has(key)) ?? [];
  const preferred = pkg ? String(pkg.default) : null;
  return {
    packageValue: pkg ? (preferred && free.includes(preferred) ? preferred : free[0] ?? null) : null,
    deliveryDays: service.criteria.delivery_days.default,
    revisions: service.criteria.revisions.default,
    retention: service.criteria.retention?.default ?? null,
  };
};

const findAddon = (card: RateCard, type: string) => card.addons.find(addon => addon.type === type);

export const toRateCardForm = (card: RateCard): RateCardFormValues => {
  const rush = findAddon(card, RUSH_ADDON);
  const hours = rush?.options.delivery_hours;
  return {
    group: platformToGroup(card.platform),
    service: card.service.key,
    packageValue: toPackageKey(card.package?.value),
    price: fromPriceUsd(card.price_usd),
    deliveryDays: card.delivery_days,
    revisions: card.revisions,
    retention: card.retention?.key ?? null,
    rushEnabled: !!rush,
    rushHours: typeof hours === 'number' ? hours : null,
    rushPrice: rush ? fromPriceUsd(rush.amount) : null,
  };
};

const rushInput = (values: RateCardFormValues): RateCardAddonInput | null =>
  values.rushEnabled && values.rushPrice && values.rushHours != null
    ? {
        type: RUSH_ADDON,
        pricing_mode: 'fixed',
        amount: toPriceUsd(values.rushPrice),
        options: { delivery_hours: values.rushHours },
      }
    : null;

/** `POST` body; `null` while the form is incomplete (the schema blocks that first). */
export const toRateCardInput = (
  values: RateCardFormValues,
  service: CatalogService,
): RateCardInput | null => {
  if (!values.group || !values.price) return null;
  const rush = service.addons.includes(RUSH_ADDON) ? rushInput(values) : null;
  return {
    platform: groupToPlatform(values.group),
    service: service.key,
    ...(service.package ? { package_value: toPackageValue(service, values.packageValue) } : {}),
    price_usd: toPriceUsd(values.price),
    delivery_days: values.deliveryDays,
    revisions: values.revisions,
    ...(service.criteria.retention && values.retention ? { retention: values.retention } : {}),
    // Hidden attributes are never sent: the server applies their defaults.
    addons: rush ? [rush] : [],
  };
};

const sameRush = (card: RateCard, next: RateCardAddonInput | null): boolean => {
  const saved = findAddon(card, RUSH_ADDON);
  if (!saved || !next) return !saved && !next;
  return (
    fromPriceUsd(saved.amount)?.amount === fromPriceUsd(next.amount)?.amount &&
    saved.options.delivery_hours === next.options?.delivery_hours
  );
};

/**
 * `PATCH` body: changed fields only (handoff §4.2). `addons` replaces the whole
 * list, so add-ons this editor doesn't manage are sent back unchanged.
 */
export const toRateCardPatch = (
  values: RateCardFormValues,
  card: RateCard,
  service: CatalogService,
): RateCardPatch => {
  const patch: RateCardPatch = {};
  if (service.package && values.packageValue !== toPackageKey(card.package?.value)) {
    patch.package_value = toPackageValue(service, values.packageValue);
  }
  if (values.price && values.price.amount !== fromPriceUsd(card.price_usd)?.amount) {
    patch.price_usd = toPriceUsd(values.price);
  }
  if (values.deliveryDays !== card.delivery_days) patch.delivery_days = values.deliveryDays;
  if (values.revisions !== card.revisions) patch.revisions = values.revisions;
  if (service.criteria.retention && values.retention && values.retention !== card.retention?.key) {
    patch.retention = values.retention;
  }
  if (service.addons.includes(RUSH_ADDON)) {
    const rush = rushInput(values);
    if (!sameRush(card, rush)) {
      const others = card.addons
        .filter(addon => addon.type !== RUSH_ADDON)
        .map<RateCardAddonInput>(({ type, pricing_mode, amount, options }) => ({
          type,
          pricing_mode,
          amount,
          options,
        }));
      patch.addons = rush ? [rush, ...others] : others;
    }
  }
  return patch;
};

/** The rush add-on definition, when the catalog offers it with a fixed price. */
export const findRushAddon = (catalog: RateCardCatalog) => {
  const addon = catalog.addons.find(entry => entry.type === RUSH_ADDON);
  const fixed = addon?.pricing_modes.find(mode => mode.key === 'fixed');
  const hours = addon?.options.find(option => option.key === 'delivery_hours');
  if (!addon || !fixed || !hours) return null;
  return {
    label: addon.label,
    min: fixed.min,
    max: fixed.max,
    hours: hours.options.flatMap(option =>
      typeof option.value === 'number' ? [{ value: option.value, label: option.label ?? null }] : [],
    ),
    defaultHours: typeof hours.default === 'number' ? hours.default : null,
  };
};
