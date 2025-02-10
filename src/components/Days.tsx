import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { useCalendarContext } from '../CalendarContext';
import Day, { EmptyDay } from './Day';
import {
  getParsedDate,
  getMonthDays,
  getDaysInMonth,
  areDatesOnSameDay,
  isDateBetween,
  getDate,
  getFormated,
} from '../utils';
import WeekDays from './WeekDays';

const Days = () => {
  const {
    mode,
    date,
    startDate,
    endDate,
    dates,
    currentDate,
    onSelectDate,
    displayFullDays,
    minDate,
    maxDate,
    disabledDates,
    firstDayOfWeek,
    height,
    locale,
    renderDay,
    styles,
    classNames,
    weekdays,
    multiRangeMode,
  } = useCalendarContext();

  const { year, month, hour, minute } = getParsedDate(currentDate);

  const handleSelectDate = useCallback(
    (selectedDate: string) => {
      const newDate = getDate(selectedDate).hour(hour).minute(minute);

      onSelectDate(getFormated(newDate));
    },
    [onSelectDate, hour, minute]
  );

  const containerStyle = useMemo(
    () => [defaultStyles.daysContainer, styles?.days],
    [styles?.days]
  );

  const daysGrid = useMemo(() => {
    const today = new Date();
    const { fullDaysInMonth } = getDaysInMonth(
      currentDate,
      displayFullDays,
      firstDayOfWeek
    );

    return getMonthDays(
      currentDate,
      displayFullDays,
      minDate,
      maxDate,
      firstDayOfWeek,
      disabledDates
    ).map((day, index) => {
      if (!day) return null;

      let leftCrop = day.dayOfMonth === 1;
      let rightCrop = day.dayOfMonth === fullDaysInMonth;
      const isFirstDayOfMonth = day.dayOfMonth === 1;
      const isLastDayOfMonth = day.dayOfMonth === fullDaysInMonth;
      const isToday = areDatesOnSameDay(day.date, today);
      let inRange = false;
      let isSelected = false;

      if (mode === 'range') {
        rightCrop = false;
        const selectedStartDay = areDatesOnSameDay(day.date, startDate);
        const selectedEndDay = areDatesOnSameDay(day.date, endDate);
        isSelected = selectedStartDay || selectedEndDay;
        inRange = isDateBetween(day.date, { startDate, endDate });

        if (selectedStartDay) leftCrop = true;
        if (selectedEndDay) rightCrop = true;
        if (index % 7 === 0 && !selectedStartDay) leftCrop = false;
        if (index % 7 === 6 && !selectedEndDay) rightCrop = false;

        if (
          (isFirstDayOfMonth && selectedEndDay) ||
          (isLastDayOfMonth && selectedStartDay) ||
          dayjs(startDate).format('DDMMYYYY') ===
            dayjs(endDate).format('DDMMYYYY')
        ) {
          inRange = false;
        }
      } else if (mode === 'multiple') {
        const safeDates = dates || [];
        isSelected = safeDates.some((d) => areDatesOnSameDay(day.date, d));

        // if the selected days in a row, implements range mode style to selected days
        if (multiRangeMode) {
          const yesterday = dayjs(day.date).add(-1, 'day');
          const tomorrow = dayjs(day.date).add(1, 'day');

          const yesterdaySelected = safeDates.some((d) =>
            areDatesOnSameDay(d, yesterday)
          );
          const tomorrowSelected = safeDates.some((d) =>
            areDatesOnSameDay(d, tomorrow)
          );

          if (isSelected) {
            if (tomorrowSelected && yesterdaySelected) {
              inRange = true;
              isSelected = false;
            } else if (tomorrowSelected) {
              inRange = true;
              leftCrop = true;
            } else if (yesterdaySelected) {
              inRange = true;
              rightCrop = true;
            }

            if (isFirstDayOfMonth && !tomorrowSelected) inRange = false;
            if (isLastDayOfMonth && !yesterdaySelected) inRange = false;
          }
        }
      } else if (mode === 'single') {
        isSelected = areDatesOnSameDay(day.date, date);
      }

      return {
        ...day,
        isToday,
        isSelected,
        inRange,
        leftCrop,
        rightCrop,
      };
    });
  }, [
    mode,
    month,
    year,
    displayFullDays,
    firstDayOfWeek,
    minDate,
    maxDate,
    disabledDates,
    date,
    startDate,
    endDate,
    dates,
    multiRangeMode,
  ]);

  return (
    <View style={defaultStyles.container} testID="day-selector">
      <WeekDays
        locale={locale}
        firstDayOfWeek={firstDayOfWeek}
        styles={styles}
        classNames={classNames}
        weekdays={weekdays}
      />
      <View style={containerStyle} className={classNames?.days} testID="days">
        {daysGrid?.map((day, index) => {
          return day ? (
            <Day
              key={index}
              day={day}
              onSelectDate={handleSelectDate}
              calendarHeight={height}
              renderDay={renderDay}
              styles={styles}
              classNames={classNames}
            />
          ) : (
            <EmptyDay key={index} calendarHeight={height} />
          );
        })}
      </View>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  daysContainer: {
    width: '100%',
    height: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'flex-start',
  },
});

export default Days;
