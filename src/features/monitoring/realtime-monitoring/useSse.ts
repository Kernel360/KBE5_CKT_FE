// src/hooks/useSse.js 또는 src/hooks/useSse.ts

import { useEffect, useState } from 'react';

/**
 * SSE (Server-Sent Events) 연결을 위한 커스텀 React 훅
 * @param {string} url - SSE 엔드포인트 URL
 * @param {string} eventName - 구독할 이벤트 이름 (서버에서 SseEmitter.event().name()으로 설정한 이름)
 * @param {function} onMessage - 이벤트 메시지를 받았을 때 실행할 콜백 함수
 */
const SSE_URL = 'http://localhost:8080/api/v1/sse/gps';

export function useSse(eventName, onMessage) {
  useEffect(() => {
    // 1. EventSource 객체 생성
    const eventSource = new EventSource(SSE_URL);

    // 2. 특정 이벤트 이름에 대한 리스너 등록
    eventSource.addEventListener(eventName, event => {
      try {
        const parsedData = JSON.parse(event.data);
        onMessage(parsedData);
      } catch (error) {
        console.error('SSE 데이터 파싱 실패:', error);
      }
    });

    // 3. 오류 발생 시
    eventSource.onerror = error => {
      console.error('SSE 연결 오류:', error);
    };

    // 4. 컴포넌트가 언마운트될 때 연결 정리
    return () => {
      eventSource.close();
    };
  }, [eventName, onMessage]);
}
