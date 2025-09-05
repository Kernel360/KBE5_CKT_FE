import { useCallback, useEffect } from 'react';

const SSE_URL = import.meta.env.VITE_SSE_URL;

let sharedEventSource: EventSource | null = null;
const eventListeners = new Map<string, Set<(data: any) => void>>();

// SSE 이벤트를 파싱하고 등록된 리스너들에게 전달하는 핸들러 생성
function createHandler(eventName: string) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        listeners.forEach(cb => cb(data));
      }
    } catch (err) {
      console.error(`[${eventName}] SSE 데이터 파싱 실패:`, err);
    }
  };
}

// SSE 연결 오류 처리
const commonEventErrorHandler = (error: Event) => {
  console.error('SSE 연결 오류:', error);
};

export function useSse(eventName: string, onMessage: (data: any) => void) {
  // onMessage 콜백 함수 메모제이션
  const memoizedOnMessage = useCallback(onMessage, [onMessage]);

  useEffect(() => {
    // Event Source 중복 생성 방지 로직
    if (!sharedEventSource) {
      sharedEventSource = new EventSource(SSE_URL);
      sharedEventSource.onerror = commonEventErrorHandler;
      sharedEventSource.onopen = () => {};
    }

    // 이벤트 콜백함수 등록(ON, OFF, Update)
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, new Set());
    }
    eventListeners.get(eventName)!.add(memoizedOnMessage);

    const handler = createHandler(eventName);
    sharedEventSource.addEventListener(eventName, handler);

    return () => {
      eventListeners.get(eventName)?.delete(memoizedOnMessage);
      sharedEventSource?.removeEventListener(eventName, handler);

      if (eventListeners.size === 0 && sharedEventSource) {
        sharedEventSource.close();
        sharedEventSource = null;
      }
    };
  }, [eventName, memoizedOnMessage]);
}
