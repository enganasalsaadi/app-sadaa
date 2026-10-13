import type { Deal, DealItemStatus, DealStatus, Labeled } from '@/domains/marketplace';

/** Dev-only: the raw key stands in for the server's localized label. */
const labeled = <K extends string>(key: K, label: string = key): Labeled<K> => ({ key, label });

interface MockDealInput {
  id: string;
  status: DealStatus;
  statusLabel?: string;
  stage?: DealItemStatus;
  title: string;
  counterpart: string;
  avatarUrl?: string;
  totalCents: number;
  itemsCount?: number;
  dueAt?: number | null;
  funded?: boolean;
  shipping?: boolean;
}

/** A complete `Deal` for showcase demos; only what the parts read is meaningful. */
export const buildMockDeal = ({
  id,
  status,
  statusLabel,
  stage,
  title,
  counterpart,
  avatarUrl,
  totalCents,
  itemsCount = 1,
  dueAt = null,
  funded = false,
  shipping = false,
}: MockDealInput): Deal => {
  const total = { amount: totalCents, currency: 'USD' } as const;
  const party = { name: counterpart, avatarUrl: avatarUrl ?? null };
  return {
    id,
    origin: 'direct',
    status: labeled(status, statusLabel),
    stage: stage ? labeled(stage) : null,
    brand: party,
    creator: { ...party, slug: null },
    items: [
      {
        id: `${id}-item`,
        rateCardId: null,
        upsellId: null,
        title,
        platform: 'instagram',
        service: 'reel',
        packageValue: null,
        unitPrice: total,
        addons: [],
        total,
        deliveryDays: 5,
        deliveryHours: null,
        retentionDays: 30,
        revisionsAllowed: 2,
        revisionsUsed: 0,
        revisionsLeft: 2,
        approveAsIsAvailable: false,
        status: labeled(stage ?? 'pending'),
        dueAt,
        timerPaused: false,
        liveUrl: null,
        fixRequestsLeft: 2,
        verifiedAt: null,
      },
    ],
    itemsCount,
    total,
    shippingMode: labeled(shipping ? 'gift' : 'none'),
    shipping: shipping ? { shipBy: null, reshipsLeft: 1, freeCancelFrom: null, shipments: [] } : null,
    cancellation: null,
    deliveryHours: 120,
    requestedDeliveryDays: null,
    extendedDeliveryHours: null,
    extension: null,
    declineReason: null,
    deadlineAt: null,
    upsells: [],
    upsellWindow: { open: false, closedReason: null, pendingUpsellId: null },
    dispute: null,
    disputeWindow: { open: false, closedReason: null, disputesLeft: 1 },
    retention: [],
    retentionCases: [],
    rating: null,
    brief: null,
    briefAttachments: [],
    dueAt,
    sentAt: null,
    fundedAt: funded ? Date.UTC(2026, 9, 1) : null,
    contract: null,
    createdAt: null,
    updatedAt: null,
  };
};
