import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Bell, BadgeCheck, FileCheck2, Megaphone, ShieldCheck, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet, ListGroup, ListRow } from '@/shared/ui';
import type { PushPromptSheetState } from '../hooks/usePushPrompt';

export type PushPromptRole = 'creator' | 'brand';

interface PromptCopy {
  title: ParseKeys;
  body: ParseKeys;
  benefits: readonly { icon: LucideIcon; label: ParseKeys }[];
}

// Each benefit is a push the role really gets (contract §11.2 + marketplace).
const COPY = {
  creator: {
    title: 'auth.pushPrompt.creator.title',
    body: 'auth.pushPrompt.creator.body',
    benefits: [
      { icon: Megaphone, label: 'auth.pushPrompt.creator.offers' },
      { icon: ShieldCheck, label: 'auth.pushPrompt.creator.kyc' },
      { icon: BadgeCheck, label: 'auth.pushPrompt.creator.platforms' },
    ],
  },
  brand: {
    title: 'auth.pushPrompt.brand.title',
    body: 'auth.pushPrompt.brand.body',
    benefits: [
      { icon: ShieldCheck, label: 'auth.pushPrompt.brand.verified' },
      { icon: Users, label: 'auth.pushPrompt.brand.applications' },
      { icon: FileCheck2, label: 'auth.pushPrompt.brand.content' },
    ],
  },
} as const satisfies Record<PushPromptRole, PromptCopy>;

interface PushPromptSheetProps extends PushPromptSheetState {
  role: PushPromptRole;
}

/** Role-specific reason to allow pushes, shown before the OS dialog. */
export const PushPromptSheet: React.FC<PushPromptSheetProps> = memo(
  ({ role, visible, isEnabling, onEnable, onNotNow }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const copy = COPY[role];

    return (
      <ConfirmSheet
        visible={visible}
        onClose={onNotNow}
        icon={<Bell size={sizes.icon.lg} color={colors.interactive.main} />}
        title={t(copy.title)}
        body={t(copy.body)}
        confirmLabel={t('auth.pushPrompt.enable')}
        onConfirm={onEnable}
        confirmLoading={isEnabling}
        cancelLabel={t('auth.pushPrompt.notNow')}
      >
        <ListGroup>
          {copy.benefits.map(benefit => (
            <ListRow key={benefit.label} icon={benefit.icon} title={t(benefit.label)} />
          ))}
        </ListGroup>
      </ConfirmSheet>
    );
  },
);
