import type { LucideIcon } from 'lucide-react-native';
import {
  AtSign,
  BadgeCheck,
  Ban,
  Bell,
  BellRing,
  Handshake,
  Hourglass,
  LockOpen,
  Mail,
  Megaphone,
  PackageCheck,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Wallet,
} from 'lucide-react-native';
import type { HueTone } from '@/core/theme';

export interface NotificationLook {
  icon: LucideIcon;
  tone: HueTone;
}

// Status never rides on color alone: the title states the outcome, the icon names the subject.
const TYPE_LOOK: Record<string, NotificationLook> = {
  kyc_approved: { icon: ShieldCheck, tone: 'success' },
  kyc_rejected: { icon: ShieldCheck, tone: 'danger' },
  brand_social_proof_approved: { icon: ShieldCheck, tone: 'success' },
  brand_social_proof_rejected: { icon: ShieldCheck, tone: 'danger' },
  brand_domain_verified: { icon: ShieldCheck, tone: 'success' },
  platform_approved: { icon: AtSign, tone: 'success' },
  platform_rejected: { icon: AtSign, tone: 'danger' },
  wallet_top_up_completed: { icon: Wallet, tone: 'success' },
  wallet_top_up_rejected: { icon: Wallet, tone: 'danger' },
  wallet_withdrawal_completed: { icon: Wallet, tone: 'success' },
  wallet_withdrawal_rejected: { icon: Wallet, tone: 'danger' },
  wallet_withdrawal_returned: { icon: Wallet, tone: 'warning' },
  wallet_wallet_frozen: { icon: Wallet, tone: 'warning' },
  wallet_wallet_unfrozen: { icon: Wallet, tone: 'success' },
  // Security alerts: "if this wasn't you, contact support".
  wallet_payout_method_added: { icon: ShieldAlert, tone: 'warning' },
  wallet_payout_method_changed: { icon: ShieldAlert, tone: 'warning' },

  // Public campaigns, brand side (contract §7.1): the campaign's review, applicants, clock and seats.
  campaign_approved: { icon: BadgeCheck, tone: 'success' },
  campaign_changes_requested: { icon: Megaphone, tone: 'warning' },
  campaign_rejected: { icon: Ban, tone: 'danger' },
  campaign_removed: { icon: Ban, tone: 'danger' },
  campaign_new_applications: { icon: Users, tone: 'interactive' },
  campaign_ghost_warning: { icon: Hourglass, tone: 'warning' },
  campaign_suspended: { icon: Hourglass, tone: 'danger' },
  campaign_suspension_final_warning: { icon: Hourglass, tone: 'danger' },
  campaign_deadline_reached: { icon: Users, tone: 'warning' },
  campaign_zero_applicants: { icon: Hourglass, tone: 'warning' },
  campaign_zero_applicants_final_warning: { icon: Hourglass, tone: 'danger' },
  campaign_filled: { icon: BadgeCheck, tone: 'success' },
  campaign_closed: { icon: Megaphone, tone: 'neutral' },
  campaign_cancelled: { icon: Ban, tone: 'neutral' },
  campaign_seat_freed: { icon: Users, tone: 'warning' },
  campaign_seat_reopened: { icon: Users, tone: 'interactive' },
  campaign_drop_summary_1440: { icon: Rocket, tone: 'interactive' },
  campaign_drop_summary_120: { icon: Rocket, tone: 'interactive' },
  campaign_drop_summary_0: { icon: Rocket, tone: 'success' },

  // Creator side (§7.2): the invitation, the application's outcome, the drop clock.
  campaign_invited: { icon: Mail, tone: 'interactive' },
  campaign_shortlisted: { icon: Star, tone: 'success' },
  campaign_selected: { icon: Handshake, tone: 'success' },
  campaign_not_selected: { icon: Megaphone, tone: 'neutral' },
  campaign_application_rejected: { icon: Megaphone, tone: 'neutral' },
  campaign_application_expired: { icon: Hourglass, tone: 'neutral' },
  campaign_application_cancelled: { icon: Ban, tone: 'neutral' },
  campaign_drop_reminder_1440: { icon: BellRing, tone: 'interactive' },
  campaign_drop_reminder_120: { icon: BellRing, tone: 'interactive' },
  campaign_drop_reminder_0: { icon: BellRing, tone: 'success' },
  deal_campaign_announcement: { icon: Megaphone, tone: 'interactive' },

  // Sample returns and the public-apply restriction: what is asked of you, and when it lifts.
  deal_public_apply_ban: { icon: Ban, tone: 'danger' },
  deal_public_apply_ban_lifted: { icon: LockOpen, tone: 'success' },
  deal_return_lock_lifted: { icon: LockOpen, tone: 'success' },
  deal_return_required: { icon: Truck, tone: 'warning' },
  deal_return_received: { icon: PackageCheck, tone: 'success' },
  deal_return_waived: { icon: PackageCheck, tone: 'neutral' },
  deal_return_issue: { icon: ShieldAlert, tone: 'warning' },
  deal_return_overdue: { icon: Hourglass, tone: 'danger' },
  deal_return_shipped: { icon: Truck, tone: 'interactive' },
  deal_return_overdue_brand: { icon: Hourglass, tone: 'warning' },
};

// Every other `deal_<kind>` is the Direct Deals set: one handshake, its title says what happened.
const DEAL_LOOK: NotificationLook = { icon: Handshake, tone: 'interactive' };
const CAMPAIGN_LOOK: NotificationLook = { icon: Megaphone, tone: 'interactive' };
const DEFAULT_LOOK: NotificationLook = { icon: Bell, tone: 'interactive' };

/** Icon + tone of an inbox row: its own entry, else its family's, else the bell. */
export const notificationLook = (type: string): NotificationLook => {
  const own = TYPE_LOOK[type];
  if (own) return own;
  if (type.startsWith('deal_')) return DEAL_LOOK;
  if (type.startsWith('campaign_')) return CAMPAIGN_LOOK;
  return DEFAULT_LOOK;
};
