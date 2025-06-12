import { StatCardContainer, LabelText, CountFrame, CountNumber, CountUnit } from './StatCard.styles';
import type { StatCardProps } from './type';

/**
 * 특정 항목의 통계(총 개수 등)를 표시하는 재사용 가능한 카드 컴포넌트입니다.
 * @param {StatCardProps} props - label (항목 라벨), count (개수), unit (단위),
 * countColor (숫자 색상), unitColor (단위 색상),
 */
export const StatCard = ({ label, count, unit, countColor = 'default', unitColor = 'default' }: StatCardProps) => {
  return (
    <StatCardContainer>
      <LabelText>{label}</LabelText>
      <CountFrame>
        <CountNumber $countColor={countColor}>{count}</CountNumber>
        <CountUnit $unitColor={unitColor}>{unit}</CountUnit>
      </CountFrame>
    </StatCardContainer>
  );
};
