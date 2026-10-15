import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Radio } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { Box, ErrorState, Layout, Skeleton, StaggerIn, Text } from '@/shared/ui';
import { LiveRoomHero } from './components/LiveRoomHero';
import { ProofReel } from './components/ProofReel';
import { PublicationFixSheet } from './components/PublicationFixSheet';
import { PublicationHistory } from './components/PublicationHistory';
import { VerifyDock } from './components/VerifyDock';
import { VerifyFuseCard } from './components/VerifyFuseCard';
import { useDealPublicationReviewScreen } from './hooks/useDealPublicationReviewScreen';

const SKELETON = { card: moderateScale(220), shot: moderateScale(280) };

const ReviewSkeleton = memo(() => (
  <Box px="xl" pt="lg" gap="md">
    <Skeleton width="100%" height={SKELETON.card} borderRadius="xl" />
    <Box row gap="md">
      <Skeleton width="45%" height={SKELETON.shot} borderRadius="lg" />
      <Skeleton width="45%" height={SKELETON.shot} borderRadius="lg" />
    </Box>
  </Box>
));

/** Where the post stands when there is nothing to decide: verified, or waiting on the creator. */
const StatusBanner = memo<{ text: string; verified: boolean }>(({ text, verified }) => {
  const { colors, sizes } = useTheme();
  const tone = verified ? colors.status.success : colors.status.info;
  const styles = useStyles(
    ({ radii, spacing }): Record<'banner' | 'text', ViewStyle> => ({
      banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: tone.soft,
      },
      text: { flex: 1 },
    }),
    [tone.soft],
  );
  const Icon = verified ? BadgeCheck : Radio;
  return (
    <Box style={styles.banner} accessible accessibilityRole="text">
      <Icon size={sizes.icon.md} color={tone.main} />
      <Text variant="bodyMedium" color={tone.text} style={styles.text}>
        {text}
      </Text>
    </Box>
  );
});

/**
 * Brand checks a deliverable's live post (P7.2, approved «غرفة البث»): the post on a glass card in
 * the live hero (open it, account matched or not), the screenshots to zoom into, the auto-verify
 * fuse and the record of submissions; press and hold to confirm, or ask for a fix.
 */
const DealPublicationReviewScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const vm = useDealPublicationReviewScreen();
  const { deal, item, fixes } = vm;

  if (vm.isLoading) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ReviewSkeleton />
      </Layout>
    );
  }
  if (!deal || !item || !fixes) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.publish.brand.loadFailed')} />
      </Layout>
    );
  }

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBackdrop="brandGlow"
        header={{ title: item.title, subtitle: deal.creator.name ?? '', variant: 'brand' }}
        footerBehavior="docked"
        footer={
          vm.verifying ? (
            <VerifyDock
              itemTitle={item.title}
              release={vm.release}
              fixesLeft={fixes.remaining}
              verifying={vm.isVerifying}
              onVerify={vm.onVerify}
              onFix={vm.openFix}
            />
          ) : undefined
        }
        hero={
          <LiveRoomHero
            position={vm.position}
            itemTitle={item.title}
            creator={deal.creator}
            post={vm.post}
            waiting={vm.waiting}
            onOpen={vm.onOpen}
          />
        }
      >
        <Box px="xl" pt="2xl" pb="2xl">
          <StaggerIn gap="xl">
            {vm.banner ? <StatusBanner text={vm.banner} verified={item.status.key === 'verified'} /> : null}
            {vm.latest ? <ProofReel proofs={vm.latest.proofs} /> : null}
            {vm.fuse ? <VerifyFuseCard time={vm.fuse.time} share={vm.fuse.share} /> : null}
            <PublicationHistory publications={vm.publications} waiting={vm.verifying} />
          </StaggerIn>
        </Box>
      </Layout>
      <PublicationFixSheet
        visible={vm.fixOpen}
        onClose={vm.closeFix}
        fixes={fixes}
        control={vm.fixControl}
        onChip={vm.onChip}
        submitting={vm.isFixing}
        onSubmit={vm.onFix}
      />
    </>
  );
};

export const DealPublicationReviewScreen = memo(DealPublicationReviewScreenComponent);
