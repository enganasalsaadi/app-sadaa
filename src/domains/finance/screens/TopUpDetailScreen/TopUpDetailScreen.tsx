import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomButton,
  Divider,
  ErrorState,
  GalleryModal,
  InlineError,
  KeyValueRow,
  Layout,
  LayoutFooter,
  MoneyText,
  Notice,
  Pressable,
  Skeleton,
  StatusPill,
  Text,
  Timeline,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { ReportLink } from '../../components/ReportLink';
import { useTopUpDetailScreen, type TopUpDetailScreenModel } from './hooks/useTopUpDetailScreen';

const ICON_CIRCLE = moderateScale(56);
const SKELETON_TITLE_WIDTH = moderateScale(160);
const SKELETON_AMOUNT_WIDTH = moderateScale(140);
const SKELETON_AMOUNT_HEIGHT = moderateScale(36);
const SKELETON_CARD_HEIGHT = moderateScale(148);

type DetailView = NonNullable<TopUpDetailScreenModel['view']>;

const DetailHead = memo<{ view: DetailView }>(({ view }) => {
  const { colors, sizes } = useTheme();
  const Icon = view.look?.icon;
  const bg = view.completed ? colors.money.soft : view.lost ? colors.surface.elevated : colors.status.warning.soft;
  const iconColor = view.completed ? colors.money.main : view.lost ? colors.icon.secondary : colors.status.warning.main;

  return (
    <Box align="center" gap="sm" pt="md">
      {Icon ? (
        <Box width={ICON_CIRCLE} height={ICON_CIRCLE} borderRadius="full" bg={bg} align="center" justify="center">
          <Icon size={sizes.icon.md} color={iconColor} />
        </Box>
      ) : null}
      <Text variant="bodySmall" color={colors.text.secondary} align="center">
        {view.title}
      </Text>
      {view.credit ? (
        <MoneyText
          value={view.credit}
          size="lg"
          tone={view.completed ? 'money' : view.lost ? 'muted' : 'default'}
          showSign={view.completed}
          estimate={view.estimate}
          strikethrough={view.lost}
        />
      ) : null}
      {view.against ? (
        <Text variant="caption" color={colors.text.tertiary}>
          {view.against}
        </Text>
      ) : null}
      {view.statusLabel ? (
        <StatusPill label={view.statusLabel} tone={view.look?.tone ?? 'neutral'} icon={view.look?.icon} size="md" />
      ) : null}
    </Box>
  );
});

const LinkValue = memo<{ label: string; onPress: () => void; icon?: boolean }>(({ label, onPress, icon }) => {
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      row
      align="center"
      gap="xs"
      minHeight={sizes.button.sm}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text variant="bodyMedium" color={icon ? colors.text.primary : colors.interactive.text} selectable={icon}>
        {label}
      </Text>
      {icon ? <Copy size={sizes.icon.xs} color={colors.interactive.main} /> : null}
    </Pressable>
  );
});

const DetailSkeleton = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="2xl" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box align="center" gap="sm" pt="md">
        <Skeleton width={ICON_CIRCLE} height={ICON_CIRCLE} borderRadius="full" />
        <Skeleton width={SKELETON_TITLE_WIDTH} height={sizes.icon.sm} borderRadius="xs" />
        <Skeleton width={SKELETON_AMOUNT_WIDTH} height={SKELETON_AMOUNT_HEIGHT} borderRadius="xs" />
      </Box>
      <Skeleton width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
      <Skeleton width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
    </Box>
  );
});

/** Rejected / reversed: try again (secondary) + report; completed: open its ledger line. */
const RecordFooter = memo<{ vm: TopUpDetailScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  const { view } = vm;
  return (
    <Box px="xl" py="md" gap="sm">
      {view?.canRetry ? (
        <CustomButton title={t('finance.topUp.detail.newTopUp')} variant="secondary" onPress={vm.newTopUp} />
      ) : null}
      {view?.transactionReference ? (
        <CustomButton title={t('finance.topUp.detail.openTransaction')} variant="secondary" onPress={vm.openTransaction} />
      ) : null}
      <ReportLink onPress={vm.onReport} />
    </Box>
  );
});

/**
 * Top-up request (Money archetype, receipt): head, review timeline, reason, details.
 * Right after submitting it confirms the request: ✕, "Back to wallet" primary, history link.
 */
const TopUpDetailScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useTopUpDetailScreen();
  useHideBottomBar();
  const { view } = vm;

  const body = (() => {
    switch (vm.status) {
      case 'loading':
        return <DetailSkeleton />;
      case 'notFound':
        return <InlineError error={t('finance.topUp.detail.notFound')} />;
      case 'error':
        return <ErrorState onRetry={vm.retry} />;
      case 'ready':
        return view ? (
          <Box gap="2xl">
            <DetailHead view={view} />
            {view.reason ? <Notice tone={view.reason.tone} title={view.reason.title} message={view.reason.message} /> : null}
            <Card px="lg" py="lg">
              <Timeline steps={view.steps} />
            </Card>
            <Box gap="sm">
              <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
                {t('finance.topUp.detail.details')}
              </Text>
              <Card px="lg" py="sm">
                {view.details.map((row, index) => (
                  <Box key={row.key}>
                    {index > 0 ? <Divider /> : null}
                    <Box py="xs">
                      <KeyValueRow label={row.label} value={row.value} />
                    </Box>
                  </Box>
                ))}
                {view.receipt ? (
                  <>
                    <Divider />
                    <Box py="xs">
                      <KeyValueRow
                        label={t('finance.topUp.detail.receipt')}
                        value={<LinkValue label={t('finance.topUp.detail.viewReceipt')} onPress={vm.openReceipt} />}
                      />
                    </Box>
                  </>
                ) : null}
                <Divider />
                <Box py="xs">
                  <KeyValueRow
                    label={t('finance.topUp.detail.requestId')}
                    value={<LinkValue label={vm.id} onPress={vm.onCopyId} icon />}
                  />
                </Box>
              </Card>
            </Box>
          </Box>
        ) : null;
      default: {
        const _exhaustive: never = vm.status;
        return _exhaustive;
      }
    }
  })();

  const footer = vm.submitted ? (
    <LayoutFooter
      primary={{ label: t('finance.topUp.detail.backToWallet'), onPress: vm.backToWallet }}
      secondary={{ label: t('finance.topUp.detail.history'), onPress: vm.openHistory, variant: 'ghost' }}
    />
  ) : vm.status === 'ready' || vm.status === 'notFound' ? (
    <RecordFooter vm={vm} />
  ) : undefined;

  return (
    <Layout
      header={{
        title: t('finance.topUp.detail.title'),
        backIcon: vm.submitted ? 'close' : 'back',
        onBackPress: vm.submitted ? vm.backToWallet : undefined,
      }}
      footer={footer}
    >
      {body}
      <GalleryModal images={vm.galleryImages} visible={vm.galleryVisible} onClose={vm.closeGallery} />
    </Layout>
  );
};

export const TopUpDetailScreen = memo(TopUpDetailScreenComponent);
