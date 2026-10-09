import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { SpacingToken } from '@/core/theme';
import { useTheme } from '@/core/theme';
import { formatDate } from '@/core/i18n';
import { Box, Text } from '../primitives';
import { CustomButton } from '../CustomButton';
import { BottomSheet } from '../BottomSheet';
import { DateTab } from './DateTab';
import type { DateRangeSelecting } from './DateTab';

// ── Shared types ──────────────────────────────────────────────────────────────

/** `future` = from today on, end after start (bookings). `past` = up to today, one-day ranges allowed (statements). */
export type DateRangeDirection = 'future' | 'past';

export interface DateRangePickerContentProps {
  visible: boolean;
  onClose: () => void;
  checkIn: Date;
  checkOut: Date;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  initialSelecting?: DateRangeSelecting;
  mainHeaderButtonsPadding?: SpacingToken;
  /** Default `future`. */
  range?: DateRangeDirection;
}

export type DateRangePickerProps = DateRangePickerContentProps;

// ── Local utils ───────────────────────────────────────────────────────────────

/** Placeholder until a date is picked (typographic, not user copy). */
const EMPTY_DATE = '—';

const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const SHORT_DATE: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
const formatShort = (date: Date): string => formatDate(date, SHORT_DATE);

const MONTH_TITLE: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

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
  range = 'future',
}) => {
  const isPast = range === 'past';
  const { t } = useTranslation();
  const { colors, typography, sizes, borderWidths, isRTL } = useTheme();

  const [selecting, setSelecting] = useState<DateRangeSelecting>(initialSelecting);
  const [tempCheckIn, setTempCheckIn] = useState<Date | null>(null);
  const [tempCheckOut, setTempCheckOut] = useState<Date | null>(null);
  // The calendar's own title follows XDate's English names; ours goes through `formatDate` (Levantine months in Arabic).
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(checkIn));

  useEffect(() => {
    if (visible) {
      setTempCheckIn(checkIn);
      setTempCheckOut(checkOut);
      setSelecting(initialSelecting);
      setVisibleMonth(startOfMonth(checkIn));
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

      // A statement may cover a single day; a booking needs at least one night.
      const minOut = addDays(tempCheckIn, isPast ? 0 : 1);

      if (tapped >= minOut) {
        setTempCheckOut(tapped);
      } else {
        setTempCheckIn(tapped);
        setTempCheckOut(null);
      }
    },
    [isPast, selecting, tempCheckIn],
  );

  const handleMonthChange = useCallback(
    ({ year, month }: DateData) => setVisibleMonth(new Date(year, month - 1, 1)),
    [],
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
      backgroundColor: colors.layout.transparent,
      calendarBackground: colors.layout.transparent,
      textSectionTitleColor: colors.calendar.sectionTitle,
      todayTextColor: colors.calendar.todayText,
      todayBackgroundColor: colors.calendar.todayBg,
      dayTextColor: colors.calendar.dayText,
      textDisabledColor: colors.calendar.disabledText,
      monthTextColor: colors.calendar.monthText,
      textDayFontFamily: typography.bodySmall.fontFamily,
      textMonthFontFamily: typography.title.fontFamily,
      textDayHeaderFontFamily: typography.caption.fontFamily,
      textDayFontSize: typography.bodySmall.fontSize,
      textMonthFontSize: typography.title.fontSize,
      textDayHeaderFontSize: typography.caption.fontSize,
    }),
    [colors.calendar, colors.layout.transparent, typography],
  );

  const minDate = useMemo(() => {
    if (selecting === 'checkout' && tempCheckIn) {
      return toDateStr(addDays(tempCheckIn, isPast ? 0 : 1));
    }
    return isPast ? undefined : toDateStr(new Date());
  }, [isPast, selecting, tempCheckIn]);

  const maxDate = useMemo(() => (isPast ? toDateStr(new Date()) : undefined), [isPast]);

  // Past ranges count days inclusively (1–9 Oct = 9 days); bookings count nights.
  const nights =
    tempCheckIn && tempCheckOut
      ? nightsBetween(tempCheckIn, tempCheckOut) + (isPast ? 1 : 0)
      : null;

  const confirmEnabled = !!(tempCheckIn && tempCheckOut);

  const renderArrow = useCallback(
    (direction: 'left' | 'right') => {
      // The calendar's "left" arrow means "previous", which points right in RTL.
      const Arrow = (direction === 'left') !== isRTL ? ChevronLeft : ChevronRight;
      return <Arrow size={sizes.icon.sm} color={colors.text.primary} />;
    },
    [colors.text.primary, isRTL, sizes.icon.sm],
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
        <DateTab
          value="checkin"
          active={selecting === 'checkin'}
          label={t('dateRange.startDate')}
          dateLabel={tempCheckIn ? formatShort(tempCheckIn) : EMPTY_DATE}
          onSelect={setSelecting}
        />
        <DateTab
          value="checkout"
          active={selecting === 'checkout'}
          label={t('dateRange.endDate')}
          dateLabel={tempCheckOut ? formatShort(tempCheckOut) : EMPTY_DATE}
          onSelect={setSelecting}
        />
      </Box>

      <Box height={borderWidths.thin} bg={colors.border.default} mb="md" />

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
        onMonthChange={handleMonthChange}
        customHeaderTitle={
          <Text variant="title" color={colors.calendar.monthText}>
            {formatDate(visibleMonth, MONTH_TITLE)}
          </Text>
        }
        minDate={minDate}
        maxDate={maxDate}
        // Read on mount only: opens on the month the title shows.
        current={toDateStr(visibleMonth)}
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
