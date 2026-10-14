import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  BadgeCheck,
  Eye,
  FileText,
  Link2,
  Lock,
  MessageCircle,
  Package,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import type { DealGuideRole } from '@/core/navigation';
import { DEAL_MAX_EXTENSION_DAYS, DEFAULT_DEAL_WINDOWS } from '../../../constants/dealOffer';
import type { BrandGuideChapterKey, CreatorGuideChapterKey } from '../../../utils/dealGuide';
import { formatDuration } from '../../../utils/offerDuration';

/** Who moves in a chapter, from the reader's side. */
export type GuideActor = 'you' | 'other' | 'sada';

export interface GuideChapterCopy {
  icon: LucideIcon;
  actor: GuideActor;
  name: string;
  title: string;
  time: string;
  body: string;
  points: string[];
  ifLate: string | null;
}

export interface GuideCopy {
  audience: string;
  sub: string;
  who: Record<GuideActor, string>;
  facts: { icon: LucideIcon; text: string }[];
  chapters: Record<string, GuideChapterCopy>;
  faq: { q: string; a: string }[];
}

const W = DEFAULT_DEAL_WINDOWS;

const brandChapters = (t: TFunction): Record<BrandGuideChapterKey, GuideChapterCopy> => {
  const reply = formatDuration(t, W.influencerResponseHours);
  const topUp = formatDuration(t, W.paymentTopUpHours);
  const review = formatDuration(t, W.brandReviewHours);
  const publish = formatDuration(t, W.publishWindowHours);
  return {
    sign: {
      icon: PenLine,
      actor: 'you',
      name: t('marketplace.guide.brand.sign.name'),
      title: t('marketplace.guide.brand.sign.title'),
      time: t('marketplace.guide.brand.sign.time'),
      body: t('marketplace.guide.brand.sign.body'),
      points: [t('marketplace.guide.brand.sign.p1'), t('marketplace.guide.brand.sign.p2'), t('marketplace.guide.brand.sign.p3')],
      ifLate: null,
    },
    reply: {
      icon: MessageCircle,
      actor: 'other',
      name: t('marketplace.guide.brand.reply.name'),
      title: t('marketplace.guide.brand.reply.title'),
      time: t('marketplace.guide.brand.reply.time', { duration: reply }),
      body: t('marketplace.guide.brand.reply.body', { days: DEAL_MAX_EXTENSION_DAYS }),
      points: [t('marketplace.guide.brand.reply.p1'), t('marketplace.guide.brand.reply.p2')],
      ifLate: t('marketplace.guide.brand.reply.ifLate', { duration: reply }),
    },
    escrow: {
      icon: ShieldCheck,
      actor: 'sada',
      name: t('marketplace.guide.brand.escrow.name'),
      title: t('marketplace.guide.brand.escrow.title'),
      time: t('marketplace.guide.brand.escrow.time'),
      body: t('marketplace.guide.brand.escrow.body'),
      points: [t('marketplace.guide.brand.escrow.p1', { duration: topUp })],
      ifLate: t('marketplace.guide.brand.escrow.ifLate', { duration: topUp }),
    },
    ship: {
      icon: Package,
      actor: 'you',
      name: t('marketplace.guide.brand.ship.name'),
      title: t('marketplace.guide.brand.ship.title'),
      time: t('marketplace.guide.brand.ship.time', { duration: formatDuration(t, W.brandShipHours) }),
      body: t('marketplace.guide.brand.ship.body'),
      points: [t('marketplace.guide.brand.ship.p1'), t('marketplace.guide.brand.ship.p2')],
      ifLate: t('marketplace.guide.brand.ship.ifLate'),
    },
    make: {
      icon: Sparkles,
      actor: 'other',
      name: t('marketplace.guide.brand.make.name'),
      title: t('marketplace.guide.brand.make.title'),
      time: t('marketplace.guide.brand.make.time'),
      body: t('marketplace.guide.brand.make.body'),
      points: [],
      ifLate: t('marketplace.guide.brand.make.ifLate'),
    },
    review: {
      icon: Eye,
      actor: 'you',
      name: t('marketplace.guide.brand.review.name'),
      title: t('marketplace.guide.brand.review.title'),
      time: t('marketplace.guide.brand.review.time', { duration: review }),
      body: t('marketplace.guide.brand.review.body'),
      points: [t('marketplace.guide.brand.review.p1')],
      ifLate: t('marketplace.guide.brand.review.ifLate', { duration: review }),
    },
    publish: {
      icon: Link2,
      actor: 'other',
      name: t('marketplace.guide.brand.publish.name'),
      title: t('marketplace.guide.brand.publish.title'),
      time: t('marketplace.guide.brand.publish.time', { duration: publish }),
      body: t('marketplace.guide.brand.publish.body'),
      points: [],
      ifLate: t('marketplace.guide.brand.publish.ifLate', { duration: publish }),
    },
    done: {
      icon: BadgeCheck,
      actor: 'sada',
      name: t('marketplace.guide.brand.done.name'),
      title: t('marketplace.guide.brand.done.title'),
      time: t('marketplace.guide.brand.done.time'),
      body: t('marketplace.guide.brand.done.body'),
      points: [t('marketplace.guide.brand.done.p1'), t('marketplace.guide.brand.done.p2')],
      ifLate: null,
    },
  };
};

