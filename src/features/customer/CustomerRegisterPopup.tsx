import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import styled from 'styled-components';

import { Popup } from '@/components/ui/modal/popup/Popup';
import { Text } from '@/components/ui/text/Text';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { BasicButton } from '@/components/ui/button/BasicButton';
import { TextArea } from '@/components/ui/input/textarea/TextArea';
import { CODE_SUCCESS } from '@/utils/response';

import { FormRow, FormSection, FormFieldWrapper, MemoSection, DatePickerWrapper } from './CustomerRegisterPopup.styles';

import CalendarIcon from '@/assets/icons/ic-calendar.svg?react';
import SearchIcon from '@/assets/icons/ic-search.svg?react';
import PostcodeModal from './PostcodeModal';

interface CustomerRegisterPopupProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  onSuccess?: () => void;
}

interface CustomerFormData {
  customer_name: string;
  phone_number1: string;
  phone_number2: string;
  phone_number3: string;
  birthday: string;
  license_number1: string;
  license_number2: string;
  license_number3: string;
  license_number4: string;
  zip_code: string;
  address: string;
  detailed_address: string;
  memo: string;
}

interface CustomerFormErrors {
  customer_name?: string;
  phone_number?: string;
  birthday?: string;
  license_number?: string;
  zip_code?: string;
  address?: string;
  detailed_address?: string;
  memo?: string;
  submit?: string;
}

const initialFormData: CustomerFormData = {
  customer_name: '',
  phone_number1: '',
  phone_number2: '',
  phone_number3: '',
  birthday: '',
  license_number1: '',
  license_number2: '',
  license_number3: '',
  license_number4: '',
  zip_code: '',
  address: '',
  detailed_address: '',
  memo: ''
};

const PhoneNumberInput = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-end;
  width: 100%;
`;

const LicenseNumberInput = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-end;
  width: 100%;
  white-space: nowrap;
`;

// 다음 우편번호 서비스 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
        }) => void;
        width?: string;
        height?: string;
        animation?: boolean;
        hideMapBtn?: boolean;
        hideEngBtn?: boolean;
        pleaseReadGuide?: number;
        popupTitle?: string;
        popupKey?: string;
        popupMode?: boolean;
      }) => {
        open: () => void;
      };
    };
  }
}

