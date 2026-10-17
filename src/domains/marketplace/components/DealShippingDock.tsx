import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleCheck, CircleX, MapPin, RotateCcw, TriangleAlert, Truck } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import type { DealShippingModel } from '../hooks/useDealShipping';
import { DealDecisionDock, type DealDockClock } from './DealDecisionDock';
import { DealHoldToSign } from './DealHoldToSign';

export interface DealShippingDockProps {
  shipping: DealShippingModel;
}

/**
 * The deal page's bar while the product is shipping (P5): the brand enters the waybill (the
 * ship-by clock over it) or answers a report (re-ship / cancel with a refund, its answer clock);
 * the creator holds to confirm receipt with «a problem?» under it, holds for the free cancel once
 * it opens, or adds a missing address. Sits on the same docked bar as the offer answers (P4).
 */
const DealShippingDockComponent: React.FC<DealShippingDockProps> = ({ shipping }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles((): Record<'grow', ViewStyle> => ({ grow: { flex: 1 } }), []);
  const { dock, view } = shipping;
  if (!dock || !view) return null;
  const name = isolateText(shipping.party);

  const clock = ((): DealDockClock | null => {
    if (dock === 'brandShip' && view.shipOpensAt !== null) {
      return { dueAt: view.shipOpensAt, windowHours: null, lead: t('marketplace.deals.shipping.dock.opensClock') };
    }
    if (dock === 'brandShip' && view.shipBy !== null) {
      return { dueAt: view.shipBy, windowHours: null, lead: t('marketplace.deals.shipping.dock.shipClock') };
    }
    const answerBy = view.current?.issue?.answerBy ?? null;
    if (dock === 'brandAnswerIssue' && answerBy !== null) {
      return { dueAt: answerBy, windowHours: null, lead: t('marketplace.deals.shipping.dock.answerClock') };
    }
    return null;
  })();

  const body = (() => {
    switch (dock) {
      case 'brandShip':
        return (
          <CustomButton
            title={t('marketplace.deals.shipping.dock.ship')}
            size="md"
            fullWidth
            leftIcon={<Truck />}
            // Without the creator's address the server answers 409 `deal_address_missing`; inside the
            // creator's brief window (linked deal) it answers 422 `campaign_brief_window_open`.
            disabled={view.address === null || view.shipOpensAt !== null}
            onPress={shipping.opens.ship}
          />
        );
      case 'brandAnswerIssue':
        return (
          <>
            <Box row gap="sm">
              {view.reshipsLeft > 0 ? (
                <CustomButton
                  title={t('marketplace.deals.shipping.dock.reship')}
                  size="md"
                  leftIcon={<RotateCcw />}
                  style={styles.grow}
                  onPress={shipping.opens.reship}
                />
              ) : null}
              <CustomButton
                title={t('marketplace.deals.shipping.dock.cancel')}
                variant="outline"
                size="md"
                leftIcon={<CircleX />}
                style={styles.grow}
                onPress={shipping.opens.cancel}
              />
            </Box>
            <Text variant="caption" color={colors.text.tertiary} align="center" numberOfLines={2}>
              {t('marketplace.deals.shipping.dock.answerNote', { name })}
            </Text>
          </>
        );
      case 'creatorReceive':
        return (
          <>
            <DealHoldToSign
              label={t('marketplace.deals.shipping.dock.receive')}
              caption={t('marketplace.deals.shipping.dock.receiveCaption')}
              hint={t('marketplace.deals.respond.hold.hint')}
              accessibilityLabel={t('marketplace.deals.shipping.dock.receive')}
              accessibilityHint={t('marketplace.deals.shipping.holdA11y')}
              icon={CircleCheck}
              onComplete={shipping.onReceive}
            />
            <Pressable
              row
              align="center"
              justify="center"
              gap="xs"
              height={sizes.button.md}
              onPress={shipping.opens.issue}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.deals.shipping.dock.problem')}
            >
              <TriangleAlert size={sizes.icon.xs} color={colors.status.danger.main} />
              <Text variant="buttonSmall" color={colors.status.danger.text}>
                {t('marketplace.deals.shipping.dock.problem')}
              </Text>
            </Pressable>
          </>
        );
      case 'creatorFreeCancel':
        return (
          <DealHoldToSign
            label={t('marketplace.deals.shipping.dock.freeCancel')}
            caption={t('marketplace.deals.shipping.dock.freeCancelCaption', { name })}
            hint={t('marketplace.deals.respond.hold.hint')}
            accessibilityLabel={t('marketplace.deals.shipping.dock.freeCancel')}
            accessibilityHint={t('marketplace.deals.shipping.holdA11y')}
            tone="danger"
            icon={CircleX}
            onComplete={shipping.onCancel}
          />
        );
      case 'creatorAddress':
        return (
          <CustomButton
            title={t('marketplace.deals.shipping.address.add')}
            size="md"
            fullWidth
            leftIcon={<MapPin />}
            onPress={shipping.opens.address}
          />
        );
      default: {
        const _exhaustive: never = dock;
        return _exhaustive;
      }
    }
  })();

  return <DealDecisionDock clock={clock}>{body}</DealDecisionDock>;
};

export const DealShippingDock = memo(DealShippingDockComponent);
