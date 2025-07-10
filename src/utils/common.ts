/**
 * 숫자를 콤마로 구분된 문자열로 포맷팅합니다.
 * 문자열 형태의 숫자도 처리하며, 유효하지 않은 숫자이거나 null/undefined일 경우 undefined를 반환합니다.
 *
 * @param value 포맷팅할 숫자 (number | string | null | undefined)
 * @returns 콤마가 추가된 문자열, 또는 undefined
 */
export const formatCommas = (value: number | string | null | undefined): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const numValue: number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return undefined;
  }

  return numValue.toLocaleString('en-US');
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

export const formatKm = (meter: number): string => {
  const km = meter / 1000;
  return (km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)) + ' km';
};
