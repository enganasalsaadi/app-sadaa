import { ValidationError } from 'yup';
import type { FieldErrorsImpl, Resolver, ResolverResult } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { CampaignShippingDraft, CampaignShippingFormValues } from '../utils/campaignShipping';
import { createDealShipSchema } from './dealShippingSchema';

/**
 * The batch manifest's validation: only ticked parcels are checked, each with the single-deal
 * waybill rules (courier, number, optional https link). The form holds every listed row, so a
 * resolver over the whole `rows` map replaces one schema per row.
 */
export const createCampaignShippingResolver = (t: TFunction): Resolver<CampaignShippingFormValues> => {
  const waybill = createDealShipSchema(t);
  return async (values): Promise<ResolverResult<CampaignShippingFormValues>> => {
    const rows: Record<string, FieldErrorsImpl<CampaignShippingDraft>> = {};
    for (const [dealId, draft] of Object.entries(values.rows)) {
      if (!draft.selected) continue;
      try {
        waybill.validateSync(draft, { abortEarly: false });
      } catch (err) {
        if (!(err instanceof ValidationError)) throw err;
        const fields: FieldErrorsImpl<CampaignShippingDraft> = {};
        for (const issue of err.inner) {
          const field = issue.path as keyof CampaignShippingDraft | undefined;
          if (field && !fields[field]) fields[field] = { type: issue.type ?? 'validation', message: issue.message };
        }
        rows[dealId] = fields;
      }
    }
    return Object.keys(rows).length === 0 ? { values, errors: {} } : { values: {}, errors: { rows } };
  };
};
