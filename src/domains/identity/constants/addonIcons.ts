import { Link, Megaphone, Pin, RotateCcw, ShieldCheck, Zap, type LucideIcon } from 'lucide-react-native';
import type { AddonType } from '@/core/api';

/** One mark per add-on, shared by the rate card editor and the media kit tickets. */
export const ADDON_ICONS = {
  rush_delivery: Zap,
  extra_revision: RotateCcw,
  exclusivity: ShieldCheck,
  whitelisting: Megaphone,
  link_in_bio: Link,
  pin: Pin,
} as const satisfies Record<AddonType, LucideIcon>;
