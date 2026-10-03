import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import { HeroSheet, useHeroCompact } from '../HeroSheet';
import { BrandLogo } from '../BrandLogo';
import { StepProgress } from '../StepProgress';

export interface WizardHeaderConfig {
  /** 1-based. */
  step: number;
  title: string;
  subtitle?: string;
  /** Shows the back arrow when set. */
  onBack?: () => void;
}

interface WizardShellContextValue {
  setHeader: (config: WizardHeaderConfig) => void;
}

const WizardShellContext = createContext<WizardShellContextValue | null>(null);

/** Flow-level escape shown on every step (e.g. account deletion during registration). */
export interface WizardShellAction {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

export interface WizardShellProps {
  total: number;
  /** Glass icon button beside the step pill, on every step. */
  action?: WizardShellAction;
  /** Usually a stack navigator: its screens slide inside the sheet while the header stays put. */
  children: React.ReactNode;
}

const titleEntering = FadeIn.duration(motion.duration.base);

const styles = StyleSheet.create({
  compactTitle: { flex: 1 },
});

/**
 * Multi-step flow chrome on top of HeroSheet: step count, progress and title
 * in the navy header. The header is persistent, so progress animates between
 * steps and only the sheet content transitions. Screens describe their header
 * with `useWizardHeader`.
 *
 * Compact mode (keyboard open, or short screens): the title moves into the
 * back/step row and the subtitle drops, so the form keeps most of the height.
 */
const WizardShellComponent: React.FC<WizardShellProps> = ({ total, action, children }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const compact = useHeroCompact();
  const [header, setHeader] = useState<WizardHeaderConfig | null>(null);

  const contextValue = useMemo(() => ({ setHeader }), []);
  const step = header?.step ?? 1;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Keyed by title + mode so a step change or a compact switch fades the title in.
  const title = header ? (
    <Animated.View
      key={`${header.title}-${compact ? 'compact' : 'full'}`}
      entering={titleEntering}
      style={compact ? styles.compactTitle : undefined}
    >
      {compact ? (
        <Text
          variant="title"
          color={colors.text.onBrand}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {header.title}
        </Text>
      ) : (
        <Box gap="xs">
          <Text variant="h2" color={colors.text.onBrand} accessibilityRole="header">
            {header.title}
          </Text>
          {header.subtitle ? (
            <Text variant="body" color={colors.text.onBrandMuted}>
              {header.subtitle}
            </Text>
          ) : null}
        </Box>
      )}
    </Animated.View>
  ) : null;

  const heroHeader = (
    <Box px="xl" pb={compact ? 'md' : '2xl'} gap={compact ? 'sm' : 'lg'}>
      <Box row align="center" gap="md" height={sizes.button.md}>
        {header?.onBack ? (
          <Pressable
            onPress={header.onBack}
            width={sizes.button.md}
            height={sizes.button.md}
            align="center"
            justify="center"
            borderRadius="full"
            bg={colors.glass.badge}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <BackIcon size={sizes.icon.sm} color={colors.text.onBrand} />
          </Pressable>
        ) : (
          <BrandLogo variant="symbol" height={sizes.icon.lg} surface="brand" />
        )}

        {compact ? title : <Box flex={1} />}

        {action ? (
          <Pressable
            onPress={action.onPress}
            width={sizes.button.md}
            height={sizes.button.md}
            align="center"
            justify="center"
            borderRadius="full"
            bg={colors.glass.badge}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <action.icon size={sizes.icon.sm} color={colors.text.onBrand} />
          </Pressable>
        ) : null}

        <Box
          px="md"
          py="xs"
          borderRadius="full"
          bg={colors.glass.badge}
          borderWidth="thin"
          borderColor={colors.glass.border}
        >
          <Text variant="caption" color={colors.text.onBrand}>
            {t('common.stepOf', { current: step, total })}
          </Text>
        </Box>
      </Box>

      <StepProgress
        current={step}
        total={total}
        tone="onBrand"
        accessibilityLabel={t('common.stepOf', { current: step, total })}
      />

      {compact ? null : title}
    </Box>
  );

  return (
    <HeroSheet header={heroHeader}>
      <WizardShellContext.Provider value={contextValue}>
        {children}
      </WizardShellContext.Provider>
    </HeroSheet>
  );
};

export const WizardShell = memo(WizardShellComponent);

/**
 * Publishes the focused screen's header to the surrounding WizardShell.
 * Runs in a layout effect so the new title is in place before the first paint.
 */
export const useWizardHeader = ({ step, title, subtitle, onBack }: WizardHeaderConfig) => {
  const context = useContext(WizardShellContext);
  const isFocused = useIsFocused();
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const hasBack = onBack !== undefined;

  const handleBack = useCallback(() => onBackRef.current?.(), []);

  useLayoutEffect(() => {
    if (!isFocused || !context) return;
    context.setHeader({
      step,
      title,
      subtitle,
      onBack: hasBack ? handleBack : undefined,
    });
  }, [context, isFocused, step, title, subtitle, hasBack, handleBack]);
};
