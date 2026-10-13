import type { FieldPath } from 'react-hook-form';
import type { AddonType, CatalogService, RateCardCatalog } from '@/core/api';
import {
  fromPriceUsd,
  isRushAllowed,
  toPriceUsd,
  toRatePriceBounds,
  type RateCard,
  type RatePriceBounds,
  type RateCardAddonInput,
} from '@/domains/auth';
import { RUSH_HOURS_OPTION } from '../constants/rateCards';
import type { RateCardAddonFormValue, RateCardFormValues } from '../schemas/rateCardSchema';

export interface AddonOptionValue {
  value: string | number;
  /** `String(value)`: chips and the form are string-keyed. */
  key: string;
  label: string | null;
}

export interface AddonOptionDef {
  key: string;
  label: string | null;
  values: AddonOptionValue[];
  default: string;
}

/** One add-on the picked service offers, as the editor renders it (catalog-driven). */
export interface AddonDef {
  type: AddonType;
  label: string;
  bounds: RatePriceBounds;
  /** Visible options only; hidden ones are never sent, the server applies their default. */
  options: AddonOptionDef[];
}

/**
 * The service's add-ons in its catalog order, each with its fixed-price range and
 * options. A type without a definition or a fixed price is left out.
 */
export const addonDefinitions = (catalog: RateCardCatalog, service: CatalogService): AddonDef[] =>
  service.addons.flatMap(type => {
    const addon = catalog.addons.find(entry => entry.type === type);
    const fixed = addon?.pricing_modes.find(mode => mode.key === 'fixed');
    if (!addon || !fixed) return [];
    return [
      {
        type,
        label: addon.label,
        bounds: toRatePriceBounds({ min_usd: fixed.min, max_usd: fixed.max }),
        options: addon.options
          .filter(option => option.visible && option.options.length > 0)
          .map(option => ({
            key: option.key,
            label: option.label ?? null,
            values: option.options.map(entry => ({
              value: entry.value,
              key: String(entry.value),
              label: entry.label ?? null,
            })),
            default: String(option.default),
          })),
      },
    ];
  });

/** Values still allowed: a rush window must stay faster than the delivery days. */
export const allowedValues = (option: AddonOptionDef, deliveryDays: number): AddonOptionValue[] =>
  option.key === RUSH_HOURS_OPTION
    ? option.values.filter(entry => typeof entry.value === 'number' && isRushAllowed(entry.value, deliveryDays))
    : option.values;

/**
 * Options for an enabled add-on: the current pick while allowed, else the
 * catalog default, else the slowest allowed value. `null` = cannot be offered
 * with this delivery time.
 */
export const pickAddonOptions = (
  def: AddonDef,
  deliveryDays: number,
  current: Readonly<Record<string, string>> = {},
): Record<string, string> | null => {
  const picked: Record<string, string> = {};
  for (const option of def.options) {
    const allowed = allowedValues(option, deliveryDays).map(entry => entry.key);
    const choice = [current[option.key], option.default].find(key => key !== undefined && allowed.includes(key));
    const fallback = choice ?? allowed[allowed.length - 1];
    if (fallback === undefined) return null;
    picked[option.key] = fallback;
  }
  return picked;
};

type SavedAddon = RateCard['addons'][number];

const savedOptions = (def: AddonDef, saved: SavedAddon): Record<string, string> =>
  Object.fromEntries(
    def.options.map(option => {
      const value = saved.options[option.key];
      const key = typeof value === 'number' || typeof value === 'string' ? String(value) : null;
      return [option.key, key && option.values.some(entry => entry.key === key) ? key : option.default];
    }),
  );

/** One row per offered add-on; saved ones come back enabled with their options and fee. */
export const toAddonForms = (
  defs: readonly AddonDef[],
  saved: readonly SavedAddon[] = [],
): RateCardAddonFormValue[] =>
  defs.map(def => {
    const addon = saved.find(entry => entry.type === def.type);
    return addon
      ? { type: def.type, enabled: true, options: savedOptions(def, addon), price: fromPriceUsd(addon.amount) }
      : { type: def.type, enabled: false, options: {}, price: null };
  });

export interface AddonInputRow {
  /** Index in the form's `addons`. */
  row: number;
  input: RateCardAddonInput;
}

/** Enabled add-ons as API inputs, in form order; options keep the catalog's value type. */
export const toAddonInputs = (
  defs: readonly AddonDef[],
  forms: readonly RateCardAddonFormValue[],
): AddonInputRow[] =>
  forms.flatMap((form, row) => {
    const def = defs.find(entry => entry.type === form.type);
    if (!def || !form.enabled || !form.price) return [];
    const options = Object.fromEntries(
      def.options.flatMap(option => {
        const match = option.values.find(entry => entry.key === form.options[option.key]);
        return match ? [[option.key, match.value]] : [];
      }),
    );
    return [
      {
        row,
        input: {
          type: def.type,
          pricing_mode: 'fixed',
          amount: toPriceUsd(form.price),
          ...(Object.keys(options).length > 0 ? { options } : {}),
        },
      },
    ];
  });

const signature = (defs: readonly AddonDef[], forms: readonly RateCardAddonFormValue[]): string =>
  forms
    .flatMap(form => {
      const def = defs.find(entry => entry.type === form.type);
      if (!def || !form.enabled) return [];
      const options = def.options.map(option => form.options[option.key] ?? '').join(',');
      return [`${form.type}|${form.price?.amount ?? ''}|${options}`];
    })
    .sort()
    .join(';');

/** Whether the editor's add-ons differ from the saved card's (compared per type, fee and options). */
export const addonsChanged = (
  defs: readonly AddonDef[],
  forms: readonly RateCardAddonFormValue[],
  saved: readonly SavedAddon[],
): boolean => signature(defs, forms) !== signature(defs, toAddonForms(defs, saved));

/** Saved add-ons the editor doesn't show (unknown or not offered), sent back unchanged. */
export const unmanagedAddons = (defs: readonly AddonDef[], saved: readonly SavedAddon[]): RateCardAddonInput[] =>
  saved
    .filter(addon => !defs.some(def => def.type === addon.type))
    .map(({ type, pricing_mode, amount, options }) => ({ type, pricing_mode, amount, options }));

/** 422 keys of the sent list (`addons.{i}.*`) → the form row each came from. */
export const addonServerFields = (
  defs: readonly AddonDef[],
  sent: readonly AddonInputRow[],
): Record<string, FieldPath<RateCardFormValues>> => {
  const fields: Record<string, FieldPath<RateCardFormValues>> = {};
  sent.forEach(({ row, input }, index) => {
    const price: FieldPath<RateCardFormValues> = `addons.${row}.price`;
    fields[`addons.${index}.type`] = price;
    fields[`addons.${index}.pricing_mode`] = price;
    fields[`addons.${index}.amount`] = price;
    fields[`addons.${index}.options`] = `addons.${row}.options`;
    defs
      .find(def => def.type === input.type)
      ?.options.forEach(option => {
        fields[`addons.${index}.options.${option.key}`] = `addons.${row}.options`;
      });
  });
  return fields;
};
