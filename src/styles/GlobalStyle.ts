import 'normalize.css';

import { createGlobalStyle, css } from 'styled-components';
import { createThemeCssVars } from './themes';

const GlobalStyle = createGlobalStyle`
  ${props => css`
    /* Poppins 폰트 불러오기 (Latin, Devanagari 문자 지원) */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;900&display=swap');

    /* Noto Sans KR 폰트 불러오기 (한글 지원) */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;600;700;900&display=swap');

    html {
      // 선택된 테마의 CSS 변수를 여기에 적용
      ${createThemeCssVars(props.theme)}

      font-family: 'Poppins', 'Noto Sans KR', sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: var(--color-gray900);
      background-color: var(--color-gray200);

      /* 기타 전역 스타일 */
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;

      /* 최소 너비 설정 */
      min-width: 1280px;
      width: 100%;
      height: 100vh;

      /* 화면 너비가 min-width보다 작아질 경우 가로 스크롤바 생성 */
      overflow-x: auto;
    }

    html,
    body {
      overflow: auto; /* 또는 hidden, scroll */
      /* WebKit (Chrome, Safari) */
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      &:hover::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.4);
      }
      /* Firefox */
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    }

    /* 모든 요소에 box-sizing 적용 */
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    /* Toast Popup */
    .Toastify__toast {
      width: 560px;
      font-size: 16px;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    /* 성공 메시지 색상 변경 */
    .Toastify__toast--success {
      background-color: var(--color-primary);
      color: white;
      --toastify-icon-color-success: white;
    }

    /* 에러 메시지 색상 변경 */
    .Toastify__toast--error {
      background-color: var(--color-red);
      color: white;
      --toastify-icon-color-error: white;
    }

    /* 정보 메시지 색상 변경 */
    .Toastify__toast--info {
      background-color: var(--color-black);
      color: white;
      --toastify-icon-color-info: white;
    }

    /* 닫기 버튼 색상 변경 (기본 X 버튼) */
    .Toastify__close-button {
      color: white;
      opacity: 1;
    }
    .Toastify__close-button:hover {
      opacity: 0.8;
    }
  `}
`;

export default GlobalStyle;
