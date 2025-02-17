import './locales';
import './polyfill';
import DateTimePicker from './datetime-picker';

export type {
  DateType,
  CalendarMode,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  CalendarYear,
  CalendarComponents,
} from './types';
export { getDefaultClassNames, getDefaultStyles } from './theme';

export default DateTimePicker;
