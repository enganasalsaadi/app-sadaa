import type { BrandSocialLink, PlatformResource, User } from '@/domains/auth';

/** `GET /user/profile` influencer `profile` (contract §3.2). */
export interface InfluencerProfileDetails {
  full_name: string;
  governorate: string | null;
  governorate_label: string | null;
  area: string | null;
  niches: string[];
  primary_platform_id: string | null;
  primary_platform_locked: boolean;
  platforms: PlatformResource[];
}

/** `GET /user/profile` brand `profile` (contract §3.2). */
export interface BrandProfileDetails {
  company_name: string;
  governorate: string | null;
  governorate_label: string | null;
  business_type: string | null;
  business_type_label: string | null;
  social_links: BrandSocialLink[];
}

export interface UserProfileDetails {
  id: string;
  user_type: NonNullable<User['user_type']>;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  profile: Partial<InfluencerProfileDetails> & Partial<BrandProfileDetails>;
}

/** `POST /user/avatar` / `DELETE /user/avatar` (contract §9). */
export interface AvatarResponse {
  avatar_url: string | null;
}
