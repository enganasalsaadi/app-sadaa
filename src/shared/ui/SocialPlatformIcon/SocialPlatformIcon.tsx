import React, { memo } from 'react';
import { Globe } from 'lucide-react-native';
import type { SocialPlatform } from '@/shared/utils';
import InstagramIcon from '@/assets/icons/social/instagram.svg';
import FacebookIcon from '@/assets/icons/social/facebook.svg';
import TiktokIcon from '@/assets/icons/social/tiktok.svg';
import YoutubeIcon from '@/assets/icons/social/youtube.svg';
import TelegramIcon from '@/assets/icons/social/telegram.svg';

export interface SocialPlatformIconProps {
  platform: SocialPlatform;
  size: number;
  color: string;
}

// Monochrome (currentColor) marks from simple-icons (CC0) so they take theme
// colors like every other icon; the generic website mark is lucide.
const BRAND_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  telegram: TelegramIcon,
} as const;

const SocialPlatformIconComponent: React.FC<SocialPlatformIconProps> = ({
  platform,
  size,
  color,
}) => {
  if (platform === 'website') {
    return <Globe size={size} color={color} />;
  }
  const Icon = BRAND_ICONS[platform];
  return <Icon width={size} height={size} color={color} />;
};

export const SocialPlatformIcon = memo(SocialPlatformIconComponent);
