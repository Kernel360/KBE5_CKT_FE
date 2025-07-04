import React, { useState, useCallback, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

import { StyledDateInputContainer, CalendarIconContainer, FieldContainer, StyledLabel } from './DateInput.styles';
import type { DateInputProps } from './types';

import CalendarIcon from '@/assets/icons/ic-calendar.svg?react';

const CustomInput = forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(({ value, onClick }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <span style={{ flexGrow: 1 }}>{value}</span>
      <CalendarIconContainer>
        <CalendarIcon />
      </CalendarIconContainer>
    </div>
  );
});
CustomInput.displayName = 'CustomDateInput';

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  startDate,
  endDate,
  onDateChange,
  placeholder = 'YYYY.MM.DD ~ YYYY.MM.DD',
  width,
  disabled = false,
  readOnly = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleDateChange = useCallback(
    (dates: [Date | null, Date | null]) => {
      const [start, end] = dates;
      onDateChange({ startDate: start, endDate: end });
    },
    [onDateChange]
  );

  const formatSelectedDates = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'yyyy.MM.dd', { locale: ko })} ~ ${format(endDate, 'yyyy.MM.dd', { locale: ko })}`;
    } else if (startDate) {
      return `${format(startDate, 'yyyy.MM.dd', { locale: ko })} ~`;
    }
    return placeholder;
  };

  const isDisabledOrReadOnly = disabled || readOnly;

  return (
    <FieldContainer $width={width}>
      {label && (
        <StyledLabel htmlFor={id || `date-input-${Math.random().toString(36).substr(2, 9)}`}>{label}</StyledLabel>
      )}
      <StyledDateInputContainer
        $width={width}
        $isDisabledOrReadOnly={isDisabledOrReadOnly}
        $isFocused={isFocused}
        id={id}
      >
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          dateFormat="yyyy.MM.dd"
          placeholderText={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          showPopperArrow={false}
          onCalendarOpen={() => setIsFocused(true)}
          onCalendarClose={() => setIsFocused(false)}
          className="react-datepicker-custom-input"
          locale={ko}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          customInput={<CustomInput value={formatSelectedDates()} />}
        />
      </StyledDateInputContainer>
    </FieldContainer>
  );
};

DateInput.displayName = 'DateInput';
