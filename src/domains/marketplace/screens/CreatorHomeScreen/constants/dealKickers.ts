import type { ParseKeys } from 'i18next';
import {
  Hand,
  Inbox,
  Link2,
  Package,
  PenLine,
  Plus,
  RotateCcw,
  Scale,
  Send,
  Star,
  Upload,
  type LucideIcon,
} from 'lucide-react-native';
import type { CreatorDealAction } from '../../../types';

export interface CreatorDealKicker {
  labelKey: ParseKeys;
  icon: LucideIcon;
}

/** The task deck's kicker: what kind of turn this is, one word and a glyph per action. */
export const CREATOR_DEAL_ACTION_KICKER = {
  reply_offer: { labelKey: 'marketplace.creatorHome.tasks.kicker.replyOffer', icon: Inbox },
  confirm_receipt: { labelKey: 'marketplace.creatorHome.tasks.kicker.confirmReceipt', icon: Package },
  submit_draft: { labelKey: 'marketplace.creatorHome.tasks.kicker.submitDraft', icon: Upload },
  revise_draft: { labelKey: 'marketplace.creatorHome.tasks.kicker.reviseDraft', icon: PenLine },
  publish: { labelKey: 'marketplace.creatorHome.tasks.kicker.publish', icon: Send },
  fix_live_url: { labelKey: 'marketplace.creatorHome.tasks.kicker.fixLiveUrl', icon: Link2 },
  answer_upsell: { labelKey: 'marketplace.creatorHome.tasks.kicker.answerUpsell', icon: Plus },
  add_evidence: { labelKey: 'marketplace.creatorHome.tasks.kicker.addEvidence', icon: Scale },
  restore_post: { labelKey: 'marketplace.creatorHome.tasks.kicker.restorePost', icon: RotateCcw },
  rate: { labelKey: 'marketplace.creatorHome.tasks.kicker.rate', icon: Star },
} as const satisfies Record<CreatorDealAction, CreatorDealKicker>;

export const UNKNOWN_CREATOR_DEAL_ACTION_KICKER: CreatorDealKicker = {
  labelKey: 'marketplace.creatorHome.tasks.kicker.open',
  icon: Hand,
};
