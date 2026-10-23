import React, { memo } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { Check, Download, ExternalLink, RotateCcw, Share2 } from 'lucide-react-native';
import type { SaveDestination } from '@/core/download';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { ProgressRing } from '../ProgressRing';
import { ViewerBanner } from './ViewerBanner';
import type { ViewerSave } from './useViewerSave';

export interface ViewerDockAction {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  /** Shown instead of the icon («1.5×» on the speed button). */
  text?: string;
  /** The panel it opens is showing. */
  active?: boolean;
}

export interface ViewerDockProps {
  save: ViewerSave;
  /** Image: fullscreen · PDF: pages · video: speed. */
  third: ViewerDockAction | null;
}

const SAVE_LABEL = {
  photos: 'files.viewer.save.photos',
  downloads: 'files.viewer.save.downloads',
  files: 'files.viewer.save.files',
  sheet: 'files.viewer.save.sheet',
} as const satisfies Record<SaveDestination, string>;

interface SideButtonProps {
  action: ViewerDockAction;
}

const SideButton = memo<SideButtonProps>(({ action }) => {
  const { colors, sizes } = useTheme();
  const Icon = action.icon;
  return (
    <Pressable
      onPress={action.onPress}
      scaleOnPress
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      borderRadius="full"
      bg={action.active ? colors.viewer.accent : colors.viewer.glass}
      align="center"
      justify="center"
      accessibilityRole="button"
      accessibilityLabel={action.label}
      accessibilityState={{ selected: action.active ?? false }}
    >
      {action.text ? (
        <Text variant="amountSmall" color={action.active ? colors.viewer.onAccent : colors.viewer.text}>
          {action.text}
        </Text>
      ) : (
        <Icon
          size={sizes.icon.sm}
          color={action.active ? colors.viewer.onAccent : colors.viewer.text}
          strokeWidth={iconStroke.regular}
        />
      )}
    </Pressable>
  );
});
SideButton.displayName = 'SideButton';

/**
 * The glass dock: share (or «open with» on Android), the main save button, and one action that
 * fits the file. Save morphs: download → progress ring → saved check; a failure offers retry.
 */
const ViewerDockComponent: React.FC<ViewerDockProps> = ({ save, third }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { entry, destination } = save;
  const status = entry?.status;
  const busy = status === 'queued' || status === 'downloading' || status === 'saving';
  const saved = status === 'saved';
  const failed = status === 'failed' && entry?.failure !== 'canceled';

  const label = busy
    ? t('files.viewer.saving', { percent: Math.round((entry?.progress ?? 0) * 100) })
    : saved
      ? entry?.target === 'shared'
        ? t('files.viewer.sharedAgain')
        : t('files.viewer.saved')
      : failed
        ? t('files.viewer.retry')
        : t(SAVE_LABEL[destination]);

  const tint = saved ? colors.viewer.saved : colors.viewer.onAccent;
  const SaveIcon = saved ? Check : failed ? RotateCcw : Download;

  const share: ViewerDockAction = {
    icon: Platform.OS === 'ios' ? Share2 : ExternalLink,
    label: Platform.OS === 'ios' ? t('files.viewer.share') : t('files.viewer.openIn'),
    onPress: save.share,
  };

  return (
    <Box gap="md" px="lg" align="center">
      {save.banner ? <ViewerBanner banner={save.banner} /> : null}
      <Box
        row
        align="center"
        gap="sm"
        p="xs"
        alignSelf="stretch"
        borderRadius="full"
        bg={colors.viewer.dock}
        borderWidth="thin"
        borderColor={colors.viewer.glassBorder}
      >
        {save.sharing ? (
          <Box width={sizes.iconButton.md} height={sizes.iconButton.md} align="center" justify="center">
            <ActivityIndicator color={colors.viewer.text} />
          </Box>
        ) : (
          <SideButton action={share} />
        )}
        <Pressable
          onPress={save.save}
          scaleOnPress
          flex={1}
          row
          align="center"
          justify="center"
          gap="sm"
          height={sizes.viewer.save}
          borderRadius="full"
          bg={saved ? colors.viewer.glass : colors.viewer.accent}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ busy }}
        >
          {busy ? (
            <ProgressRing
              progress={entry?.progress ?? 0}
              size={sizes.viewer.saveRing}
              stroke={sizes.dot.sm / 2}
              color={colors.viewer.onAccent}
              track={colors.viewer.ringTrack}
            />
          ) : (
            <SaveIcon size={sizes.icon.sm} color={tint} strokeWidth={iconStroke.bold} />
          )}
          <Text variant="buttonSmall" color={saved ? colors.viewer.text : colors.viewer.onAccent} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
        {third ? <SideButton action={third} /> : <Box width={sizes.iconButton.md} />}
      </Box>
    </Box>
  );
};

export const ViewerDock = memo(ViewerDockComponent);
