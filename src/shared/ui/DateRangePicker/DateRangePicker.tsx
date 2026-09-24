import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { SpacingToken } from '@/core/theme';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Text, Pressable } from '../primitives';
import { CustomButton } from '../CustomButton';
import { BottomSheet } from '../BottomSheet';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface DateRangePickerContentProps {
  visible: boolean;
  onClose: () => void;
  checkIn: Date;
  checkOut: Date;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  initialSelecting?: 'checkin' | 'checkout';
  mainHeaderButtonsPadding?: SpacingToken;
}

export type DateRangePickerProps = DateRangePickerContentProps;

// ── Local utils ───────────────────────────────────────────────────────────────

type Selecting = 'checkin' | 'checkout';

const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatShort = (date: Date): string =>
  date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

const nightsBetween = (start: Date, end: Date): number => {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
};

const buildMarkedDates = (
  start: Date | null,
  end: Date | null,
  edgeBg: string,
  midBg: string,
  edgeText: string,
  midText: string,
): Record<string, object> => {
  if (!start) return {};

  const startStr = toDateStr(start);
  const marks: Record<string, object> = {};

  if (!end) {
    marks[startStr] = {
      startingDay: true,
      endingDay: true,
      color: edgeBg,
      textColor: edgeText,
    };
    return marks;
  }

  const endStr = toDateStr(end);
  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor <= endLocal) {
    const str = toDateStr(cursor);
    if (str === startStr) {
      marks[str] = { startingDay: true, color: edgeBg, textColor: edgeText };
    } else if (str === endStr) {
      marks[str] = { endingDay: true, color: edgeBg, textColor: edgeText };
    } else {
      marks[str] = { color: midBg, textColor: midText };
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return marks;
};

// ── DateRangePickerContent ────────────────────────────────────────────────────
/**
 * Pure calendar UI — no Modal wrapper.
 * Use this when rendering inside an existing Modal (e.g. as an overlay in FilterModal).
 * Use <DateRangePicker> for standalone use (wraps this in a BottomSheet).
 */
export const DateRangePickerContent: React.FC<DateRangePickerContentProps> = ({
  visible,
  onClose,
  checkIn,
  checkOut,
  onConfirm,
  initialSelecting = 'checkin',
  mainHeaderButtonsPadding = 'lg',
}) => {
  const { t } = useTranslation();
  const { colors, typography, isRTL } = useTheme();

  const [selecting, setSelecting] = useState<Selecting>(initialSelecting);
  const [tempCheckIn, setTempCheckIn] = useState<Date | null>(null);
  const [tempCheckOut, setTempCheckOut] = useState<Date | null>(null);

  useEffect(() => {
    if (visible) {
      setTempCheckIn(checkIn);
      setTempCheckOut(checkOut);
      setSelecting(initialSelecting);
    }
  }, [visible, checkIn, checkOut, initialSelecting]);

  const handleConfirm = useCallback(() => {
    if (!tempCheckIn || !tempCheckOut) return;
    onConfirm(tempCheckIn, tempCheckOut);
    onClose();
  }, [tempCheckIn, tempCheckOut, onConfirm, onClose]);

  const handleDayPress = useCallback(
    ({ dateString }: DateData) => {
      const tapped = new Date(dateString + 'T00:00:00');

      if (selecting === 'checkin') {
        setTempCheckIn(tapped);
        setTempCheckOut(null);
        setSelecting('checkout');
        return;
      }

      if (!tempCheckIn) {
        setTempCheckIn(tapped);
        setSelecting('checkout');
        return;
      }

      const minOut = new Date(
        tempCheckIn.getFullYear(),
        tempCheckIn.getMonth(),
        tempCheckIn.getDate() + 1,
      );

      if (tapped >= minOut) {
        setTempCheckOut(tapped);
      } else {
        setTempCheckIn(tapped);
        setTempCheckOut(null);
      }
    },
    [selecting, tempCheckIn],
  );

  const markedDates = useMemo(
    () =>
      buildMarkedDates(
        tempCheckIn,
        tempCheckOut,
        colors.calendar.edgeBg,
        colors.calendar.midBg,
        colors.calendar.edgeText,
        colors.calendar.midText,
      ),
    [
      tempCheckIn,
      tempCheckOut,
      colors.calendar.edgeBg,
      colors.calendar.midBg,
      colors.calendar.edgeText,
      colors.calendar.midText,
    ],
  );

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: 'transparent',
      calendarBackground: 'transparent',
      textSectionTitleColor: colors.calendar.sectionTitle,
      todayTextColor: colors.calendar.todayText,
      todayBackgroundColor: colors.calendar.todayBg,
      dayTextColor: colors.calendar.dayText,
      textDisabledColor: colors.calendar.disabledText,
      monthTextColor: colors.calendar.monthText,
      textDayFontFamily: typography.bodySmall.fontFamily,
      textMonthFontFamily: typography.title.fontFamily,
      textDayHeaderFontFamily: typography.caption.fontFamily,
      textDayFontSize: moderateScale(14),
      textMonthFontSize: moderateScale(15),
      textDayHeaderFontSize: moderateScale(12),
    }),
    [colors.calendar, typography],
  );

  const minDate = useMemo(() => {
    if (selecting === 'checkout' && tempCheckIn) {
      return toDateStr(
        new Date(
          tempCheckIn.getFullYear(),
          tempCheckIn.getMonth(),
          tempCheckIn.getDate() + 1,
        ),
      );
    }
    return toDateStr(new Date());
  }, [selecting, tempCheckIn]);

  const nights =
    tempCheckIn && tempCheckOut
      ? nightsBetween(tempCheckIn, tempCheckOut)
      : null;

  const confirmEnabled = !!(tempCheckIn && tempCheckOut);

  const renderArrow = useCallback(
    (direction: 'left' | 'right') => {
      if (isRTL) {
        return direction === 'left' ? (
          <ChevronRight size={moderateScale(20)} color={colors.text.primary} />
        ) : (
          <ChevronLeft size={moderateScale(20)} color={colors.text.primary} />
        );
      }
      return direction === 'left' ? (
        <ChevronLeft size={moderateScale(20)} color={colors.text.primary} />
      ) : (
        <ChevronRight size={moderateScale(20)} color={colors.text.primary} />
      );
    },
    [colors.text.primary, isRTL],
  );

  return (
    <>
      {/* Date tabs */}
      <Box
        row
        px={mainHeaderButtonsPadding}
        pb="lg"
        pt="md"
        gap="md"
        justify="space-between"
      >
        <Pressable
          flex={1}
          onPress={() => setSelecting('checkin')}
          py="sm"
          px="md"
          borderRadius="md"
          borderColor={selecting !== 'checkin' ? colors.border.strong : undefined}
          borderWidth={selecting !== 'checkin' ? 'hairline' : 'none'}
          bg={
            selecting === 'checkin' ? colors.interactive.main : undefined
          }
          align="center"
        >
          <Text
            variant="caption"
            color={
              selecting === 'checkin'
                ? colors.text.onAccent
                : colors.text.primary
            }
          >
            {t('dateRange.startDate')}
          </Text>
          <Text
            variant="title"
            color={
              selecting === 'checkin'
                ? colors.text.onAccent
                : colors.text.primary
            }
            mt="xs"
          >
            {tempCheckIn ? formatShort(tempCheckIn) : '—'}
          </Text>
        </Pressable>

        <Pressable
          flex={1}
          onPress={() => setSelecting('checkout')}
          py="sm"
          px="md"
          borderRadius="md"
          bg={
            selecting === 'checkout' ? colors.interactive.main : undefined
          }
          borderColor={selecting !== 'checkout' ? colors.border.strong : undefined}
          borderWidth={selecting !== 'checkout' ? 'hairline' : 'none'}
          align="center"
        >
          <Text
            variant="caption"
            color={
              selecting === 'checkout'
                ? colors.text.onAccent
                : colors.text.primary
            }
          >
            {t('dateRange.endDate')}
          </Text>
          <Text
            variant="title"
            color={
              selecting === 'checkout'
                ? colors.text.onAccent
                : colors.text.primary
            }
            mt="xs"
          >
            {tempCheckOut ? formatShort(tempCheckOut) : '—'}
          </Text>
        </Pressable>
      </Box>

      <Box height={1} bg={colors.border.default} mb="md" />

      {/* Instruction + nights badge */}
      <Box
        px="lg"
        pb="lg"
        borderBottomWidth="hairline"
        borderColor={colors.layout.divider}
        justify="space-between"
        row
        align="center"
      >
        <Text variant="bodySmall" color={colors.text.primary}>
          {selecting === 'checkin'
            ? t('dateRange.selectStart')
            : t('dateRange.selectEnd')}
        </Text>

        {nights !== null && (
          <Box borderRadius="md" bg={colors.interactive.main}>
            <Text
              variant="bodySmall"
              color={colors.text.onAccent}
              align="center"
              px="xl"
              py="xs"
            >
              {t('dateRange.days', { count: nights })}
            </Text>
          </Box>
        )}
      </Box>

      {/* Calendar */}
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        minDate={minDate}
        current={tempCheckIn ? toDateStr(tempCheckIn) : toDateStr(new Date())}
        theme={calendarTheme}
        renderArrow={renderArrow}
        enableSwipeMonths
        firstDay={0}
      />

      {/* Confirm */}
      <Box
        px="lg"
        pt="md"
        pb="md"
        borderTopWidth="hairline"
        borderColor={colors.layout.divider}
      >
        <CustomButton
          title={t('common.confirm')}
          onPress={handleConfirm}
          fullWidth
          disabled={!confirmEnabled}
        />
      </Box>
    </>
  );
};

// ── DateRangePicker ───────────────────────────────────────────────────────────
/**
 * Standalone calendar picker — wraps DateRangePickerContent in a BottomSheet.
 * Use this when NOT inside an existing Modal.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  ...rest
}) => (
  <BottomSheet visible={visible} onClose={onClose}>
    <DateRangePickerContent visible={visible} onClose={onClose} {...rest} />
  </BottomSheet>
);
