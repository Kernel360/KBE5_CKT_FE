import { parseISO, format, setMilliseconds, setSeconds, setMinutes, setHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * 현재 시스템의 로컬 타임존 ID를 가져옵니다.
 * @returns 현재 시스템의 타임존 ID (예: 'Asia/Seoul', 'America/New_York')
 */
const getSystemTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * ISO 8601 형식의 날짜/시간 문자열(예: "2025-06-11T17:00:00")을
 * "YYYY.MM.DD HH:mm:ss" 형식으로 변환합니다.
 * @param datetimeString 변환할 날짜/시간 문자열
 * @returns 포매팅된 날짜/시간 문자열 (변환 실패 시 빈 문자열 또는 원본 문자열)
 */
export const formatLocalDateTime = (datetimeString: string): string => {
  if (!datetimeString) {
    return '';
  }

  try {
    const date = parseISO(datetimeString);

    if (isNaN(date.getTime())) {
      return datetimeString;
    }

    return format(date, 'yyyy.MM.dd HH:mm:ss');
  } catch (error) {
    console.error('날짜 포매팅 오류:', error);
    return datetimeString;
  }
};

/**
 * Date 객체를 지정된 타임존과 포맷에 맞춰 문자열로 변환합니다.
 * timeZone 인자가 제공되지 않으면 현재 시스템의 로컬 타임존을 사용합니다.
 *
 * @param dateValue 변환할 Date 객체 또는 undefined/null.
 * @param timeZone 포매팅할 타임존 ID (예: 'Asia/Seoul', 'UTC'). 기본값은 현재 시스템의 로컬 타임존.
 * @param formatString 날짜/시간을 포매팅할 형식 문자열 (date-fns 포맷). 기본값은 ISO 8601 UTC ('yyyy-MM-dd'T'HH:mm:ss.SSSXXX').
 * @returns 포매팅된 날짜/시간 문자열 또는 undefined (원본 값에 따라).
 */
export const formatDateTime = (
  dateValue: Date | null | undefined,
  timeZone: string = getSystemTimeZone(),
  formatString: string = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
): string | undefined => {
  if (dateValue instanceof Date) {
    return formatInTimeZone(dateValue, timeZone, formatString);
  }
  return undefined;
};

/**
 * 특정 날짜의 시작 시간(00:00:00.000)으로 Date 객체를 조정합니다.
 * @param date Date 객체
 * @returns 해당 날짜의 시작 시간으로 조정된 Date 객체
 */
export const startOfDay = (date: Date): Date => {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0);
};

/**
 * 특정 날짜의 마지막 시간(23:59:59.999)으로 Date 객체를 조정합니다.
 * @param date Date 객체
 * @returns 해당 날짜의 마지막 시간으로 조정된 Date 객체
 */
export const endOfDay = (date: Date): Date => {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 23), 59), 59), 999);
};
