import * as yup from 'yup';
import type { TFunction } from 'i18next';
import {
  DEAL_RETURN_EARLIER_DAYS,
  DEAL_RETURN_HANDED,
  type DealReturnHanded,
} from '../constants/dealReturn';
import { createDealShipSchema, type DealShipFormValues } from './dealShippingSchema';

/** The creator's return waybill: the brand's waybill fields plus when the parcel was handed over. */
export interface DealReturnFormValues extends DealShipFormValues {
  handed: DealReturnHanded;
  /** Only read when `handed` is `earlier`. */
  handedDays: number;
}

export const createDealReturnSchema = (t: TFunction): yup.ObjectSchema<DealReturnFormValues> =>
  createDealShipSchema(t).shape({
    handed: yup.mixed<DealReturnHanded>().oneOf([...DEAL_RETURN_HANDED]).required(),
    handedDays: yup
      .number()
      .defined()
      .integer()
      .min(DEAL_RETURN_EARLIER_DAYS.min)
      .max(DEAL_RETURN_EARLIER_DAYS.max),
  });
