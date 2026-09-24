import type { TFunction } from 'i18next';
import type { CountryCode } from 'libphonenumber-js';

export interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
}

const FLAG_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);

export const getFlagEmoji = (code: string): string =>
  String.fromCodePoint(
    ...[...code.toUpperCase()].map(c => FLAG_OFFSET + c.charCodeAt(0)),
  );

// GCC + Arab-world countries shown first in the picker
export const PRIORITY_COUNTRY_CODES: CountryCode[] = [
  'AE',
  'SA',
  'KW',
  'QA',
  'BH',
  'OM',
  'JO',
  'EG',
  'LB',
  'IQ',
  'SY',
  'YE',
  'LY',
  'TN',
  'DZ',
  'MA',
  'SD',
  'SO',
  'PS',
];

const ALL_COUNTRIES: Country[] = [
  // ── GCC ──────────────────────────────────────────
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '971',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '966',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'KW', name: 'Kuwait', dialCode: '965', minLength: 8, maxLength: 8 },
  { code: 'QA', name: 'Qatar', dialCode: '974', minLength: 8, maxLength: 8 },
  { code: 'BH', name: 'Bahrain', dialCode: '973', minLength: 8, maxLength: 8 },
  { code: 'OM', name: 'Oman', dialCode: '968', minLength: 8, maxLength: 8 },

  // ── Arab world ───────────────────────────────────
  { code: 'JO', name: 'Jordan', dialCode: '962', minLength: 8, maxLength: 9 },
  { code: 'EG', name: 'Egypt', dialCode: '20', minLength: 10, maxLength: 10 },
  { code: 'LB', name: 'Lebanon', dialCode: '961', minLength: 7, maxLength: 8 },
  { code: 'IQ', name: 'Iraq', dialCode: '964', minLength: 10, maxLength: 10 },
  { code: 'SY', name: 'Syria', dialCode: '963', minLength: 8, maxLength: 9 },
  { code: 'YE', name: 'Yemen', dialCode: '967', minLength: 9, maxLength: 9 },
  { code: 'LY', name: 'Libya', dialCode: '218', minLength: 9, maxLength: 10 },
  { code: 'TN', name: 'Tunisia', dialCode: '216', minLength: 8, maxLength: 8 },
  { code: 'DZ', name: 'Algeria', dialCode: '213', minLength: 9, maxLength: 9 },
  { code: 'MA', name: 'Morocco', dialCode: '212', minLength: 9, maxLength: 9 },
  { code: 'SD', name: 'Sudan', dialCode: '249', minLength: 9, maxLength: 9 },
  { code: 'SO', name: 'Somalia', dialCode: '252', minLength: 7, maxLength: 8 },
  {
    code: 'PS',
    name: 'Palestine',
    dialCode: '970',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'MR',
    name: 'Mauritania',
    dialCode: '222',
    minLength: 8,
    maxLength: 8,
  },
  { code: 'DJ', name: 'Djibouti', dialCode: '253', minLength: 8, maxLength: 8 },
  { code: 'KM', name: 'Comoros', dialCode: '269', minLength: 7, maxLength: 7 },

  // ── أوروبا ────────────────────────────────────────
  { code: 'DE', name: 'Germany', dialCode: '49', minLength: 10, maxLength: 11 },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '44',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'FR', name: 'France', dialCode: '33', minLength: 9, maxLength: 9 },
  { code: 'IT', name: 'Italy', dialCode: '39', minLength: 10, maxLength: 10 },
  { code: 'ES', name: 'Spain', dialCode: '34', minLength: 9, maxLength: 9 },
  { code: 'RU', name: 'Russia', dialCode: '7', minLength: 10, maxLength: 10 },
  { code: 'PL', name: 'Poland', dialCode: '48', minLength: 9, maxLength: 9 },
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '31',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'BE', name: 'Belgium', dialCode: '32', minLength: 9, maxLength: 9 },
  {
    code: 'CH',
    name: 'Switzerland',
    dialCode: '41',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'AT', name: 'Austria', dialCode: '43', minLength: 10, maxLength: 10 },
  { code: 'SE', name: 'Sweden', dialCode: '46', minLength: 9, maxLength: 9 },
  { code: 'NO', name: 'Norway', dialCode: '47', minLength: 8, maxLength: 8 },
  { code: 'DK', name: 'Denmark', dialCode: '45', minLength: 8, maxLength: 8 },
  { code: 'FI', name: 'Finland', dialCode: '358', minLength: 9, maxLength: 10 },
  { code: 'IE', name: 'Ireland', dialCode: '353', minLength: 9, maxLength: 9 },
  { code: 'PT', name: 'Portugal', dialCode: '351', minLength: 9, maxLength: 9 },
  { code: 'GR', name: 'Greece', dialCode: '30', minLength: 10, maxLength: 10 },
  { code: 'HU', name: 'Hungary', dialCode: '36', minLength: 9, maxLength: 9 },
  {
    code: 'CZ',
    name: 'Czech Republic',
    dialCode: '420',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'SK', name: 'Slovakia', dialCode: '421', minLength: 9, maxLength: 9 },
  { code: 'SI', name: 'Slovenia', dialCode: '386', minLength: 8, maxLength: 8 },
  { code: 'HR', name: 'Croatia', dialCode: '385', minLength: 9, maxLength: 9 },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    dialCode: '387',
    minLength: 8,
    maxLength: 8,
  },
  { code: 'RS', name: 'Serbia', dialCode: '381', minLength: 8, maxLength: 9 },
  { code: 'BG', name: 'Bulgaria', dialCode: '359', minLength: 9, maxLength: 9 },
  { code: 'RO', name: 'Romania', dialCode: '40', minLength: 9, maxLength: 9 },
  {
    code: 'LT',
    name: 'Lithuania',
    dialCode: '370',
    minLength: 8,
    maxLength: 8,
  },
  { code: 'LV', name: 'Latvia', dialCode: '371', minLength: 8, maxLength: 8 },
  { code: 'EE', name: 'Estonia', dialCode: '372', minLength: 8, maxLength: 8 },
  {
    code: 'LU',
    name: 'Luxembourg',
    dialCode: '352',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'MT', name: 'Malta', dialCode: '356', minLength: 8, maxLength: 8 },
  { code: 'CY', name: 'Cyprus', dialCode: '357', minLength: 8, maxLength: 8 },
  { code: 'IS', name: 'Iceland', dialCode: '354', minLength: 7, maxLength: 9 },
  { code: 'AL', name: 'Albania', dialCode: '355', minLength: 9, maxLength: 9 },
  { code: 'AM', name: 'Armenia', dialCode: '374', minLength: 8, maxLength: 8 },
  {
    code: 'AZ',
    name: 'Azerbaijan',
    dialCode: '994',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'GE', name: 'Georgia', dialCode: '995', minLength: 9, maxLength: 9 },
  { code: 'MD', name: 'Moldova', dialCode: '373', minLength: 8, maxLength: 8 },
  {
    code: 'MK',
    name: 'North Macedonia',
    dialCode: '389',
    minLength: 8,
    maxLength: 8,
  },
  { code: 'UA', name: 'Ukraine', dialCode: '380', minLength: 9, maxLength: 9 },
  { code: 'BY', name: 'Belarus', dialCode: '375', minLength: 9, maxLength: 9 },
  {
    code: 'KZ',
    name: 'Kazakhstan',
    dialCode: '7',
    minLength: 10,
    maxLength: 10,
  },

  // ── آسيا ──────────────────────────────────────────
  { code: 'IN', name: 'India', dialCode: '91', minLength: 10, maxLength: 10 },
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '92',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '880',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'LK', name: 'Sri Lanka', dialCode: '94', minLength: 9, maxLength: 9 },
  { code: 'CN', name: 'China', dialCode: '86', minLength: 11, maxLength: 11 },
  { code: 'JP', name: 'Japan', dialCode: '81', minLength: 10, maxLength: 10 },
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '82',
    minLength: 10,
    maxLength: 11,
  },
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '62',
    minLength: 9,
    maxLength: 12,
  },
  { code: 'MY', name: 'Malaysia', dialCode: '60', minLength: 9, maxLength: 10 },
  {
    code: 'PH',
    name: 'Philippines',
    dialCode: '63',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'VN', name: 'Vietnam', dialCode: '84', minLength: 9, maxLength: 10 },
  { code: 'TH', name: 'Thailand', dialCode: '66', minLength: 9, maxLength: 9 },
  { code: 'MM', name: 'Myanmar', dialCode: '95', minLength: 9, maxLength: 10 },
  { code: 'KH', name: 'Cambodia', dialCode: '855', minLength: 9, maxLength: 9 },
  { code: 'LA', name: 'Laos', dialCode: '856', minLength: 9, maxLength: 10 },
  { code: 'SG', name: 'Singapore', dialCode: '65', minLength: 8, maxLength: 8 },
  { code: 'BN', name: 'Brunei', dialCode: '673', minLength: 7, maxLength: 7 },

  // ── أمريكا الشمالية ──────────────────────────────
  {
    code: 'US',
    name: 'United States',
    dialCode: '1',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'CA', name: 'Canada', dialCode: '1', minLength: 10, maxLength: 10 },
  { code: 'MX', name: 'Mexico', dialCode: '52', minLength: 10, maxLength: 10 },

  // ── أمريكا الجنوبية ──────────────────────────────
  { code: 'BR', name: 'Brazil', dialCode: '55', minLength: 10, maxLength: 11 },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '54',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'CO',
    name: 'Colombia',
    dialCode: '57',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'CL', name: 'Chile', dialCode: '56', minLength: 9, maxLength: 9 },
  { code: 'PE', name: 'Peru', dialCode: '51', minLength: 9, maxLength: 9 },
  {
    code: 'VE',
    name: 'Venezuela',
    dialCode: '58',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'EC', name: 'Ecuador', dialCode: '593', minLength: 9, maxLength: 9 },
  { code: 'BO', name: 'Bolivia', dialCode: '591', minLength: 8, maxLength: 8 },
  { code: 'PY', name: 'Paraguay', dialCode: '595', minLength: 9, maxLength: 9 },
  { code: 'UY', name: 'Uruguay', dialCode: '598', minLength: 8, maxLength: 8 },
  { code: 'GY', name: 'Guyana', dialCode: '592', minLength: 7, maxLength: 7 },
  { code: 'SR', name: 'Suriname', dialCode: '597', minLength: 7, maxLength: 7 },

  // ── أفريقيا ───────────────────────────────────────
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '27',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '234',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'GH', name: 'Ghana', dialCode: '233', minLength: 9, maxLength: 9 },
  { code: 'KE', name: 'Kenya', dialCode: '254', minLength: 9, maxLength: 9 },
  { code: 'UG', name: 'Uganda', dialCode: '256', minLength: 9, maxLength: 9 },
  { code: 'TZ', name: 'Tanzania', dialCode: '255', minLength: 9, maxLength: 9 },
  { code: 'RW', name: 'Rwanda', dialCode: '250', minLength: 9, maxLength: 9 },
  { code: 'ZM', name: 'Zambia', dialCode: '260', minLength: 9, maxLength: 9 },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    dialCode: '263',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    dialCode: '258',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'AO', name: 'Angola', dialCode: '244', minLength: 9, maxLength: 9 },
  { code: 'ET', name: 'Ethiopia', dialCode: '251', minLength: 9, maxLength: 9 },
  { code: 'SN', name: 'Senegal', dialCode: '221', minLength: 9, maxLength: 9 },
  {
    code: 'CI',
    name: 'Ivory Coast',
    dialCode: '225',
    minLength: 8,
    maxLength: 8,
  },
  { code: 'CM', name: 'Cameroon', dialCode: '237', minLength: 9, maxLength: 9 },

  // ── أوقيانوسيا ────────────────────────────────────
  { code: 'AU', name: 'Australia', dialCode: '61', minLength: 9, maxLength: 9 },
  {
    code: 'NZ',
    name: 'New Zealand',
    dialCode: '64',
    minLength: 9,
    maxLength: 10,
  },
];

