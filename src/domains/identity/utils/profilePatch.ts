import { toSocialLinksForm, toSocialLinksPayload } from '@/domains/auth';
import type {
  UpdateBrandProfileRequest,
  UpdateInfluencerProfileRequest,
} from '../api/accountApi';
import type { CompanyInfoFormValues } from '../schemas/companyInfoSchema';
import type { PersonalInfoFormValues } from '../schemas/personalInfoSchema';
import type { UserProfileDetails } from '../types/profile';

/** Empty optional text → `null`, the contract's "remove it". */
const orNull = (value: string): string | null => value.trim() || null;

export const toPersonalInfoForm = (details: UserProfileDetails): PersonalInfoFormValues => ({
  fullName: details.profile.full_name ?? '',
  email: details.email ?? '',
  governorate: details.profile.governorate ?? '',
  area: details.profile.area ?? '',
});

export const toCompanyInfoForm = (details: UserProfileDetails): CompanyInfoFormValues => ({
  companyName: details.profile.company_name ?? '',
  email: details.email ?? '',
  governorate: details.profile.governorate ?? '',
  businessType: details.profile.business_type ?? '',
  socialLinks: toSocialLinksForm(details.profile.social_links),
});

/** §8.1 is partial: only the fields that differ from the saved profile. */
export const toPersonalInfoPatch = (
  values: PersonalInfoFormValues,
  saved: PersonalInfoFormValues,
): UpdateInfluencerProfileRequest => {
  const patch: UpdateInfluencerProfileRequest = {};
  const fullName = values.fullName.trim();
  if (fullName !== saved.fullName.trim()) patch.full_name = fullName;
  if (orNull(values.email) !== orNull(saved.email)) patch.email = orNull(values.email);
  if (values.governorate !== saved.governorate) patch.governorate = values.governorate;
  if (orNull(values.area) !== orNull(saved.area)) patch.area = orNull(values.area);
  return patch;
};

/** Changed fields only; `social_links` is a full replace, so it goes whole when any link changed. */
export const toCompanyInfoPatch = (
  values: CompanyInfoFormValues,
  saved: CompanyInfoFormValues,
): UpdateBrandProfileRequest => {
  const patch: UpdateBrandProfileRequest = {};
  const companyName = values.companyName.trim();
  if (companyName !== saved.companyName.trim()) patch.company_name = companyName;
  if (orNull(values.email) !== orNull(saved.email)) patch.email = orNull(values.email);
  if (values.governorate !== saved.governorate) patch.governorate = values.governorate;
  if (values.businessType !== saved.businessType) patch.business_type = values.businessType;
  const links = toSocialLinksPayload(values.socialLinks);
  if (JSON.stringify(links) !== JSON.stringify(toSocialLinksPayload(saved.socialLinks))) {
    patch.social_links = links;
  }
  return patch;
};
