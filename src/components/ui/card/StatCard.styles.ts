import styled from 'styled-components';
import type { StatCardValueColor } from './type'; // 정의한 타입 임포트

// --- 색상 정의 ---
const getCountDisplayColor = (theme: StatCardValueColor) => {
  switch (theme) {
    case 'blue':
      return 'var(--color-blue)';
    case 'green':
      return 'var(--color-green)';
    case 'yellow':
      return 'var(--color-yellow)';
    case 'red':
      return 'var(--color-red)';
    case 'default':
    default:
      return 'var(--color-gray900)';
  }
};

const getUnitDisplayColor = (theme: StatCardValueColor) => {
  switch (theme) {
    case 'blue':
      return 'var(--color-blue)';
    case 'green':
      return 'var(--color-green)';
    case 'yellow':
      return 'var(--color-yellow)';
    case 'red':
      return 'var(--color-red)';
    case 'default':
    default:
      return 'var(--color-gray600)';
  }
};

/**
 * 통계 정보를 담는 카드 컨테이너 스타일
 */
export const StatCardContainer = styled.div`
  align-self: stretch;
  width: 100%;
  height: 100px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  outline: 1px var(--color-gray300) solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
`;

/**
 * 카드 상단 라벨 텍스트 스타일
 */
export const LabelText = styled.span`
  color: var(--color-gray600);
  font-size: 14px;
  font-weight: 600;
  line-height: 16.8px;
  word-wrap: break-word;
`;

/**
 * 숫자와 단위를 감싸는 프레임 스타일
 */
export const CountFrame = styled.div`
  align-self: stretch;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
`;

/**
 * 숫자 값 스타일
 * `$countColor` prop을 받아 색상을 동적으로 적용합니다.
 */
export const CountNumber = styled.span<{ $countColor: StatCardValueColor }>`
  color: ${({ $countColor }) => getCountDisplayColor($countColor)};
  font-size: 28px;
  font-weight: 700;
  line-height: 33.6px;
  word-wrap: break-word;
`;

/**
 * 숫자 단위 스타일
 * `$unitColor` prop을 받아 색상을 동적으로 적용합니다.
 */
export const CountUnit = styled.span<{ $unitColor: StatCardValueColor }>`
  color: ${({ $unitColor }) => getUnitDisplayColor($unitColor)};
  font-size: 14px;
  font-weight: 600;
  line-height: 16.8px;
  word-wrap: break-word;
`;
