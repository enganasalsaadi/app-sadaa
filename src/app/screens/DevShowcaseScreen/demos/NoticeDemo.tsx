import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Box, CustomButton, Notice } from '@/shared/ui';
import type { NoticeTone } from '@/shared/ui';
import { useNoticeDemo } from './hooks/useNoticeDemo';

/** Exhaustive: a new tone fails the build until it is shown here. */
const TONE_MESSAGE_KEY = {
  info: 'devShowcase.notice.info',
  success: 'devShowcase.notice.success',
  warning: 'devShowcase.notice.warning',
  danger: 'devShowcase.notice.danger',
  premium: 'devShowcase.notice.premium',
} as const satisfies Record<NoticeTone, ParseKeys>;

const TONES = Object.keys(TONE_MESSAGE_KEY) as NoticeTone[];

const NoticeDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useNoticeDemo();

  return (
    <Box gap="md">
      {TONES.map(tone => (
        <Notice key={tone} tone={tone} message={t(TONE_MESSAGE_KEY[tone])} />
      ))}
      {demo.dismissed ? (
        <CustomButton
          title={t('devShowcase.notice.restore')}
          variant="secondary"
          size="sm"
          onPress={demo.restore}
        />
      ) : (
        <Notice
          tone="warning"
          title={t('devShowcase.notice.kycTitle')}
          message={t('devShowcase.notice.kycMessage')}
          action={{ label: t('devShowcase.notice.kycAction'), onPress: demo.act }}
          onDismiss={demo.dismiss}
        />
      )}
    </Box>
  );
};

export const NoticeDemo = memo(NoticeDemoComponent);
