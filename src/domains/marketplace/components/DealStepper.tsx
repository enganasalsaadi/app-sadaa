import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Vibration,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import {
  moderateScale,
  useStyles,
  useTheme,
  type ThemeColors,
} from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DEAL_STATION_LABEL } from '../constants/dealCopy';
import type {
  DealJourneyStage,
  DealJourneyStageKey,
  DealJourneyStatus,
} from '../utils/dealJourney';
import type { DealStationState } from '../utils/dealStation';

const NODE = moderateScale(20);
const HALO = moderateScale(4);
/** Every node sits in the same box (halo included), so the line runs through their centres. */
const NODE_BOX = NODE + HALO * 2;
const NODE_RING = 3;
const NODE_CORE = moderateScale(6);
const LINE = 2;
const TIP_WIDTH = moderateScale(236);
const TIP_ARROW = moderateScale(7);
const TIP_GAP = moderateScale(10);
/** A shown bubble goes away on its own after this long. */
const TIP_MS = 4000;
const PRESSED_SCALE = 1.25;
const LABEL_MIN_SCALE = 0.8;

export interface DealStepperProps {
  stages: DealJourneyStage[];
  state: DealStationState;
  /** The current station waits on a problem or on money (amber). */
  warn?: boolean;
  /** Body of the bubble for a picked station (rendered only while shown). */
  renderTip: (key: DealJourneyStageKey) => React.ReactNode;
}

type NodeLook =
  | 'done'
  | 'now'
  | 'warn'
  | 'danger'
  | 'stopped'
  | 'next'
  | 'later';

const lookOf = (
  status: DealJourneyStatus,
  state: DealStationState,
  warn: boolean,
): NodeLook => {
  if (state === 'done') return 'done';
  if (status === 'done') return 'done';
  if (status === 'now') {
    if (state === 'disputed') return 'danger';
    if (state === 'stopped') return 'stopped';
    return warn ? 'warn' : 'now';
  }
  if (state !== 'open') return 'later';
  return status === 'next' ? 'next' : 'later';
};

const nodeColors = (colors: ThemeColors, look: NodeLook) => {
  switch (look) {
    case 'done':
      return {
        ring: colors.interactive.main,
        fill: colors.interactive.main,
        halo: null,
        label: colors.text.secondary,
      };
    case 'now':
      return {
        ring: colors.interactive.main,
        fill: colors.surface.main,
        halo: colors.interactive.soft,
        label: colors.interactive.text,
      };
    case 'warn':
      return {
        ring: colors.status.warning.main,
        fill: colors.surface.main,
        halo: colors.status.warning.soft,
        label: colors.status.warning.text,
      };
    case 'danger':
      return {
        ring: colors.status.danger.main,
        fill: colors.surface.main,
        halo: colors.status.danger.soft,
        label: colors.status.danger.text,
      };
    case 'stopped':
      return {
        ring: colors.status.neutral.main,
        fill: colors.status.neutral.soft,
        halo: null,
        label: colors.text.secondary,
      };
    case 'next':
      return {
        ring: colors.interactive.main,
        fill: colors.surface.main,
        halo: null,
        label: colors.text.secondary,
      };
    case 'later':
      return {
        ring: colors.border.default,
        fill: colors.surface.main,
        halo: null,
        label: colors.text.tertiary,
      };
    default: {
      const _exhaustive: never = look;
      return _exhaustive;
    }
  }
};

interface NodeProps {
  look: NodeLook;
  label: string;
  pressed: boolean;
  width: number;
}

