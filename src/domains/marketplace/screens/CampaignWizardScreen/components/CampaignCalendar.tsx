import React, { memo, useCallback, useMemo, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';

const MONTH_TITLE: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric', timeZone: 'UTC' };
/** Syrian weeks start on Saturday. */
const FIRST_DAY = 6;

const monthOf = (day: string): Date => new Date(`${day.slice(0, 7)}-01T00:00:00Z`);

interface CampaignCalendarProps {
  /** `YYYY-MM-DD` (Damascus); `null` = nothing picked yet. */
  selected: string | null;
  minDay: string;
  maxDay?: string;
  onPick: (day: string) => void;
}

/**
 * One-day calendar for the campaign dates. Days are Damascus day keys, so nothing here reads the
 * phone's zone; the month title goes through `formatDate` (Levantine month names in Arabic).
 */
const CampaignCalendarComponent: React.FC<CampaignCalendarProps> = ({ selected, minDay, maxDay, onPick }) => {
  const { colors, typography, sizes, isRTL } = useTheme();
  const opening = selected ?? minDay;
  // The calendar pages on its own; this only keeps the title in step with it.
  const [visibleMonth, setVisibleMonth] = useState(() => monthOf(opening));

  const onMonthChange = useCallback(({ dateString }: DateData) => setVisibleMonth(monthOf(dateString)), []);
  const onDayPress = useCallback(({ dateString }: DateData) => onPick(dateString), [onPick]);

  const marked = useMemo(
    () =>
      selected
        ? { [selected]: { selected: true, selectedColor: colors.calendar.edgeBg, selectedTextColor: colors.calendar.edgeText } }
        : {},
    [colors.calendar.edgeBg, colors.calendar.edgeText, selected],
  );

  const theme = useMemo(
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

  const renderArrow = useCallback(
    (direction: 'left' | 'right') => {
      // The calendar's «left» means previous, which points right in RTL.
      const Arrow = (direction === 'left') !== isRTL ? ChevronLeft : ChevronRight;
      return <Arrow size={sizes.icon.sm} color={colors.text.primary} />;
    },
    [colors.text.primary, isRTL, sizes.icon.sm],
  );

  return (
    <Calendar
      markedDates={marked}
      onDayPress={onDayPress}
      onMonthChange={onMonthChange}
      customHeaderTitle={
        <Text variant="title" color={colors.calendar.monthText}>
          {formatDate(visibleMonth, MONTH_TITLE)}
        </Text>
      }
      minDate={minDay}
      maxDate={maxDay}
      // Read on mount only: opens on the month the title shows.
      current={opening}
      theme={theme}
      renderArrow={renderArrow}
      enableSwipeMonths
      firstDay={FIRST_DAY}
    />
  );
};

export const CampaignCalendar = memo(CampaignCalendarComponent);
