import styled from 'styled-components';

export const CardContainer = styled.div`
  width: 100%;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  border-radius: 6px;
  outline: 1px var(--color-gray300) solid;
  outline-offset: -1px;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

export const LicensePlateText = styled.span`
  color: var(--color-gray900);
  font-size: 14px;
  font-weight: 600;
  line-height: 16.8px;
  word-wrap: break-word;
`;

export const CarInfoText = styled.span`
  color: var(--color-gray600);
  font-size: 12px;Add commentMore actions
  font-weight: 400;
  line-height: 14.4px;
  word-wrap: break-word;
`;