const creatorChapters = (t: TFunction): Record<CreatorGuideChapterKey, GuideChapterCopy> => {
  const reply = formatDuration(t, W.influencerResponseHours);
  const topUp = formatDuration(t, W.paymentTopUpHours);
  const review = formatDuration(t, W.brandReviewHours);
  const publish = formatDuration(t, W.publishWindowHours);
  return {
    offer: {
      icon: Send,
      actor: 'other',
      name: t('marketplace.guide.creator.offer.name'),
      title: t('marketplace.guide.creator.offer.title'),
      time: t('marketplace.guide.creator.offer.time'),
      body: t('marketplace.guide.creator.offer.body'),
      points: [],
      ifLate: null,
    },
    reply: {
      icon: MessageCircle,
      actor: 'you',
      name: t('marketplace.guide.creator.reply.name'),
      title: t('marketplace.guide.creator.reply.title'),
      time: t('marketplace.guide.creator.reply.time', { duration: reply }),
      body: t('marketplace.guide.creator.reply.body', { days: DEAL_MAX_EXTENSION_DAYS }),
      points: [],
      ifLate: t('marketplace.guide.creator.reply.ifLate', { duration: reply }),
    },
    escrow: {
      icon: ShieldCheck,
      actor: 'sada',
      name: t('marketplace.guide.creator.escrow.name'),
      title: t('marketplace.guide.creator.escrow.title'),
      time: t('marketplace.guide.creator.escrow.time'),
      body: t('marketplace.guide.creator.escrow.body'),
      points: [],
      ifLate: t('marketplace.guide.creator.escrow.ifLate', { duration: topUp }),
    },
    receive: {
      icon: Package,
      actor: 'you',
      name: t('marketplace.guide.creator.receive.name'),
      title: t('marketplace.guide.creator.receive.title'),
      time: t('marketplace.guide.creator.receive.time'),
      body: t('marketplace.guide.creator.receive.body'),
      points: [],
      ifLate: t('marketplace.guide.creator.receive.ifLate'),
    },
    make: {
      icon: Sparkles,
      actor: 'you',
      name: t('marketplace.guide.creator.make.name'),
      title: t('marketplace.guide.creator.make.title'),
      time: t('marketplace.guide.creator.make.time'),
      body: t('marketplace.guide.creator.make.body'),
      points: [],
      ifLate: t('marketplace.guide.creator.make.ifLate'),
    },
    review: {
      icon: Eye,
      actor: 'other',
      name: t('marketplace.guide.creator.review.name'),
      title: t('marketplace.guide.creator.review.title'),
      time: t('marketplace.guide.creator.review.time', { duration: review }),
      body: t('marketplace.guide.creator.review.body'),
      points: [],
      ifLate: t('marketplace.guide.creator.review.ifLate', { duration: review }),
    },
    publish: {
      icon: Link2,
      actor: 'you',
      name: t('marketplace.guide.creator.publish.name'),
      title: t('marketplace.guide.creator.publish.title'),
      time: t('marketplace.guide.creator.publish.time', { duration: publish }),
      body: t('marketplace.guide.creator.publish.body'),
      points: [],
      ifLate: t('marketplace.guide.creator.publish.ifLate', { duration: publish }),
    },
    earnings: {
      icon: Wallet,
      actor: 'sada',
      name: t('marketplace.guide.creator.earnings.name'),
      title: t('marketplace.guide.creator.earnings.title'),
      time: t('marketplace.guide.creator.earnings.time'),
      body: t('marketplace.guide.creator.earnings.body'),
      points: [],
      ifLate: null,
    },
  };
};

/** The role's whole guide as text: hero, facts, every chapter and the FAQ. Windows are the defaults. */
export const useDealGuideCopy = (role: DealGuideRole): GuideCopy => {
  const { t } = useTranslation();
  return useMemo(() => {
    if (role === 'brand') {
      return {
        audience: t('marketplace.guide.brand.audience'),
        sub: t('marketplace.guide.brand.sub'),
        who: {
          you: t('marketplace.guide.brand.who.you'),
          other: t('marketplace.guide.brand.who.other'),
          sada: t('marketplace.guide.brand.who.sada'),
        },
        facts: [
          { icon: Lock, text: t('marketplace.guide.brand.fact1') },
          { icon: ShieldCheck, text: t('marketplace.guide.brand.fact2') },
          { icon: FileText, text: t('marketplace.guide.brand.fact3') },
        ],
        chapters: brandChapters(t),
        faq: [
          { q: t('marketplace.guide.brand.q1'), a: t('marketplace.guide.brand.a1') },
          { q: t('marketplace.guide.brand.q2'), a: t('marketplace.guide.brand.a2') },
          { q: t('marketplace.guide.brand.q3'), a: t('marketplace.guide.brand.a3') },
          { q: t('marketplace.guide.brand.q4'), a: t('marketplace.guide.brand.a4') },
          { q: t('marketplace.guide.brand.q5'), a: t('marketplace.guide.brand.a5') },
        ],
      };
    }
    return {
      audience: t('marketplace.guide.creator.audience'),
      sub: t('marketplace.guide.creator.sub'),
      who: {
        you: t('marketplace.guide.creator.who.you'),
        other: t('marketplace.guide.creator.who.other'),
        sada: t('marketplace.guide.creator.who.sada'),
      },
      facts: [
        { icon: Wallet, text: t('marketplace.guide.creator.fact1') },
        { icon: Lock, text: t('marketplace.guide.creator.fact2') },
        { icon: FileText, text: t('marketplace.guide.creator.fact3') },
      ],
      chapters: creatorChapters(t),
      faq: [
        { q: t('marketplace.guide.creator.q1'), a: t('marketplace.guide.creator.a1') },
        {
          q: t('marketplace.guide.creator.q2'),
          a: t('marketplace.guide.creator.a2', { duration: formatDuration(t, W.publishWindowHours) }),
        },
        { q: t('marketplace.guide.creator.q3'), a: t('marketplace.guide.creator.a3') },
        { q: t('marketplace.guide.creator.q4'), a: t('marketplace.guide.creator.a4') },
      ],
    };
  }, [role, t]);
};