const prioritySet = new Set<string>(PRIORITY_COUNTRY_CODES);

export const PRIORITY_COUNTRIES: Country[] = ALL_COUNTRIES.filter(c =>
  prioritySet.has(c.code),
);

export const OTHER_COUNTRIES: Country[] = ALL_COUNTRIES.filter(
  c => !prioritySet.has(c.code),
);

export const COUNTRIES: Country[] = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

export const findCountry = (code: string): Country | undefined =>
  COUNTRIES.find(c => c.code === code);

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * التحقق من صحة رقم الهاتف بناءً على قواعد البلد
 */
export const isValidPhoneByRules = (
  phoneNumber: string,
  countryCode: string,
): boolean => {
  const country = findCountry(countryCode);
  if (!country) return false;

  const digits = phoneNumber.replace(/\D/g, '');
  return (
    digits.length >= country.minLength && digits.length <= country.maxLength
  );
};

/**
 * الحصول على قواعد البلد
 */
export const getPhoneRulesByCode = (
  countryCode: string,
): { min: number; max: number } | null => {
  const country = findCountry(countryCode);
  if (!country) return null;
  return { min: country.minLength, max: country.maxLength };
};

/**
 * الحصول على رسالة خطأ مخصصة لطول الرقم
 */
export const getPhoneValidationMessage = (
  countryCode: string,
  t: TFunction,
): string => {
  const rules = getPhoneRulesByCode(countryCode);

  if (!rules) {
    return t('validation.invalidPhone');
  }

  if (rules.min === rules.max) {
    return t('validation.phoneLengthExactly', { count: rules.min });
  }

  return t('validation.phoneLengthBetween', { min: rules.min, max: rules.max });
};

/**
 * الحصول على رسالة خطأ مع اسم البلد
 */
export const getPhoneValidationMessageWithCountry = (
  countryCode: string,
  t: TFunction,
): string => {
  const rules = getPhoneRulesByCode(countryCode);
  const country = findCountry(countryCode);

  if (!rules || !country) {
    return t('validation.invalidPhone');
  }

  if (rules.min === rules.max) {
    return t('validation.phoneLengthExactly', { count: rules.min });
  }

  // رسالة مع اسم البلد
  return t('validation.phoneInvalidForCountry', { country: country.name });
};
