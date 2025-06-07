import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// 예시 아이콘: 실제 프로젝트에서는 SVG 아이콘을 사용하세요.
// import { ReactComponent as CarIcon } from '@/assets/icons/car.svg';
const CarIconPlaceholder = styled.div`
  width: 50px;
  height: 30px;
  background-color: #007bff; /* 차량 색상 예시 */
  border-radius: 5px;
  position: relative;
  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    width: 10px;
    height: 10px;
    background-color: #333;
    border-radius: 50%;
  }
  &::before {
    left: 5px;
  }
  &::after {
    right: 5px;
  }
`;

const SpinnerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7); /* 반투명 흰색 오버레이 */
  z-index: 9999; /* 다른 요소들 위에 오도록 */
`;

const CarAnimationContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const carVariants = {
  animate: {
    x: ['-50%', '50%'], // 왼쪽에서 오른쪽으로 이동
    transition: {
      x: {
        repeat: Infinity, // 무한 반복
        repeatType: 'mirror', // 왕복 운동
        duration: 1.5, // 1.5초 동안 이동
        ease: 'easeInOut', // 부드러운 가속/감속
      },
    },
  },
};

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <SpinnerOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <CarAnimationContainer variants={carVariants} animate="animate">
        {/* 여기에 실제 자동차 아이콘 컴포넌트를 넣으세요. */}
        <CarIconPlaceholder />
        {/* <CarIcon /> */}
      </CarAnimationContainer>
    </SpinnerOverlay>
  );
};
