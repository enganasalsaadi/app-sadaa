import type { Deal, DealItemAction, DealRole } from '../types';
import { getDealItemActions } from './dealStatus';

/** Who moves next, seen from the viewer. */
export type DealNextActor = 'you' | 'other' | 'sada';

export const DEAL_NEXT_STEPS = [
  // brand
  'brandDraft',
  'brandWaitReply',
  'brandAnswerExtension',
  'brandFund',
  'brandEscrowLocked',
  'brandShip',
  'brandWaitReceipt',
  'brandAnswerIssue',
  'brandWaitDraft',
  'brandReviewDraft',
  'brandWaitPublish',
  'brandVerifyPost',
  // creator
  'creatorReply',
  'creatorWaitExtension',
  'creatorWaitFund',
  'creatorEscrowLocked',
  'creatorWaitShip',
  'creatorReceive',
  'creatorWaitIssue',
  'creatorSubmitDraft',
  'creatorWaitReview',
  'creatorPublish',
  'creatorWaitVerify',
  // both
  'dispute',
  'rate',
  'done',
] as const;
export type DealNextStepKey = (typeof DEAL_NEXT_STEPS)[number];

export interface DealNextStep {
  key: DealNextStepKey;
  actor: DealNextActor;
}

type NextStepInput = Pick<
  Deal,
  'status' | 'stage' | 'items' | 'shipping' | 'rating'
>;

const step = (key: DealNextStepKey, actor: DealNextActor): DealNextStep => ({
  key,
  actor,
});

const itemActionsOf = (
  deal: NextStepInput,
  role: DealRole,
): Set<DealItemAction> =>
  new Set(deal.items.flatMap(item => getDealItemActions(item, role)));

/**
 * The one line under every ticket and the detail's «next step» card: who moves and what. A UX
 * hint read from the server's status, stage and items (rule 06); stopped deals have none.
 */
export const dealNextStep = (
  deal: NextStepInput,
  role: DealRole,
): DealNextStep | null => {
  const brand = role === 'brand';
  if (deal.rating?.open && !deal.rating[role].answered)
    return step('rate', 'you');

  switch (deal.status.key) {
    case 'draft':
      return brand ? step('brandDraft', 'you') : null;
    case 'pending_influencer':
      return brand
        ? step('brandWaitReply', 'other')
        : step('creatorReply', 'you');
    case 'negotiating_deadline':
      return brand
        ? step('brandAnswerExtension', 'you')
        : step('creatorWaitExtension', 'other');
    case 'awaiting_payment':
      return brand
        ? step('brandFund', 'you')
        : step('creatorWaitFund', 'other');
    case 'escrow_locked':
      return brand
        ? step('brandEscrowLocked', 'sada')
        : step('creatorEscrowLocked', 'sada');
    case 'product_shipping': {
      const onTheWay =
        deal.shipping?.shipments.some(
          s => s.receivedAt === null && s.issue === null,
        ) ?? false;
      if (onTheWay)
        return brand
          ? step('brandWaitReceipt', 'other')
          : step('creatorReceive', 'you');
      return brand
        ? step('brandShip', 'you')
        : step('creatorWaitShip', 'other');
    }
    case 'shipping_issue':
      return brand
        ? step('brandAnswerIssue', 'you')
        : step('creatorWaitIssue', 'other');
    case 'in_progress': {
      const mine = itemActionsOf(deal, role);
      if (brand) {
        if (mine.has('reviewDraft')) return step('brandReviewDraft', 'you');
        if (mine.has('verifyPost')) return step('brandVerifyPost', 'you');
      } else {
        if (mine.has('submitDraft')) return step('creatorSubmitDraft', 'you');
        if (mine.has('publish')) return step('creatorPublish', 'you');
      }
      switch (deal.stage?.key ?? 'pending') {
        case 'draft_submitted':
          return brand
            ? step('brandReviewDraft', 'you')
            : step('creatorWaitReview', 'other');
        case 'approved_to_publish':
          return brand
            ? step('brandWaitPublish', 'other')
            : step('creatorPublish', 'you');
        case 'verifying_live':
        case 'verified':
          return brand
            ? step('brandVerifyPost', 'you')
            : step('creatorWaitVerify', 'other');
        default:
          return brand
            ? step('brandWaitDraft', 'other')
            : step('creatorSubmitDraft', 'you');
      }
    }
    case 'disputed':
      return step('dispute', 'sada');
    case 'completed':
    case 'resolved_payout':
      return step('done', 'sada');
    default:
      return null;
  }
};

/** «Your turn»: the deal waits on the viewer. */
export const isDealOnYou = (deal: NextStepInput, role: DealRole): boolean =>
  dealNextStep(deal, role)?.actor === 'you';
