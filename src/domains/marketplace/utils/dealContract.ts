import { parseUsdOrNull, type Money } from '@/core/money';

/** The contract is issued in both languages; Arabic governs. */
export type ContractLang = 'ar' | 'en';

export interface ContractParty {
  legalName: string | null;
  verified: boolean;
}

export interface ContractDeliverable {
  id: string;
  title: string;
  total: Money | null;
  revisions: number | null;
  retention: string | null;
  deliveryHours: number | null;
}

export interface ContractTerm {
  key: string;
  text: string;
}

/** The signed snapshot, read defensively: a field this build can't read is left out, never guessed. */
export interface ContractView {
  brand: (ContractParty & { signatory: string | null }) | null;
  creator: (ContractParty & { handles: string[] }) | null;
  deliverables: ContractDeliverable[];
  responseHours: number | null;
  deliveryHours: number | null;
  deliveryStarts: string | null;
  total: Money | null;
  commissionBps: number | null;
  killFeeBps: number | null;
  freeCancelHours: number | null;
  shipping: string | null;
  terms: ContractTerm[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;
const count = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const record = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {};

/** `{ar, en}` in the asked language, falling back to the governing Arabic. */
const bilingual = (value: unknown, lang: ContractLang): string | null =>
  isRecord(value) ? text(value[lang]) ?? text(value.ar) : text(value);

/** A malformed amount is dropped, never shown wrong. */
const usd = (value: unknown): Money | null => {
  const raw = text(value);
  if (raw === null) return null;
  try {
    return parseUsdOrNull(raw);
  } catch {
    return null;
  }
};

const partyOf = (value: unknown): ContractParty | null => {
  if (!isRecord(value)) return null;
  return {
    legalName: text(value.legal_name),
    verified: record(value.kyc).verified === true,
  };
};

export const parseContractDocument = (
  document: Record<string, unknown>,
  lang: ContractLang,
): ContractView => {
  const parties = record(document.parties);
  const brand = partyOf(parties.brand);
  const creator = partyOf(parties.influencer);
  const schedule = record(document.schedule);
  const payment = record(document.payment);

  return {
    brand: brand
      ? { ...brand, signatory: text(record(parties.brand).signatory) }
      : null,
    creator: creator
      ? {
          ...creator,
          handles: list(record(parties.influencer).handles)
            .map(handle => text(record(handle).username))
            .filter((handle): handle is string => handle !== null)
            .map(handle => `@${handle.replace(/^@/, '')}`),
        }
      : null,
    deliverables: list(document.deliverables).flatMap((entry, index) => {
      const item = record(entry);
      const title = bilingual(item.title, lang);
      if (title === null) return [];
      const days = count(item.delivery_days);
      return [
        {
          id: text(item.item_id) ?? String(index),
          title,
          total: usd(item.total_usd),
          revisions: count(item.revisions),
          retention: bilingual(record(item.retention).title, lang),
          deliveryHours:
            count(item.delivery_hours) ?? (days !== null ? days * 24 : null),
        },
      ];
    }),
    responseHours: count(schedule.response_hours),
    deliveryHours: count(schedule.delivery_hours),
    deliveryStarts: bilingual(schedule.delivery_starts, lang),
    total: usd(payment.total_usd),
    commissionBps: count(payment.commission_bps),
    killFeeBps: count(payment.kill_fee_bps),
    freeCancelHours: count(payment.free_cancel_grace_hours),
    shipping: bilingual(record(document.shipping).title, lang),
    terms: list(record(document.terms).items).flatMap(entry => {
      const term = record(entry);
      const body = bilingual(term.text, lang);
      return body === null ? [] : [{ key: text(term.key) ?? body, text: body }];
    }),
  };
};

/** An addendum's clause (`text: {ar, en}`) in the asked language. */
export const addendumClause = (
  document: Record<string, unknown>,
  lang: ContractLang,
): string | null => bilingual(document.text, lang);

/** Basis points as a percentage share (1500 → 0.15) for `formatNumber(…, { style: 'percent' })`. */
export const bpsShare = (bps: number): number => bps / 10_000;
