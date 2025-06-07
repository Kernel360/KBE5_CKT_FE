import styled from 'styled-components';
import { motion } from 'framer-motion';

export const BaseSpan = styled(motion.span)`
  word-wrap: break-word;
`;

export const HeadingText = styled(BaseSpan)`
  color: var(--color-gray900);
  font-size: 24px;
  font-weight: 700;
  line-height: 28.8px;
`;

export const Heading2Text = styled(BaseSpan)`
  color: var(--color-gray900);
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
`;

export const SubheadingText = styled(BaseSpan)`
  color: var(--color-gray800);
  font-size: 18px;
  font-weight: 900;
  line-height: 21.6px;
`;

export const Subheading2Text = styled(BaseSpan)`
  color: var(--color-gray800);
  font-size: 16px;
  font-weight: 900;
  line-height: 19.2px;
`;

export const Body2Text = styled(BaseSpan)`
  font-size: 14px;
  line-height: 16.8px;
`;

export const LabelText = styled(BaseSpan)`
  color: var(--color-gray700);
  font-size: 14px;
  font-weight: 500;
  line-height: 16.8px;
`;

export const PlaceholderText = styled(BaseSpan)`
  color: var(--color-gray500);
  font-size: 14px;
  font-weight: 400;
  line-height: 16.8px;
`;

export const ErrorText = styled(BaseSpan)`
  color: var(--color-red);
  font-size: 12px;
  font-weight: 500;
  line-height: 14px;
`;
