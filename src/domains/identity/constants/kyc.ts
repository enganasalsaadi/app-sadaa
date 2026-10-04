import type { ParseKeys } from 'i18next';

/** Brand document types accepted by `POST /user/kyc` (contract §7.4). */
export const BRAND_KYC_DOCUMENT_TYPES = [
  'commercial_register',
  'industrial_register',
  'trade_license',
] as const;
export type BrandKycDocumentType = (typeof BRAND_KYC_DOCUMENT_TYPES)[number];

export const BRAND_KYC_DOCUMENT_LABEL = {
  commercial_register: 'account.kyc.documentTypes.commercialRegister',
  industrial_register: 'account.kyc.documentTypes.industrialRegister',
  trade_license: 'account.kyc.documentTypes.tradeLicense',
} as const satisfies Record<BrandKycDocumentType, ParseKeys>;

/** Multipart field per upload slot; 422 errors come back under these keys. */
export const KYC_FILE_FIELDS = {
  idFront: 'id_front',
  idBack: 'id_back',
  document: 'kyc_document',
} as const;
export type KycSlot = keyof typeof KYC_FILE_FIELDS;
