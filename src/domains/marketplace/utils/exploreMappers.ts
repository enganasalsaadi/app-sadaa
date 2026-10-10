import { FOLLOWER_TIERS, type FollowerTierId } from '@/core/config';
import type { Money } from '@/core/money';
import { toPriceLockReason } from '@/domains/identity';
import { parseExploreParams } from './exploreQuery';
import {
  BRAND_HOME_ISLAND_TYPES,
  BRAND_HOME_RAIL_KEYS,
  EXPLORE_SORTS,
  type BrandHome,
  type BrandHomeDto,
  type BrandHomeIsland,
  type BrandHomeIslandType,
  type BrandHomeRail,
  type BrandHomeRailKey,
  type ExploreCreator,
  type ExploreCreatorDto,
  type ExploreCreatorsPage,
  type ExploreCreatorsPageDto,
  type CreatorPrice,
  type ExploreCategory,
  type ExploreCategoryDto,
  type ExploreFilterOptions,
  type ExploreFiltersDto,
  type ExploreOption,
  type ExploreOptionDto,
  type ExplorePage,
  type ExploreSort,
  type ExploreSortOption,
} from '../types/explore';

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

/** The server sends major units (`40.5` dollars, `600000` pounds); money is minor units (rule 06). */
const usdToMoney = (usd: number): Money => ({ amount: Math.round(usd * 100), currency: 'USD' });
const sypToMoney = (syp: number): Money => ({ amount: Math.round(syp), currency: 'SYP' });

const toSypApprox = (syp: number | null, stale: boolean): Money | null =>
  syp === null || stale ? null : sypToMoney(syp);

const toTierId = (tier: string | null): FollowerTierId | null =>
  FOLLOWER_TIERS.find(id => id === tier?.toUpperCase()) ?? null;

const mapPrice = (dto: ExploreCreatorDto['price']): CreatorPrice =>
  dto.locked
    ? { locked: true, lockReason: toPriceLockReason(dto.lock_reason) }
    : {
        locked: false,
        from: dto.from_usd === null ? null : usdToMoney(dto.from_usd),
        fromSypApprox: toSypApprox(dto.from_syp_approx, dto.syp_rate_stale),
      };

export const mapExploreCreator = (dto: ExploreCreatorDto): ExploreCreator => ({
  slug: dto.slug,
  displayName: dto.display_name,
  avatarUrl: dto.avatar_url,
  governorate: dto.governorate,
  niches: dto.niches,
  tier: toTierId(dto.tier),
  primaryPlatform: dto.primary_platform && {
    platform: dto.primary_platform.platform,
    platformLabel: dto.primary_platform.platform_label,
    followerCount: dto.primary_platform.follower_count,
    followerCountVerified: dto.primary_platform.follower_count_verified,
  },
  platforms: dto.platforms,
  badges: {
    kycVerified: dto.badges.kyc_verified,
    followersVerified: dto.badges.followers_verified,
    rush: dto.badges.rush,
    onSite: dto.badges.on_site,
    isNew: dto.badges.new,
  },
  fastestDeliveryDays: dto.fastest_delivery_days,
  price: mapPrice(dto.price),
  isShortlisted: dto.is_shortlisted,
});

export const mapExploreCreatorsPage = (dto: ExploreCreatorsPageDto): ExploreCreatorsPage => ({
  items: dto.data.map(mapExploreCreator),
  nextCursor: dto.meta.next_cursor || null,
});

export const mapExplorePage = (dto: ExploreCreatorsPageDto): ExplorePage => ({
  ...mapExploreCreatorsPage(dto),
  priceLocked: dto.meta.price_locked ?? false,
  priceLockReason: toPriceLockReason(dto.meta.price_lock_reason),
});

const mapOption = (dto: ExploreOptionDto): ExploreOption => ({
  value: String(dto.value),
  label: dto.label,
  requiresVerification: dto.requires_verification ?? false,
});

const mapCategory = (dto: ExploreCategoryDto): ExploreCategory => ({
  ...mapOption(dto),
  niches: (dto.niches ?? []).map(niche =>
    typeof niche === 'string' ? niche : String(niche.value),
  ),
});

const mapSortOptions = (dtos: ExploreOptionDto[]): ExploreSortOption[] =>
  dtos.flatMap(dto => {
    const option = mapOption(dto);
    return includes<ExploreSort>(EXPLORE_SORTS, option.value)
      ? [{ ...option, value: option.value }]
      : [];
  });

export const mapExploreFilters = (dto: ExploreFiltersDto): ExploreFilterOptions => ({
  governorates: dto.governorates.map(mapOption),
  platforms: dto.platforms.map(mapOption),
  niches: dto.niches.map(mapOption),
  tiers: dto.tiers.map(mapOption),
  categories: dto.categories.map(mapCategory),
  sorts: mapSortOptions(dto.sort),
  deliveryBuckets: dto.delivery_buckets.map(mapOption),
});

const WHATSAPP_HOSTS = ['wa.me', 'api.whatsapp.com'];

/** Rule 07: only an https WhatsApp link may reach `Linking`. */
export const toSupportWhatsappUrl = (value: string | null): string | null => {
  const match = value ? /^https:\/\/([^/?#:]+)(?:[/?#]|$)/i.exec(value) : null;
  return match?.[1] && WHATSAPP_HOSTS.includes(match[1].toLowerCase()) ? value : null;
};

const mapIsland = (dto: BrandHomeDto['island']): BrandHomeIsland | null => {
  if (!dto) {
    return null;
  }
  if (!includes<BrandHomeIslandType>(BRAND_HOME_ISLAND_TYPES, dto.type)) {
    return null;
  }
  return { type: dto.type, title: dto.title, body: dto.body, ctaLabel: dto.cta.label };
};

const mapRails = (dtos: BrandHomeDto['rails']): BrandHomeRail[] =>
  dtos.flatMap(dto => {
    // Unknown keys (newer server) and empty rails are dropped.
    if (!includes<BrandHomeRailKey>(BRAND_HOME_RAIL_KEYS, dto.key) || dto.items.length === 0) {
      return [];
    }
    return [
      {
        key: dto.key,
        title: dto.title,
        items: dto.items.map(mapExploreCreator),
        seeAll: dto.see_all ? parseExploreParams(dto.see_all) : null,
      },
    ];
  });

export const mapBrandHome = (dto: BrandHomeDto): BrandHome => ({
  companyName: dto.header.company_name,
  governorate: dto.header.governorate,
  wallet: {
    available: usdToMoney(dto.header.wallet.available_usd),
    availableSypApprox: toSypApprox(
      dto.header.wallet.available_syp_approx,
      dto.header.wallet.syp_rate_stale,
    ),
  },
  island: mapIsland(dto.island),
  rails: mapRails(dto.rails),
  supportWhatsappUrl: toSupportWhatsappUrl(dto.support.whatsapp_url),
  viewPrices: {
    allowed: dto.capabilities.view_prices.allowed,
    reason: toPriceLockReason(dto.capabilities.view_prices.reason),
  },
});
