import { BasicButton } from '@/components/ui/button/BasicButton';
import api from '@/libs/axios';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Props {
  type: '개인' | '법인';
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerCreateModal: React.FC<Props> = ({ type: initialType, onClose, onSuccess }) => {
  const [type, setType] = useState<'개인 고객' | '법인 고객'>(initialType === '개인' ? '개인 고객' : '법인 고객');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    license: '',
    birth: '',
    zipCode: '',
    address: '',
    detailAddress: '',
    joinDate: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
  });

  useEffect(() => {
    setType(initialType === '개인' ? '개인 고객' : '법인 고객');
    setForm({
      name: '',
      phone: '',
      email: '',
      license: '',
      birth: '',
      zipCode: '',
      address: '',
      detailAddress: '',
      joinDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
    });
  }, [initialType]);

  type FormKey = keyof typeof form;

  const handleChange = (field: FormKey, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.license.trim()) {
      alert('이름과 운전면허번호는 필수 입력 항목입니다.');
      return;
    }

    try {
      const payload =
        type === '개인 고객'
          ? {
              customerType: 'INDIVIDUAL',
              customerName: form.name,
              phoneNumber: form.phone,
              email: form.email,
              licenseNumber: form.license,
              birthday: form.birth,
              status: 'ACTIVE',
              createdAt: form.joinDate,
            }
          : {
              customerType: 'CORPORATE',
              customerName: form.name,
              phoneNumber: form.phone,
              email: form.email,
              licenseNumber: form.license,
              zipCode: form.zipCode,
              address: form.address,
              detailAddress: form.detailAddress,
              status: 'ACTIVE',
              createdAt: form.joinDate,
            };

      await api.post('/api/v1/customers', payload);

      onSuccess(); // 리스트 새로고침

      alert('사용자를 추가했습니다!');
      onClose();
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>사용자 추가</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Section>
          <Label>고객 유형</Label>
          <RadioGroup>
            <label>
              <input type="radio" checked={type === '개인 고객'} onChange={() => setType('개인 고객')} />
              개인 고객
            </label>
            <label>
              <input type="radio" checked={type === '법인 고객'} onChange={() => setType('법인 고객')} />
              법인 고객
            </label>
          </RadioGroup>
        </Section>

        <FormGrid>
          {type === '개인 고객' ? (
            <>
              {/* 개인 필드 */}
              <InputField>
                <Label>이름</Label>
                <Input
                  placeholder="이름을 입력하세요"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>연락처</Label>
                <Input
                  placeholder="010-1234-1234"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>생년월일</Label>
                <Input type="date" value={form.birth} onChange={e => handleChange('birth', e.target.value)} />
              </InputField>
              <InputField>
                <Label>이메일</Label>
                <Input
                  placeholder="abc@example.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>운전면허번호</Label>
                <Input
                  placeholder="12-34-567890-01"
                  value={form.license}
                  onChange={e => handleChange('license', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>가입일자</Label>
                <Input type="date" value={form.joinDate} onChange={e => handleChange('joinDate', e.target.value)} />
              </InputField>
            </>
          ) : (
            <>
              {/* 법인 필드 */}
              <InputField>
                <Label>이름</Label>
                <Input
                  placeholder="법인명을 입력하세요"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>연락처</Label>
                <Input
                  placeholder="02-1234-5678"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>이메일</Label>
                <Input
                  placeholder="corp@example.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>주소</Label>
                <Input
                  placeholder="서울특별시 강남구"
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>상세주소</Label>
                <Input
                  placeholder="101동 101호"
                  value={form.detailAddress}
                  onChange={e => handleChange('detailAddress', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>우편번호</Label>
                <Input
                  placeholder="06236"
                  value={form.zipCode}
                  onChange={e => handleChange('zipCode', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>운전면허번호</Label>
                <Input
                  placeholder="12-34-567890-01"
                  value={form.license}
                  onChange={e => handleChange('license', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>가입일자</Label>
                <Input type="date" value={form.joinDate} onChange={e => handleChange('joinDate', e.target.value)} />
              </InputField>
            </>
          )}
        </FormGrid>

        <ButtonGroup>
          <BasicButton $buttonType="gray" onClick={onClose}>
            취소
          </BasicButton>
          <BasicButton onClick={handleSubmit}>등록</BasicButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default CustomerCreateModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  width: 680px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 20px;
`;

const CloseButton = styled.button`
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InputField = styled.div``;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
