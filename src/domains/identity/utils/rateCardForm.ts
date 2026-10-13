import type { CatalogService } from '@/core/api';
import {
  fromPriceUsd,
  toPackageKey,
  toPackageValue,
  toPriceUsd,
  type RateCard,
  type RateCardInput,
  type RateCardPatch,
} from '@/domains/auth';
import { RATE_GROUP_IN_PERSON } from '../constants/rateCards';
import type { RateCardFormValues } from '../schemas/rateCardSchema';
import {
  addonsChanged,
  toAddonForms,
  toAddonInputs,
  unmanagedAddons,
  type AddonDef,
  type AddonInputRow,
} from './rateCardAddonForm';

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
  addons: [],
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

/** Prefill; `defs` = the add-ons the card's service offers today. */
export const toRateCardForm = (card: RateCard, defs: readonly AddonDef[]): RateCardFormValues => ({
  group: platformToGroup(card.platform),
  service: card.service.key,
  packageValue: toPackageKey(card.package?.value),
  price: fromPriceUsd(card.price_usd),
  deliveryDays: card.delivery_days,
  revisions: card.revisions,
  retention: card.retention?.key ?? null,
  addons: toAddonForms(defs, card.addons),
});

export interface RateCardSave<TBody> {
  body: TBody;
  /** The add-ons sent first, in order, with their form rows (422 `addons.{i}` mapping). */
  addons: AddonInputRow[];
}

/** `POST` body; `null` while the form is incomplete (the schema blocks that first). */
export const toRateCardInput = (
  values: RateCardFormValues,
  service: CatalogService,
  defs: readonly AddonDef[],
): RateCardSave<RateCardInput> | null => {
  if (!values.group || !values.price) return null;
  const addons = toAddonInputs(defs, values.addons);
  const body: RateCardInput = {
    platform: groupToPlatform(values.group),
    service: service.key,
    ...(service.package ? { package_value: toPackageValue(service, values.packageValue) } : {}),
    price_usd: toPriceUsd(values.price),
    delivery_days: values.deliveryDays,
    revisions: values.revisions,
    ...(service.criteria.retention && values.retention ? { retention: values.retention } : {}),
    // Hidden attributes are never sent: the server applies their defaults.
    addons: addons.map(entry => entry.input),
  };
  return { body, addons };
};

/**
 * `PATCH` body: changed fields only (handoff §4.2). `addons` replaces the whole
 * list, so saved add-ons the editor doesn't show are sent back unchanged.
 */
export const toRateCardPatch = (
  values: RateCardFormValues,
  card: RateCard,
  service: CatalogService,
  defs: readonly AddonDef[],
): RateCardSave<RateCardPatch> => {
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
  const changed = addonsChanged(defs, values.addons, card.addons);
  const addons = changed ? toAddonInputs(defs, values.addons) : [];
  if (changed) {
    patch.addons = [...addons.map(entry => entry.input), ...unmanagedAddons(defs, card.addons)];
  }
  return { body: patch, addons };
};
