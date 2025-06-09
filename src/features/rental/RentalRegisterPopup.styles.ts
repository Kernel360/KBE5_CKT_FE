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
