import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Share2 } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  Divider,
  ErrorState,
  InlineError,
  KeyValueRow,
  Layout,
  MoneyText,
  Pressable,
  Skeleton,
  StatusPill,
  Text,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { ReportLink } from '../../components/ReportLink';
import { LINE_KIND_ICON, lineBadgeColors } from '../../constants/walletLineLook';
import {
  useTransactionReceiptScreen,
  type ReceiptRow,
  type TransactionReceiptModel,
} from './hooks/useTransactionReceiptScreen';

const ICON_CIRCLE = moderateScale(56);
const SKELETON_TITLE_WIDTH = moderateScale(160);
const SKELETON_AMOUNT_WIDTH = moderateScale(140);
const SKELETON_AMOUNT_HEIGHT = moderateScale(36);
const SKELETON_CARD_HEIGHT = moderateScale(148);

type ReceiptView = NonNullable<TransactionReceiptModel['view']>;

const ReceiptHead = memo<{ view: ReceiptView }>(({ view }) => {
  const { colors, sizes } = useTheme();
  const Icon = LINE_KIND_ICON[view.kind];
  const badge = lineBadgeColors(view.kind, colors);

  return (
    <Box align="center" gap="sm" pt="md">
      <Box
        width={ICON_CIRCLE}
        height={ICON_CIRCLE}
        borderRadius="full"
        bg={badge.bg}
        align="center"
        justify="center"
      >
        <Icon size={sizes.icon.md} color={badge.icon} />
      </Box>
      <Text variant="bodySmall" color={colors.text.secondary} align="center">
        {view.title}
      </Text>
      <MoneyText
        value={view.amount}
        size="lg"
        tone={view.signed && view.credit ? 'money' : 'default'}
        showSign={view.signed}
      />
      {view.statusLabel ? (
        <StatusPill
          label={view.statusLabel}
          tone={view.pill?.tone ?? 'neutral'}
          icon={view.pill?.icon}
          size="md"
        />
      ) : null}
    </Box>
  );
});

const ReceiptSection = memo<{ title: string; children: React.ReactNode }>(({ title, children }) => {
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
        {title}
      </Text>
      <Card px="lg" py="sm">
        {children}
      </Card>
    </Box>
  );
});

const Rows = memo<{ rows: readonly ReceiptRow[] }>(({ rows }) => (
  <>
    {rows.map((row, index) => (
      <Box key={row.key}>
        {index > 0 ? <Divider /> : null}
        <Box py="xs">
          <KeyValueRow label={row.label} value={row.value} />
        </Box>
      </Box>
    ))}
  </>
));

const ReferenceValue = memo<{ reference: string; onCopy: () => void }>(({ reference, onCopy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onCopy}
      row
      align="center"
      gap="xs"
      minHeight={sizes.button.sm}
      accessibilityRole="button"
      accessibilityLabel={t('finance.receipt.copyReference', { reference })}
    >
      <Text variant="bodyMedium" selectable>
        {reference}
      </Text>
      <Copy size={sizes.icon.xs} color={colors.interactive.main} />
    </Pressable>
  );
});

const ReceiptSkeleton = memo(() => {
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

/**
 * Transaction receipt (Money archetype, rule 09 §2.1): centred amount block, a Details
 * card (type, other party, date, copyable reference) and an Amount card (paid currency,
 * rate, balance after). Read-only, so no primary: share in the header, report as a link.
 */
const TransactionReceiptScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useTransactionReceiptScreen();
  useHideBottomBar();
  const { view } = vm;

  const body = (() => {
    switch (vm.status) {
      case 'loading':
        return <ReceiptSkeleton />;
      case 'notFound':
        return <InlineError error={t('finance.receipt.notFound')} />;
      case 'error':
        return <ErrorState onRetry={vm.retry} />;
      case 'ready':
        return view ? (
          <Box gap="2xl">
            <ReceiptHead view={view} />
            <ReceiptSection title={t('finance.receipt.details')}>
              <Rows rows={view.details} />
              {view.details.length > 0 ? <Divider /> : null}
              <Box py="xs">
                <KeyValueRow
                  label={t('finance.receipt.reference')}
                  value={<ReferenceValue reference={vm.reference} onCopy={vm.onCopyReference} />}
                />
              </Box>
            </ReceiptSection>
            <ReceiptSection title={t('finance.receipt.amountSection')}>
              <Box py="xs">
                <KeyValueRow
                  label={t('finance.receipt.amount')}
                  value={<MoneyText value={view.amount} showSign={view.signed} />}
                />
              </Box>
              {view.amounts.length > 0 ? <Divider /> : null}
              <Rows rows={view.amounts} />
              {view.balanceAfter ? (
                <>
                  <Divider />
                  <Box py="xs">
                    <KeyValueRow
                      label={t('finance.receipt.balanceAfter')}
                      emphasis="strong"
                      value={<MoneyText value={view.balanceAfter} size="title" tone="money" />}
                    />
                  </Box>
                </>
              ) : null}
            </ReceiptSection>
          </Box>
        ) : null;
      default: {
        const _exhaustive: never = vm.status;
        return _exhaustive;
      }
    }
  })();

  return (
    <Layout
      header={{
        title: vm.title,
        actions:
          vm.status === 'ready'
            ? [{ icon: Share2, accessibilityLabel: t('finance.receipt.share'), onPress: vm.onShare }]
            : undefined,
      }}
      // A missing line can still be reported, with its reference.
      footer={
        vm.status === 'ready' || vm.status === 'notFound' ? <ReportLink onPress={vm.onReport} /> : undefined
      }
    >
      {body}
    </Layout>
  );
};

export const TransactionReceiptScreen = memo(TransactionReceiptScreenComponent);
