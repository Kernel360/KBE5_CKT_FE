import styled from 'styled-components';

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px; /* 섹션 내 요소 간 간격 */
`;

export const FormRow = styled.div`
  display: grid;
  /* 반응형 그리드: 최소 250px 너비를 가지는 컬럼을 최대한 채워 정렬 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px; /* 그리드 항목 간 간격 */
`;

export const FormFieldWrapper = styled.div`
  /* 각 폼 필드 컴포넌트 (TextInput, Dropdown)가 wrapper 내에서 잘 배치되도록 추가 스타일 필요 시 사용 */
`;

export const MemoSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker {
    font-family: 'Poppins', 'Noto Sans KR', sans-serif;
    border: 1px solid var(--color-gray300);
    border-radius: 8px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
  }

  .react-datepicker__header {
    background-color: var(--color-primary);
    color: var(--color-white);
    border-bottom: none;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .react-datepicker__current-month,
  .react-datepicker-time__header,
  .react-datepicker-year-header {
    color: var(--color-white);
  }

  .react-datepicker__day-name {
    color: var(--color-white);
    font-weight: 600;
  }

  .react-datepicker__day {
    color: var(--color-gray800);
    &:hover {
      background-color: var(--color-primaryLight);
      color: var(--color-primaryDark);
    }
  }

  .react-datepicker__day--selected {
    background-color: var(--color-primary);
    color: var(--color-white);
  }

  .react-datepicker__day--today {
    font-weight: bold;
    color: var(--color-white);
    background-color: var(--color-primary);
  }

  .react-datepicker__navigation {
    top: 10px;
    &--previous {
      left: 10px;
      border-right-color: var(--color-white);
    }
    &--next {
      right: 10px;
      border-left-color: var(--color-white);
    }
  }

  .react-datepicker__year-dropdown-container,
  .react-datepicker__month-dropdown-container {
    select {
      background-color: var(--color-white);
      color: var(--color-primary);
      border: 1px solid var(--color-primaryLight);
      border-radius: 4px;
      padding: 2px 20px 2px 8px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1.2;
      height: 30px;
    }
  }
`; 