export const CustomerRegisterPopup: React.FC<CustomerRegisterPopupProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  useEffect(() => {
    // 다음 우편번호 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: CustomerFormErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = '이름을 입력해주세요.';
    }

    const phoneNumber = `${formData.phone_number1}-${formData.phone_number2}-${formData.phone_number3}`;
    if (!phoneNumber.replace(/-/g, '').trim()) {
      newErrors.phone_number = '연락처를 입력해주세요.';
    } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(phoneNumber)) {
      newErrors.phone_number = '올바른 연락처 형식이 아닙니다. (예: 010-1234-5678)';
    }

    if (!formData.birthday) {
      newErrors.birthday = '생년월일을 입력해주세요.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      newErrors.birthday = '올바른 생년월일 형식이 아닙니다. (예: 1990-01-01)';
    }

    const licenseNumber = `${formData.license_number1}-${formData.license_number2}-${formData.license_number3}-${formData.license_number4}`;
    if (!licenseNumber.replace(/-/g, '').trim()) {
      newErrors.license_number = '운전면허번호를 입력해주세요.';
    } else if (!/^\d{2}-\d{2}-\d{6}-\d{2}$/.test(licenseNumber)) {
      newErrors.license_number = '올바른 운전면허번호 형식이 아닙니다. (예: 12-34-567890-12)';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = '우편번호를 입력해주세요.';
    } else if (!/^\d{5}$/.test(formData.zip_code)) {
      newErrors.zip_code = '올바른 우편번호 형식이 아닙니다. (예: 12345)';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handlePhoneNumberChange = useCallback((part: 1 | 2 | 3, value: string) => {
    const maxLength = part === 1 ? 3 : part === 2 ? 4 : 4;
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, maxLength);
    
    setFormData(prev => ({
      ...prev,
      [`phone_number${part}`]: numericValue
    }));

    if (numericValue.length === maxLength) {
      const nextInput = document.getElementById(`phone_number${part + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }, []);

  const handleLicenseNumberChange = useCallback((part: 1 | 2 | 3 | 4, value: string) => {
    const maxLength = part === 1 || part === 2 ? 2 : part === 3 ? 6 : 2;
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, maxLength);
    
    setFormData(prev => ({
      ...prev,
      [`license_number${part}`]: numericValue
    }));

    if (numericValue.length === maxLength) {
      const nextInput = document.getElementById(`license_number${part + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }, []);

  const handleInputChange = useCallback((field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      handleInputChange('birthday', formattedDate);
    } else {
      handleInputChange('birthday', '');
    }
  }, [handleInputChange]);

  const handlePostcodeSearch = useCallback(() => {
    setIsPostcodeOpen(true);
  }, []);

  const handlePostcodeComplete = useCallback((data: { zonecode: string; address: string }) => {
    handleInputChange('zip_code', data.zonecode);
    handleInputChange('address', data.address);
    setIsPostcodeOpen(false);
    const detailAddressInput = document.getElementById('detailed_address') as HTMLInputElement;
    if (detailAddressInput) {
      detailAddressInput.focus();
    }
  }, [handleInputChange]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }

      const requestData = {
        customerName: formData.customer_name,
        phoneNumber: `${formData.phone_number1}-${formData.phone_number2}-${formData.phone_number3}`,
        birthday: formData.birthday,
        licenseNumber: `${formData.license_number1}-${formData.license_number2}-${formData.license_number3}-${formData.license_number4}`,
        zipCode: formData.zip_code,
        address: formData.address,
        detailAddress: formData.detailed_address,
        memo: formData.memo || '',
        status: 'ACTIVE'
      };

      const response = await axios.post(
        'http://localhost:8080/api/v1/customers',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        if (response.data.code === CODE_SUCCESS) {
          toast.success('사용자가 성공적으로 등록되었습니다.');
          onClose();
          onSuccess?.();
        } else {
          toast.error(response.data.message || '사용자 등록에 실패했습니다.');
        }
      } else {
        toast.error('사용자 등록에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('사용자 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRegister = useCallback(async () => {
    await handleSubmit();
    setFormData(initialFormData);
    setErrors({});
    onClose(true);
  }, [handleSubmit, onClose]);

  const handleCancel = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    onClose(false);
  }, [onClose]);

  const popupActionButtons = (
    <>
      <BasicButton buttonType="basic" onClick={handleCancel} disabled={isSubmitting}>
        취소
      </BasicButton>
      <BasicButton buttonType="primary" onClick={handleRegister} disabled={isSubmitting}>
        {isSubmitting ? '등록 중...' : '등록'}
      </BasicButton>
    </>
  );

  return (
    <Popup isOpen={isOpen} onClose={handleCancel} title="사용자 등록" actionButtons={popupActionButtons}>
      {errors.submit && (
        <Text type="body2" color="error" style={{ marginBottom: '16px' }}>
          {errors.submit}
        </Text>
      )}

      <FormSection>
        <Text type="subheading2">기본 정보</Text>
        <FormRow>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="customer_name"
              label="이름"
              placeholder="사용자 이름을 입력하세요"
              onChange={value => handleInputChange('customer_name', value)}
              value={formData.customer_name}
              onEnter={handleRegister}
              autoFocus
              required={true}
              maxLength={50}
              errorText={errors.customer_name}
              disabled={isSubmitting}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <PhoneNumberInput>
              <TextInput
                type="text"
                id="phone_number1"
                label="연락처"
                placeholder="010"
                onChange={value => handlePhoneNumberChange(1, value)}
                value={formData.phone_number1}
                onEnter={handleRegister}
                required={true}
                maxLength={3}
                errorText={errors.phone_number}
                disabled={isSubmitting}
                width="60px"
              />
              <Text type="body1" style={{ marginBottom: '8px' }}>-</Text>
              <TextInput
                type="text"
                id="phone_number2"
                placeholder="1234"
                onChange={value => handlePhoneNumberChange(2, value)}
                value={formData.phone_number2}
                onEnter={handleRegister}
                required={true}
                maxLength={4}
                disabled={isSubmitting}
                width="60px"
              />
              <Text type="body1" style={{ marginBottom: '8px' }}>-</Text>
              <TextInput
                type="text"
                id="phone_number3"
                placeholder="5678"
                onChange={value => handlePhoneNumberChange(3, value)}
                value={formData.phone_number3}
                onEnter={handleRegister}
                required={true}
                maxLength={4}
                disabled={isSubmitting}
                width="60px"
              />
            </PhoneNumberInput>
          </FormFieldWrapper>
          <FormFieldWrapper>
            <DatePickerWrapper>
              <Text type="label">생년월일</Text>
              <DatePicker
                selected={formData.birthday ? new Date(formData.birthday) : null}
                onChange={handleDateChange}
                dateFormat="yyyy.MM.dd"
                placeholderText="YYYY.MM.DD"
                disabled={isSubmitting}
                locale={ko}
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                customInput={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid var(--color-gray400)',
                    borderRadius: '6px',
                    backgroundColor: isSubmitting ? 'var(--color-gray200)' : 'var(--color-white)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}>
                    <span style={{ flex: 1 }}>
                      {formData.birthday ? format(new Date(formData.birthday), 'yyyy.MM.dd') : 'YYYY.MM.DD'}
                    </span>
                    <CalendarIcon />
                  </div>
                }
              />
              {errors.birthday && (
                <Text type="error" style={{ marginLeft: '4px' }}>
                  {errors.birthday}
                </Text>
              )}
            </DatePickerWrapper>
          </FormFieldWrapper>
          <FormFieldWrapper>
            <LicenseNumberInput>
              <TextInput
                type="text"
                id="license_number1"
                label="운전면허번호"
                placeholder="12"
                onChange={value => handleLicenseNumberChange(1, value)}
                value={formData.license_number1}
                onEnter={handleRegister}
                required={true}
                maxLength={2}
                errorText={errors.license_number}
                disabled={isSubmitting}
                width="35px"
              />
              <Text type="body1" style={{ marginBottom: '8px' }}>-</Text>
              <TextInput
                type="text"
                id="license_number2"
                placeholder="34"
                onChange={value => handleLicenseNumberChange(2, value)}
                value={formData.license_number2}
                onEnter={handleRegister}
                required={true}
                maxLength={2}
                disabled={isSubmitting}
                width="35px"
              />
              <Text type="body1" style={{ marginBottom: '8px' }}>-</Text>
              <TextInput
                type="text"
                id="license_number3"
                placeholder="567890"
                onChange={value => handleLicenseNumberChange(3, value)}
                value={formData.license_number3}
                onEnter={handleRegister}
                required={true}
                maxLength={6}
                disabled={isSubmitting}
                width="90px"
              />
              <Text type="body1" style={{ marginBottom: '8px' }}>-</Text>
              <TextInput
                type="text"
                id="license_number4"
                placeholder="12"
                onChange={value => handleLicenseNumberChange(4, value)}
                value={formData.license_number4}
                onEnter={handleRegister}
                required={true}
                maxLength={2}
                disabled={isSubmitting}
                width="35px"
              />
            </LicenseNumberInput>
          </FormFieldWrapper>
        </FormRow>
      </FormSection>

      <FormSection>
        <Text type="subheading2">주소 정보</Text>
        <FormRow>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="zip_code"
              label="우편번호"
              placeholder="우편번호 검색"
              value={formData.zip_code}
              readOnly
              required={true}
              maxLength={5}
              errorText={errors.zip_code}
              disabled={isSubmitting}
              icon={<SearchIcon onClick={handlePostcodeSearch} style={{ cursor: 'pointer', color: 'var(--color-primary)' }} />}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="address"
              label="주소"
              placeholder="기본 주소"
              value={formData.address}
              readOnly
              required={true}
              maxLength={100}
              errorText={errors.address}
              disabled={isSubmitting}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <TextInput
              type="text"
              id="detailed_address"
              label="상세주소"
              placeholder="상세 주소를 입력하세요"
              onChange={value => handleInputChange('detailed_address', value)}
              value={formData.detailed_address}
              onEnter={handleRegister}
              maxLength={100}
              errorText={errors.detailed_address}
              disabled={isSubmitting}
            />
          </FormFieldWrapper>
        </FormRow>
      </FormSection>

      <FormSection>
        <Text type="subheading2">추가 정보</Text>
        <MemoSection>
          <TextArea
            id="memo"
            label="비고"
            placeholder="메모사항을 입력하세요."
            onChange={value => handleInputChange('memo', value)}
            value={formData.memo}
            minHeight="120px"
            disabled={isSubmitting}
          />
        </MemoSection>
      </FormSection>
      {isPostcodeOpen && (
        <PostcodeModal
          onComplete={handlePostcodeComplete}
          onClose={() => setIsPostcodeOpen(false)}
        />
      )}
    </Popup>
  );
}; 

