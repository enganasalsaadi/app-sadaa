export {env, isDev, isStaging, isProd, apiUrl} from './env';
export type {AppEnv} from './env';
export {openAppStore} from './openAppStore';
export {
  DEFAULT_LANGUAGE,
  DEFAULT_CURRENCY,
  SUPPORTED_LANGUAGES,
  MAX_SEARCH_HISTORY_ITEMS,
  APP_NAME,
  SUPPORT_WHATSAPP_NUMBER,
  DEFAULT_PHONE_COUNTRY,
  HAPTIC_TAP_MS,
} from './app';
export type {SupportedLanguage} from './app';
export {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  BREAKPOINTS,
  COMPACT_HERO_MAX_HEIGHT,
  MAX_FONT_SIZE_MULTIPLIER,
  FONT_SCALE_FACTOR,
  FONT_MAX_SCALE_RATIO,
} from './layout';
export {
  FOLLOWER_TIERS,
  FOLLOWER_TIER_LEVELS,
  FOLLOWER_TIER_STYLE,
} from './followerTiers';
export type { FollowerTierId } from './followerTiers';
export {
  CREATOR_SLUG_MIN_LENGTH,
  CREATOR_SLUG_MAX_LENGTH,
  isCreatorSlugLength,
  isCreatorSlugFormat,
} from './creatorSlug';
