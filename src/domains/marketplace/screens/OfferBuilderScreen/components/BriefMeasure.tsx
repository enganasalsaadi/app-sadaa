import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link2, TicketPercent, Target } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomInput } from '@/shared/ui';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';
import { useOfferBuilder } from '../OfferBuilderContext';
import { BriefBlock } from './BriefBlock';

/** How the brand measures the post: a discount code and a tracking link said in the content. */
const BriefMeasureComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { form } = useOfferBuilder();

  return (
    <BriefBlock icon={Target} title={t('marketplace.offer.brief.measure.title')} body={t('marketplace.offer.brief.measure.body')}>
      <Box>
        <Controller
          control={form.control}
          name="promoCode"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('marketplace.offer.brief.measure.promo')}
              placeholder={t('marketplace.offer.brief.measure.promoPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={DEAL_BRIEF_LIMITS.maxPromoCodeLength}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => form.setFocus('trackingLink')}
              leftIcon={<TicketPercent size={sizes.icon.sm} color={colors.text.tertiary} />}
              mb="md"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="trackingLink"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('marketplace.offer.brief.measure.link')}
              placeholder={t('marketplace.offer.brief.measure.linkPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={DEAL_BRIEF_LIMITS.maxTrackingLinkLength}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="URL"
              returnKeyType="done"
              leftIcon={<Link2 size={sizes.icon.sm} color={colors.text.tertiary} />}
              error={fieldState.error?.message}
            />
          )}
        />
      </Box>
    </BriefBlock>
  );
};

export const BriefMeasure = memo(BriefMeasureComponent);
