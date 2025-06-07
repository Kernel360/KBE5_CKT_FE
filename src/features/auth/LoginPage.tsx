import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BasicButton } from '@/components/ui/button/BasicButton';
import {
  LoginContainer,
  LoginForm,
  LoginHeaderSection,
  LoginContentSection,
  Heading1,
  BodyText,
  LinkText,
} from './LoginPage.styles';
import { TextInput } from '@/components/ui/input/input/TextInput';
import api from '@/libs/axios';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        navigate('/');
      } else {
        console.error('토큰이 없습니다.');
      }
    } catch (error) {
      console.error('로그인 실패', error);
    }
  };

  // TODO: axios 써서 Login API 호출하고
  // 일치하면 dashboard 로 이동
  // 틀리면 error message 노출
  // 로그인 api 호출하고 -> header 값 가져와서 store or cookie 에 access token이랑 refresh token 저장
  // 로그인 api는 axios

  return (
    <LoginContainer>
      <LoginForm>
        <LoginHeaderSection>
          <Heading1>로그인</Heading1>
          <BodyText>계정 정보를 입력하여 로그인하세요</BodyText>
        </LoginHeaderSection>
        <TextInput
          width="100%"
          type="text"
          id="email"
          label="이메일"
          placeholder="이메일 주소 입력"
          value={email}
          onChange={setEmail}
          onEnter={handleLogin}
        />
        <TextInput
          width="100%"
          type="password"
          id="password"
          label="비밀번호"
          value={password}
          placeholder="••••••••"
          onChange={setPassword}
          onEnter={handleLogin}
        />

        <LoginContentSection>
          <LinkText>비밀번호 찾기</LinkText>
        </LoginContentSection>

        <BasicButton width="100%" onClick={handleLogin}>
          로그인
        </BasicButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;
