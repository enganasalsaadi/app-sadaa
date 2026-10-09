import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Eye, Heart, ReceiptText, Search, Share2 } from 'lucide-react-native';
import { Avatar, Banner, Box, ScreenHeader, SectionHeader, Text } from '@/shared/ui';
import type { ScreenHeaderAction } from '@/shared/ui';
import { useStyles, useTheme } from '@/core/theme';
import { MOCK_IMAGE_URIS } from './mockData';

const noop = () => {};
const UNREAD_COUNT = 3;

/** Headers in place, without the status-bar inset. Scroll behaviours live in the layout gallery. */
const ScreenHeaderDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({
    overImage: { position: 'absolute' as const, top: 0, start: 0, end: 0 },
  }));

  const inboxActions: readonly [ScreenHeaderAction, ScreenHeaderAction] = [
    { icon: Search, accessibilityLabel: t('common.search'), onPress: noop },
    {
      icon: Bell,
      accessibilityLabel: t('devShowcase.iconButton.notifications'),
      onPress: noop,
      badge: UNREAD_COUNT,
    },
  ];
  const mediaActions: readonly [ScreenHeaderAction, ScreenHeaderAction] = [
    { icon: Share2, accessibilityLabel: t('common.share'), onPress: noop },
    { icon: Heart, accessibilityLabel: t('devShowcase.screenHeader.favorite'), onPress: noop },
  ];
  const glassActions: readonly [ScreenHeaderAction, ScreenHeaderAction] = [
    { icon: Eye, accessibilityLabel: t('devShowcase.screenHeader.hideAmounts'), onPress: noop, glass: true },
    { icon: ReceiptText, accessibilityLabel: t('devShowcase.screenHeader.statement'), onPress: noop, glass: true },
  ];
  const frame = { borderRadius: 'lg', overflow: 'hidden', borderWidth: 'thin', borderColor: colors.border.default } as const;

  return (
    <Box gap="lg">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.solidLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            subtitle={t('devShowcase.screenHeader.subtitle')}
            onBackPress={noop}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.actionsLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            onBackPress={noop}
            actions={inboxActions}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.noBackLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            showBackButton={false}
            actions={[inboxActions[1]]}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.closeLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            backIcon="close"
            onBackPress={noop}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.brandLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            subtitle={t('devShowcase.screenHeader.subtitle')}
            variant="brand"
            onBackPress={noop}
            actions={inboxActions}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.leadingLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            variant="brand"
            showBackButton={false}
            actions={[inboxActions[1]]}
            withSafeArea={false}
            leading={
              <Box row align="center" gap="sm">
                <Avatar uri={MOCK_IMAGE_URIS[0]} size={sizes.avatar.sm} />
                <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
                  {t('devShowcase.screenHeader.title')}
                </Text>
              </Box>
            }
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.glassLabel')} />
        <Box {...frame}>
          <ScreenHeader
            title={t('devShowcase.screenHeader.title')}
            variant="brand"
            showBackButton={false}
            actions={glassActions}
            withSafeArea={false}
          />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.screenHeader.transparentLabel')} />
        <Box {...frame}>
          <Banner uri={MOCK_IMAGE_URIS[1]} />
          <Box style={styles.overImage}>
            <ScreenHeader
              title={t('devShowcase.screenHeader.title')}
              variant="transparent"
              onBackPress={noop}
              actions={mediaActions}
              withSafeArea={false}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const ScreenHeaderDemo = memo(ScreenHeaderDemoComponent);