const StepNode = memo<NodeProps>(({ look, label, pressed, width }) => {
  const { colors, sizes } = useTheme();
  const tone = nodeColors(colors, look);
  const strong = look === 'now' || look === 'warn' || look === 'danger';
  const styles = useStyles(
    ({
      radii,
      borderWidths,
      spacing,
    }): Record<'slot' | 'halo' | 'node' | 'core', ViewStyle> => ({
      slot: { width, alignItems: 'center', gap: spacing.xs },
      halo: {
        width: NODE_BOX,
        height: NODE_BOX,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed
          ? colors.brand.soft
          : tone.halo ?? colors.layout.transparent,
      },
      node: {
        width: NODE,
        height: NODE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone.fill,
        borderWidth: strong ? NODE_RING : borderWidths.md,
        borderStyle: look === 'next' ? 'dashed' : 'solid',
        borderColor: pressed ? colors.brand.text : tone.ring,
        transform: [{ scale: pressed ? PRESSED_SCALE : 1 }],
      },
      core: {
        width: NODE_CORE,
        height: NODE_CORE,
        borderRadius: radii.full,
        backgroundColor: tone.ring,
      },
    }),
    [
      colors.brand.soft,
      colors.brand.text,
      colors.layout.transparent,
      look,
      pressed,
      strong,
      tone.fill,
      tone.halo,
      tone.ring,
      width,
    ],
  );

  return (
    <Box style={styles.slot}>
      <Box style={styles.halo}>
        <Box style={styles.node}>
          {look === 'done' ? (
            <Check
              size={sizes.icon.xs * 0.75}
              color={colors.text.onAccent}
              strokeWidth={3}
            />
          ) : look === 'stopped' ? (
            <X
              size={sizes.icon.xs * 0.75}
              color={colors.status.neutral.text}
              strokeWidth={3}
            />
          ) : strong ? (
            <Box style={styles.core} />
          ) : null}
        </Box>
      </Box>
      <Text
        variant="caption"
        color={pressed ? colors.text.primary : tone.label}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={LABEL_MIN_SCALE}
      >
        {label}
      </Text>
    </Box>
  );
});

/**
 * Every station of the deal by name: done ones ticked, the current one ringed, the next one
 * dashed. Tap a station or slide a finger across them and a bubble explains it (light haptic
 * per station); it hides by itself. The whole row is the gesture area, so narrow stations still
 * get a full-size target.
 */
