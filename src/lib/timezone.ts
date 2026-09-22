import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE_WIB = 'Asia/Jakarta';

/**
 * Returns current date in WIB (Asia/Jakarta) format YYYY-MM-DD
 */
export function getTodayWIB(): string {
  return dayjs().tz(TIMEZONE_WIB).format('YYYY-MM-DD');
}

/**
 * Returns current time in WIB (Asia/Jakarta) format HH:mm:ss
 */
export function getCurrentTimeWIB(): string {
  return dayjs().tz(TIMEZONE_WIB).format('HH:mm:ss');
}

/**
 * Returns date 7 days ago in WIB (Asia/Jakarta) format YYYY-MM-DD
 */
export function getSevenDaysAgoWIB(): string {
  return dayjs().tz(TIMEZONE_WIB).subtract(7, 'day').format('YYYY-MM-DD');
}

/**
 * Formats a date string into readable Indonesian format
 */
export function formatReadableDateWIB(dateStr: string): string {
  if (!dateStr) return '-';
  const d = dayjs.tz(dateStr, TIMEZONE_WIB);
  return d.format('DD MMM YYYY');
}
