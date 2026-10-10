import type { ParseKeys } from 'i18next';
import { FileText, IdCard, Mail, MessageCircle, Upload, UserCheck, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { HueTone } from '@/core/theme';

/** The four picker options (three workflows: the two document options share `POST /user/kyc`). */
export const VERIFICATION_METHODS = ['registry', 'ownerId', 'social', 'domain'] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export type VerificationMethodSection = 'documents' | 'noDocuments';

export interface VerificationMethodDef {
  section: VerificationMethodSection;
  icon: LucideIcon;
  tone: HueTone;
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
  /** One-line version for the compact list (onboarding, picker with an active attempt). */
  shortKey: ParseKeys;
  /** How the method is checked: shown as a pill in the full list. */
  meta: { labelKey: ParseKeys; icon: LucideIcon; tone: HueTone };
}

const UPLOAD_META = {
  labelKey: 'account.verification.picker.meta.upload',
  icon: Upload,
  tone: 'neutral',
} as const satisfies VerificationMethodDef['meta'];

export const VERIFICATION_METHOD_DEF = {
  registry: {
    section: 'documents',
    icon: FileText,
    tone: 'brand',
    titleKey: 'account.verification.picker.methods.registry.title',
    descriptionKey: 'account.verification.picker.methods.registry.description',
    shortKey: 'account.verification.picker.methods.registry.short',
    meta: UPLOAD_META,
  },
  ownerId: {
    section: 'documents',
    icon: IdCard,
    tone: 'brand',
    titleKey: 'account.verification.picker.methods.ownerId.title',
    descriptionKey: 'account.verification.picker.methods.ownerId.description',
    shortKey: 'account.verification.picker.methods.ownerId.short',
    meta: UPLOAD_META,
  },
  social: {
    section: 'noDocuments',
    icon: MessageCircle,
    tone: 'interactive',
    titleKey: 'account.verification.picker.methods.social.title',
    descriptionKey: 'account.verification.picker.methods.social.description',
    shortKey: 'account.verification.picker.methods.social.short',
    meta: { labelKey: 'account.verification.picker.meta.manual', icon: UserCheck, tone: 'neutral' },
  },
  domain: {
    section: 'noDocuments',
    icon: Mail,
    tone: 'interactive',
    titleKey: 'account.verification.picker.methods.domain.title',
    descriptionKey: 'account.verification.picker.methods.domain.description',
    shortKey: 'account.verification.picker.methods.domain.short',
    meta: { labelKey: 'account.verification.picker.meta.automatic', icon: Zap, tone: 'interactive' },
  },
} as const satisfies Record<VerificationMethod, VerificationMethodDef>;

export const VERIFICATION_SECTION_TITLE = {
  documents: 'account.verification.picker.groupDocuments',
  noDocuments: 'account.verification.picker.groupNoDocuments',
} as const satisfies Record<VerificationMethodSection, ParseKeys>;