const DealStepperComponent: React.FC<DealStepperProps> = ({
  stages,
  state,
  warn = false,
  renderTip,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const pickedRef = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = stages.length;
  const slot = count > 0 ? width / count : 0;
  const nowIndex = Math.max(
    0,
    stages.findIndex(stage => stage.status === 'now'),
  );
  const fillShare =
    state === 'done' ? 1 : count > 1 ? nowIndex / (count - 1) : 0;

  const clearHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);
  useEffect(() => clearHide, [clearHide]);

  const show = useCallback(
    (index: number | null) => {
      if (pickedRef.current === index) return;
      pickedRef.current = index;
      setPicked(index);
      clearHide();
      if (index === null) return;
      Vibration.vibrate(HAPTIC_TAP_MS);
      hideTimer.current = setTimeout(() => {
        pickedRef.current = null;
        setPicked(null);
      }, TIP_MS);
    },
    [clearHide],
  );

  const indexAt = useCallback(
    (x: number) => {
      if (slot <= 0) return 0;
      const fromStart = isRTL ? width - x : x;
      return Math.min(count - 1, Math.max(0, Math.floor(fromStart / slot)));
    },
    [count, isRTL, slot, width],
  );

  const gesture = useMemo(() => {
    const scrub = Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onStart(event => show(indexAt(event.x)))
      .onUpdate(event => show(indexAt(event.x)));
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(event => {
        const index = indexAt(event.x);
        show(pickedRef.current === index ? null : index);
      });
    return Gesture.Race(scrub, tap);
  }, [indexAt, show]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    [],
  );

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const current = pickedRef.current ?? nowIndex;
      if (event.nativeEvent.actionName === 'increment')
        show(Math.min(count - 1, current + 1));
      if (event.nativeEvent.actionName === 'decrement')
        show(Math.max(0, current - 1));
    },
    [count, nowIndex, show],
  );

  const tipStart =
    picked === null
      ? 0
      : Math.min(
          Math.max(0, slot * (picked + 0.5) - TIP_WIDTH / 2),
          Math.max(0, width - TIP_WIDTH),
        );
  const arrowStart =
    picked === null ? 0 : slot * (picked + 0.5) - tipStart - TIP_ARROW;

  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
    }): Record<'row' | 'track' | 'fill' | 'tip' | 'arrow', ViewStyle> => ({
      row: { flexDirection: 'row' },
      track: {
        position: 'absolute',
        top: NODE_BOX / 2 - LINE / 2,
        start: slot / 2,
        end: slot / 2,
        height: LINE,
        borderRadius: radii.full,
        backgroundColor: colors.border.default,
      },
      fill: {
        position: 'absolute',
        top: NODE_BOX / 2 - LINE / 2,
        start: slot / 2,
        width: Math.max(0, (width - slot) * fillShare),
        height: LINE,
        borderRadius: radii.full,
        backgroundColor:
          state === 'stopped'
            ? colors.status.neutral.main
            : colors.interactive.main,
      },
      tip: {
        position: 'absolute',
        bottom: NODE_BOX + TIP_GAP,
        start: tipStart,
        width: Math.min(TIP_WIDTH, width),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.lg,
        backgroundColor: colors.brand.main,
        ...shadows.lg,
      },
      arrow: {
        position: 'absolute',
        top: '100%',
        start: arrowStart,
        width: 0,
        height: 0,
        borderStartWidth: TIP_ARROW,
        borderEndWidth: TIP_ARROW,
        borderTopWidth: TIP_ARROW,
        borderStartColor: colors.layout.transparent,
        borderEndColor: colors.layout.transparent,
        borderTopColor: colors.brand.main,
      },
    }),
    [arrowStart, colors, fillShare, slot, state, tipStart, width],
  );

  const pickedStage = picked === null ? null : stages[picked] ?? null;

  return (
    <Box zIndex="dropdown">
      <GestureDetector gesture={gesture}>
        <Box
          onLayout={onLayout}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('marketplace.deals.stepper')}
          accessibilityValue={{
            text: pickedStage
              ? t(DEAL_STATION_LABEL[pickedStage.key])
              : undefined,
          }}
          accessibilityActions={ACCESSIBILITY_ACTIONS}
          onAccessibilityAction={onAccessibilityAction}
        >
          <Box style={styles.track} />
          <Box style={styles.fill} />
          <Box style={styles.row}>
            {width > 0
              ? stages.map((stage, index) => (
                  <StepNode
                    key={stage.key}
                    look={lookOf(stage.status, state, warn)}
                    label={t(DEAL_STATION_LABEL[stage.key])}
                    pressed={index === picked}
                    width={slot}
                  />
                ))
              : null}
          </Box>
        </Box>
      </GestureDetector>
      {pickedStage ? (
        <Animated.View
          key={pickedStage.key}
          style={styles.tip}
          entering={reduceMotion ? undefined : ZoomIn.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(120)}
          pointerEvents="none"
        >
          <Animated.View entering={reduceMotion ? undefined : FadeIn}>
            {renderTip(pickedStage.key)}
          </Animated.View>
          <Box style={styles.arrow} />
        </Animated.View>
      ) : null}
    </Box>
  );
};

const ACCESSIBILITY_ACTIONS = [
  { name: 'increment' },
  { name: 'decrement' },
] as const;

export const DealStepper = memo(DealStepperComponent);

/** The bubble's body: the station's name and what happens there. */
export const DealStepTipBody = memo<{ title: string; body: string }>(
  ({ title, body }) => {
    const { colors } = useTheme();
    return (
      <Box gap="xs">
        <Text variant="buttonSmall" color={colors.text.onBrand}>
          {title}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted}>
          {body}
        </Text>
      </Box>
    );
  },
);
