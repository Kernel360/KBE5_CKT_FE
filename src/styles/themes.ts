export interface CustomTheme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  gray900: string;
  gray800: string;
  gray700: string;
  gray600: string;
  gray500: string;
  gray400: string;
  gray300: string;
  gray200: string;
  gray100: string;
  white: string;
  black: string;
  // Secondary Color
  red: string;
  redDark: string;
  redLight: string;
  // Basic Color
  blue: string;
  green: string;
  yellow: string;
  orange: string;
  purple: string;
}

// 공통 테마 속성
const commonTheme = {
  gray900: '#1E293B',
  gray800: '#334155',
  gray700: '#475569',
  gray600: '#64748B',
  gray500: '#94A3B8',
  gray400: '#CBD5E1',
  gray300: '#E2E8F0',
  gray200: '#F5F7FA',
  gray100: '#FCFEFF',
  white: '#FFFFFF',
  black: '#000000',
  red: '#EF4444',
  redDark: '#991B1B',
  redLight: '#FEE2E2',
  blue: '#3563E9',
  green: '#10B981',
  yellow: '#F59E0B',
  orange: '#EFA244',
  purple: '#6366F1',
};

// 2. 개별 테마 객체 정의
export const blueTheme: CustomTheme = {
  ...commonTheme,
  primary: '#3B82F6',
  primaryDark: '#3563e9',
  primaryLight: '#EFF6FF',
};

export const pinkTheme: CustomTheme = {
  ...commonTheme,
  primary: '#FF69b4',
  primaryDark: '#E659A2',
  primaryLight: '#FFE0F0',
};

export const brownTheme: CustomTheme = {
  ...commonTheme,
  primary: '#8B4513',
  primaryDark: '#7A3D11',
  primaryLight: '#D4BBA6',
};

// 3. 테마 맵 정의 (테마 선택을 위한)
export const themeMap = {
  blue: blueTheme,
  pink: pinkTheme,
  brown: brownTheme,
};

// 4. 테마 키 타입 정의
export type ThemeKey = keyof typeof themeMap;

// 5. CSS 변수 생성 함수 (필요시 사용)
// - 이 함수는 주로 전역적으로 CSS 변수를 설정할 때 유용합니다.
// - 컴포넌트 내부에서는 props.theme를 직접 사용하는 것이 더 일반적입니다.
export const createThemeCssVars = (theme: CustomTheme) => {
  return Object.entries(theme)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n');
};
