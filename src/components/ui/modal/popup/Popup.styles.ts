import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const PopupContainer = styled(motion.div)`
  width: 600px;
  padding: 24px;
  background: var(--color-white);
  border-radius: 8px;
  outline: 1px solid var(--color-gray600);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

export const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ActionButtonsWrapper = styled.div`
  align-self: stretch;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
`;
