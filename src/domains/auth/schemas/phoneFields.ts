import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export interface PhoneFormValues {
  /** National number as typed; E.164 is built with `countryCode` on submit. */
  phone: string;
  countryCode: CountryCode;
}

/** `phone` + `countryCode` pair, validated against the selected country. */
export const createPhoneFields = (t: TFunction) => ({
  countryCode: yup.mixed<CountryCode>().required(),
  phone: yup
    .string()
    .required(t('validation.required'))
    .test('phone', t('validation.invalidPhone'), function (value) {
      const { countryCode } = this.parent as { countryCode: CountryCode };
      return !!value && isValidPhoneNumber(value, countryCode);
    }),
});
