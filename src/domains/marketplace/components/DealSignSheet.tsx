import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Pressable, Text } from '@/shared/ui';
import { DealCommitSlip, type DealCommitLine } from './DealCommitSlip';
import { DealSheetFrame } from './DealSheetFrame';
import { DealHoldToSign } from './DealHoldToSign';

export interface DealSignSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismissed: () => void;
  title: string;
  body: string;
  amount: Money;
  badge: string;
  caption: string;
  lines: readonly DealCommitLine[];
  /** On the hold button. */
  hold: string;
  /** Over the hold button: what the signature binds. */
  holdCaption: string;
  holdA11y: string;
  onSign: () => Promise<boolean>;
  /** Opens the full contract once the sheet is gone; hidden without one. */
  onContract?: () => void;
}

/**
 * «I agree and commit»: the slip of what is being signed, the contract one tap away, then hold
 * to sign. The creator's accept and the brand's extension approval both sign here.
 */
const DealSignSheetComponent: React.FC<DealSignSheetProps> = ({
  visible,
  onClose,
  onDismissed,
  title,
  body,
  amount,
  badge,
  caption,
  lines,
  hold,
  holdCaption,
  holdA11y,
  onSign,
  onContract,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      title={title}
      body={body}
      footer={
        <DealHoldToSign
          label={hold}
          caption={holdCaption}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={holdA11y}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          onComplete={onSign}
        />
      }
    >
      <DealCommitSlip
        amount={amount}
        badge={badge}
        caption={caption}
        lines={lines}
        notchColor={colors.layout.base}
      />
      {onContract ? (
        <Pressable
          row
          align="center"
          justify="center"
          gap="xs"
          py="md"
          onPress={onContract}
          accessibilityRole="link"
          accessibilityLabel={t('marketplace.deals.respond.slip.contract')}
        >
          <FileText size={sizes.icon.sm} color={colors.interactive.main} />
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.deals.respond.slip.contract')}
          </Text>
        </Pressable>
      ) : null}
    </DealSheetFrame>
  );
};

export const DealSignSheet = memo(DealSignSheetComponent);
