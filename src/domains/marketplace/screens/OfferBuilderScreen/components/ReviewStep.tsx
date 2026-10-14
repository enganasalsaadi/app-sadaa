import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, StaggerIn, Text } from '@/shared/ui';
import { DealGuideButton, DealJourney } from '../../../components';
import { countDeliverables } from '../../../utils/offerForm';
import { quotePaceHours } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';
import { ExecutiveDealCard } from './ExecutiveDealCard';
import { WalletHold } from './WalletHold';

/** Step 3: the deal as the creator will get it (with the contract one tap away), the wallet, and what comes next. */
const ReviewStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { creatorName, creator, quote, offer, onOpenGuide } = useOfferBuilder();

  return (
    <Box gap="2xl" pb="3xl">
      <Box gap="xs">
        <Text variant="h3" color={colors.text.primary}>
          {t('marketplace.offer.review.title')}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.review.body', { name: creatorName })}
        </Text>
      </Box>
      <StaggerIn gap="lg">
        <ExecutiveDealCard />
        {creator?.avgViews ? (
          <Box row align="center" gap="sm" px="lg" py="sm" borderRadius="full" bg={colors.surface.main} shadow="sm">
            <Eye size={sizes.icon.xs} color={colors.interactive.main} />
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.offer.review.views')}
            </Text>
            <Text variant="label" color={colors.text.primary}>
              {formatNumber(creator.avgViews, { notation: 'compact', maximumFractionDigits: 1 })}
            </Text>
          </Box>
        ) : null}
        <WalletHold />
        {quote ? (
          <DealJourney
            mode="plan"
            current="sign"
            creatorName={creatorName}
            shippingMode={offer.shippingMode}
            windows={quote.windows}
            total={quote.total}
            shortfall={quote.wallet.isSufficient ? null : quote.wallet.shortfall}
            deliverables={countDeliverables(offer.lines)}
            paceHours={quotePaceHours(quote)}
            signedAt={null}
          />
        ) : null}
        <DealGuideButton onPress={onOpenGuide} />
      </StaggerIn>
    </Box>
  );
};

export const ReviewStep = memo(ReviewStepComponent);
