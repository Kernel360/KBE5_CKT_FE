import React, { createContext, useContext, useState, type ReactNode, useCallback, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner'; // 로딩 스피너 컴포넌트 임포트

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

// 최소 500ms (0.5초) 동안 로딩 상태 유지
const MIN_LOADING_DURATION = 500;

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const loadingCounter = useRef(0);

  /**
   * 로딩 상태를 활성화하고 최소 로딩 시간을 시작합니다.
   */
  const showLoading = useCallback(() => {
    loadingCounter.current += 1;
    if (loadingCounter.current === 1) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      loadingStartTime.current = Date.now();
      setIsLoading(true);
    }
  }, []);

  /**
   * 로딩 상태를 비활성화합니다.
   * 모든 로딩 요청이 완료되고 최소 로딩 시간이 지나지 않았다면 대기 후 비활성화합니다.
   */
  const hideLoading = useCallback(() => {
    loadingCounter.current = Math.max(0, loadingCounter.current - 1);

    if (loadingCounter.current > 0) {
      return;
    }

    if (loadingStartTime.current === null) {
      setIsLoading(false);
      return;
    }

    const elapsedTime = Date.now() - loadingStartTime.current;
    const remainingTime = MIN_LOADING_DURATION - elapsedTime;

    if (remainingTime > 0) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setIsLoading(false);
        loadingStartTime.current = null;
      }, remainingTime);
    } else {
      setIsLoading(false);
      loadingStartTime.current = null;
    }
  }, []);

  const value = React.useMemo(
    () => ({
      isLoading,
      showLoading,
      hideLoading,
    }),
    [isLoading, showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingSpinner isLoading={isLoading} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
