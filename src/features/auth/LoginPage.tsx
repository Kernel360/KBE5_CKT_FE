import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BasicButton } from '@/components/ui/button/BasicButton';
import { LoginContainer, LoginForm, LoginHeaderSection, Heading1, BodyText } from './LoginPage.styles';
import { TextInput } from '@/components/ui/input/input/TextInput';
import api from '@/libs/axios';

import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      valid = false;
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
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
        setEmailError('이메일과 비밀번호를 확인해주세요.');
        setPasswordError('이메일과 비밀번호를 확인해주세요.');
      }
    } catch {
      setEmailError('이메일과 비밀번호를 확인해주세요.');
      setPasswordError('이메일과 비밀번호를 확인해주세요.');
    }
  };

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
          errorText={emailError}
          onEnter={handleLogin}
          onChange={setEmail}
        />
        <TextInput
          width="100%"
          type="password"
          id="password"
          label="비밀번호"
          value={password}
          errorText={passwordError}
          placeholder="••••••••"
          onChange={setPassword}
          onEnter={handleLogin}
        />

        {/* TODO: 0613 중간 발표로 주석 처리 */}
        {/* <LoginContentSection>
          <LinkText>비밀번호 찾기</LinkText>
        </LoginContentSection> */}

        <BasicButton width="100%" onClick={handleLogin}>
          로그인
        </BasicButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;
