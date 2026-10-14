/** Every station a direct deal passes, in order; `ship` only when a product is sent. */
export const DEAL_JOURNEY_STAGES = ['sign', 'reply', 'escrow', 'ship', 'make', 'review', 'publish', 'done'] as const;
export type DealJourneyStageKey = (typeof DEAL_JOURNEY_STAGES)[number];

export type DealJourneyStatus = 'done' | 'now' | 'next' | 'later';
/** Who moves at this station, seen from the brand. */
export type DealJourneyActor = 'you' | 'creator' | 'sada';

export interface DealJourneyStage {
  key: DealJourneyStageKey;
  status: DealJourneyStatus;
  actor: DealJourneyActor;
}

const ACTOR = {
  sign: 'you',
  reply: 'creator',
  escrow: 'sada',
  ship: 'you',
  make: 'creator',
  review: 'you',
  publish: 'creator',
  done: 'sada',
} as const satisfies Record<DealJourneyStageKey, DealJourneyActor>;

const statusOf = (index: number, current: number): DealJourneyStatus => {
  if (index < current) return 'done';
  if (index === current) return 'now';
  return index === current + 1 ? 'next' : 'later';
};

/**
 * The stations for one deal, each with its place relative to `current`. A digital deal has no
 * shipping station; asking for `ship` on one falls forward to the station after it.
 */
export const buildDealJourney = ({
  hasProduct,
  current,
}: {
  hasProduct: boolean;
  current: DealJourneyStageKey;
}): DealJourneyStage[] => {
  const keys = DEAL_JOURNEY_STAGES.filter(key => hasProduct || key !== 'ship');
  const target = !hasProduct && current === 'ship' ? 'make' : current;
  const currentIndex = keys.indexOf(target);
  return keys.map((key, index) => ({ key, status: statusOf(index, currentIndex), actor: ACTOR[key] }));
};

/** Where the rail's fill ends: the share of the track up to the current station (0–1). */
export const journeyProgress = (stages: readonly DealJourneyStage[]): number => {
  const now = stages.findIndex(stage => stage.status === 'now');
  return stages.length < 2 || now < 0 ? 0 : now / (stages.length - 1);
};
