import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/libs/axios';
import { StatCard } from '@/components/ui/card/StatCard';
import { BasicButton } from '@/components/ui/button/BasicButton';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<any | null>(null);
  const [rentalInfo, setRentalInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/api/v1/customers/${id}`);
        setCustomer(res.data?.data);
      } catch (e) {
        console.error('고객 정보 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchRentalInfo = async () => {
      try {
        const res = await api.get(`/api/v1/customers/${id}/rentals`);
        setRentalInfo(res.data?.data);
      } catch (e) {
        setRentalInfo(null);
      }
    };
    fetchRentalInfo();
  }, [id]);

  useEffect(() => {
    if (customer) {
      setForm(customer);
    }
  }, [customer]);

  const handleInputChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/v1/customers/${id}`);
      toast.success('삭제되었습니다.');
      navigate(-1);
    } catch (e) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleConfirm = async () => {
    if (!form.email?.trim()) {
      toast.info('이메일은 필수 입력 항목입니다.');
      return;
    }
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(form.email)) {
      toast.error('유효한 이메일을 입력해주세요.');
      return;
    }
    if (!form.licenseNumber?.trim()) {
      toast.info('운전면허번호는 필수 입력 항목입니다.');
      return;
    }
    // 생년월일 유효성 검사: 미래 날짜 차단 + 만 18세 이상만 등록 가능
    if (form.birthday) {
      const today = new Date();
      const selectedDate = new Date(form.birthday);
      const legalDate = new Date();
      legalDate.setFullYear(today.getFullYear() - 18);
      const todayStr = today.toISOString().split('T')[0];
      if (form.birthday > todayStr) {
        toast.error('생년월일은 오늘 이전 날짜여야 합니다.');
        return;
      }
      if (selectedDate > legalDate) {
        toast.error('운전면허 발급 가능한 생년월일이 아닙니다. 만 18세 이상만 등록 가능합니다.');
        return;
      }
    }

    try {
      const response = await api.put(`/api/v1/customers/${id}`, form);
      if (response.data.code !== '000') {
        toast.error(response.data.message || '수정에 실패했습니다.');
        return;
      }
      toast.success('수정되었습니다.');
      setCustomer(form);
      setIsEditMode(false);
    } catch (e: any) {
      const serverMessage = e.response?.data?.message;
      if (serverMessage === '이미 등록된 면허번호입니다.') {
        toast.error(serverMessage);
      } else {
        toast.error('수정에 실패했습니다.');
      }
      console.error('[UPDATE 에러]', e);
    }
  };

  return (
    <Container>
      <Header>
        <h1>고객 상세 정보</h1>
      </Header>

      <MainRow>
        <CustomerBox>
          {loading ? (
            <div>로딩 중...</div>
          ) : customer ? (
            isEditMode ? (
              <>
                <TitleRow>
                  <Name>{form.customerName}</Name>
                  <StatusToggle>
                    <StatusBadge
                      active={form.status === 'ACTIVE'}
                      onClick={() => handleInputChange('status', 'ACTIVE')}
                    >
                      활성화
                    </StatusBadge>
                    <StatusBadge
                      active={form.status === 'WITHDRAWN'}
                      onClick={() => handleInputChange('status', 'WITHDRAWN')}
                    >
                      비활성화
                    </StatusBadge>
                  </StatusToggle>
                </TitleRow>
                <FieldGroup>
                  <FieldItem>
                    <FieldLabel>생년월일</FieldLabel>
                    <FieldInput
                      type="date"
                      value={form.birthday}
                      onChange={e => handleInputChange('birthday', e.target.value)}
                    />
                  </FieldItem>

                  <FieldItem>
                    <FieldLabel>휴대폰</FieldLabel>
                    <FieldInput
                      value={form.phoneNumber}
                      onChange={e => handleInputChange('phoneNumber', e.target.value)}
                    />
                  </FieldItem>

                  <FieldItem>
                    <FieldLabel>이메일</FieldLabel>
                    <FieldInput value={form.email} onChange={e => handleInputChange('email', e.target.value)} />
                  </FieldItem>

                  <FieldItem>
                    <FieldLabel>운전면허번호</FieldLabel>
                    <FieldInput
                      value={form.licenseNumber}
                      onChange={e => handleInputChange('licenseNumber', e.target.value)}
                    />
                  </FieldItem>
                </FieldGroup>

                <BottomButtonRow>
                  <BasicButton color="primary" onClick={handleConfirm}>
                    확인
                  </BasicButton>
                  <BasicButton onClick={() => setIsEditMode(false)}>취소</BasicButton>
                </BottomButtonRow>
              </>
            ) : (
              <>
                <TitleRow>
                  <Name>{customer.customerName}</Name>
                  <Status status={customer.status} />
                </TitleRow>
                <DetailField>
                  <FieldLabel>생년월일</FieldLabel>
                  <FieldValue>{customer.birthday}</FieldValue>
                </DetailField>
                <DetailField>
                  <FieldLabel>휴대폰</FieldLabel>
                  <FieldValue>{customer.phoneNumber}</FieldValue>
                </DetailField>
                <DetailField>
                  <FieldLabel>이메일</FieldLabel>
                  <FieldValue>{customer.email}</FieldValue>
                </DetailField>
                <DetailField>
                  <FieldLabel>운전면허</FieldLabel>
                  <FieldValue>{customer.licenseNumber}</FieldValue>
                </DetailField>
                <DetailField>
                  <FieldLabel>가입일</FieldLabel>
                  <FieldValue>{customer.createdAt?.split('T')[0]}</FieldValue>
                </DetailField>
                <BottomButtonRow>
                  <BasicButton onClick={() => setIsEditMode(true)}>수정</BasicButton>
                  <BasicButton buttonType="gray" onClick={handleDelete}>
                    삭제
                  </BasicButton>
                </BottomButtonRow>
              </>
            )
          ) : (
            <div>고객 정보를 불러올 수 없습니다.</div>
          )}
        </CustomerBox>

        <RightColumn>
          <HeaderContainer>
            <StatCard label="총 대여 횟수" count={rentalInfo?.totalCount ?? 0} unit="건" unitColor="blue" />
            <StatCard label="현재 대여 중" count={rentalInfo?.activeCount ?? 0} unit="건" unitColor="red" />
          </HeaderContainer>

          <CurrentRentalBox>
            <SectionTitle>현재 대여 정보</SectionTitle>
            {rentalInfo?.currentRental ? (
              <RentalInfoRow>
                <CarIcon>🚐</CarIcon>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {rentalInfo.currentRental.vehicleName}{' '}
                    <span style={{ color: '#888', fontWeight: 400, fontSize: 15 }}>
                      {rentalInfo.currentRental.licensePlate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>
                      📅 {rentalInfo.currentRental.startDate} ~ {rentalInfo.currentRental.endDate}
                    </span>
                    <RentalStatus status={rentalInfo.currentRental.status}>
                      {rentalInfo.currentRental.status}
                    </RentalStatus>
                  </div>
                </div>
              </RentalInfoRow>
            ) : (
              <div style={{ color: '#888', fontSize: 15 }}>현재 대여 중인 차량이 없습니다.</div>
            )}
          </CurrentRentalBox>

          <HistoryBox>
            <SectionTitle>대여 이력</SectionTitle>
            <HistoryTable>
              <thead>
                <tr>
                  <th>예약번호</th>
                  <th>차량</th>
                  <th>대여 시작일</th>
                  <th>반납일</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {rentalInfo?.rentalHistory && rentalInfo.rentalHistory.length > 0 ? (
                  [...rentalInfo.rentalHistory]
                    .sort((a, b) => {
                      const dateA = new Date(a.startDate).getTime();
                      const dateB = new Date(b.startDate).getTime();

                      // 예약 중이면 가장 위로 정렬
                      const isReservedA = a.status === '예약 중' ? 1 : 0;
                      const isReservedB = b.status === '예약 중' ? 1 : 0;

                      if (isReservedA !== isReservedB) {
                        return isReservedB - isReservedA; // 예약중은 위로 정렬
                      }

                      return dateB - dateA; // 그 외는 최신순 정렬
                    })
                    .map((item: any) => (
                      <tr key={item.reservationId}>
                        <td>{item.reservationId}</td>
                        <td>{item.vehicleName}</td>
                        <td>{item.startDate}</td>
                        <td>{item.endDate}</td>
                        <td>
                          <RentalStatus status={item.status}>{item.status}</RentalStatus>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ color: '#888', fontSize: 15 }}>
                      대여 이력이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </HistoryTable>
          </HistoryBox>
        </RightColumn>
      </MainRow>
    </Container>
  );
};

export default CustomerDetailPage;

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const MainRow = styled.div`
  display: flex;
  gap: 32px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 2;
`;

const CustomerBox = styled.div`
  flex: 1;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Name = styled.h2`
  font-size: 20px;
`;

const Status = styled.span<{ status?: string }>`
  background: #2563eb;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  &::before {
    content: ${({ status }) => (status === 'WITHDRAWN' ? '"비활성화"' : '"활성화"')};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const SectionTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const RentalInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CarIcon = styled.div`
  font-size: 40px;
  margin-right: 16px;
`;

const RentalStatus = styled.span<{ status?: string }>`
  background: ${
    ({ status }) =>
      status === '예약 중'
        ? '#10b981' // 초록
        : status === '반납 완료'
          ? '#6366f1' // 보라
          : status === '예약 대기'
            ? '#2563eb' // 파랑
            : '#9ca3af' // 기타(회색)
  };
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const CurrentRentalBox = styled.div`
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
  margin-bottom: 24px;
`;

const HistoryBox = styled.div`
  flex: 2;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.05));
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }
  th {
    background: #f9fafb;
    font-weight: 600;
  }
  tbody {
    display: block;
    max-height: 115px;
    overflow-y: auto;
  }
  thead,
  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const FieldInput = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const DetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
`;

const FieldValue = styled.div`
  font-size: 15px;
  color: #222;
  font-weight: 500;
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusBadge = styled.div<{ active: boolean }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: ${({ active }) => (active ? '#2563eb' : '#e5e7eb')};
  color: ${({ active }) => (active ? 'white' : '#555')};
  cursor: pointer;
  border: 1.5px solid ${({ active }) => (active ? '#2563eb' : '#e5e7eb')};
  transition:
    background 0.15s,
    color 0.15s;
`;

const BottomButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 32px;
`;
