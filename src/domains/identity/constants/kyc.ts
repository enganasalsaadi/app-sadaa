import type { ParseKeys } from 'i18next';
import type { KycDocumentGroupParam } from '@/core/navigation';

/** Brand document types accepted by `POST /user/kyc` (contract §7.4 + company verification route 1). */
export const BRAND_KYC_DOCUMENT_TYPES = [
  'commercial_register',
  'industrial_register',
  'trade_license',
  'owner_national_id',
  'owner_passport',
] as const;
export type BrandKycDocumentType = (typeof BRAND_KYC_DOCUMENT_TYPES)[number];

/** The two document picks of the verification picker: company paperwork vs the owner's identity. */
export const BRAND_KYC_DOCUMENT_GROUPS = {
  company: ['commercial_register', 'industrial_register', 'trade_license'],
  owner: ['owner_national_id', 'owner_passport'],
} as const satisfies Record<KycDocumentGroupParam, readonly BrandKycDocumentType[]>;
export type BrandKycDocumentGroup = KycDocumentGroupParam;

/** Group of a submitted `document_type`; an unknown or missing one reads as company paperwork. */
export const toBrandKycDocumentGroup = (documentType: string | null): BrandKycDocumentGroup =>
  (BRAND_KYC_DOCUMENT_GROUPS.owner as readonly string[]).includes(documentType ?? '')
    ? 'owner'
    : 'company';

export const BRAND_KYC_DOCUMENT_LABEL = {
  commercial_register: 'account.kyc.documentTypes.commercialRegister',
  industrial_register: 'account.kyc.documentTypes.industrialRegister',
  trade_license: 'account.kyc.documentTypes.tradeLicense',
  owner_national_id: 'account.kyc.documentTypes.ownerNationalId',
  owner_passport: 'account.kyc.documentTypes.ownerPassport',
} as const satisfies Record<BrandKycDocumentType, ParseKeys>;

/** Multipart field per upload slot; 422 errors come back under these keys. */
export const KYC_FILE_FIELDS = {
  idFront: 'id_front',
  idBack: 'id_back',
  document: 'kyc_document',
} as const;
export type KycSlot = keyof typeof KYC_FILE_FIELDS;

/** Files each brand document type needs: an owner national ID sends both faces, like a creator. */
export const BRAND_KYC_DOCUMENT_SLOTS = {
  commercial_register: ['document'],
  industrial_register: ['document'],
  trade_license: ['document'],
  owner_national_id: ['idFront', 'idBack'],
  owner_passport: ['document'],
} as const satisfies Record<BrandKycDocumentType, readonly KycSlot[]>;
