import React, { useEffect, useState } from 'react';
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
      alert('삭제되었습니다.');
      navigate(-1);
    } catch (e) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleConfirm = async () => {
    if (!form.email || !form.licenseNumber) {
      alert('이메일과 운전면허번호는 필수입니다.');
      return;
    }

    try {
      await api.put(`/api/v1/customers/${id}`, form);
      alert('수정되었습니다.');
      setCustomer(form);
      setIsEditMode(false);
    } catch (e) {
      alert('수정에 실패했습니다.');
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

                <ButtonRow>
                  <BasicButton color="primary" onClick={handleConfirm}>
                    확인
                  </BasicButton>
                  <BasicButton onClick={() => setIsEditMode(false)}>취소</BasicButton>
                </ButtonRow>
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
                <ButtonRow>
                  <BasicButton onClick={() => setIsEditMode(true)}>수정</BasicButton>
                  <BasicButton buttonType="gray" onClick={handleDelete}>
                    삭제
                  </BasicButton>
                </ButtonRow>
              </>
            )
          ) : (
            <div>고객 정보를 불러올 수 없습니다.</div>
          )}
        </CustomerBox>

        <RightColumn>
          <HeaderContainer>
            <StatCard label="총 대여 횟수" count={12} unit="건" unitColor="blue" />
            <StatCard label="현재 대여 중" count={1} unit="건" unitColor="red" />
          </HeaderContainer>

          <CurrentRentalBox>
            <SectionTitle>현재 대여 정보</SectionTitle>
            <RentalInfoRow>
              <CarIcon>🚐</CarIcon>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>
                  아반떼 <span style={{ color: '#888', fontWeight: 400, fontSize: 15 }}>12가 3456</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span>📅 2023-10-15 ~ 2023-10-18</span>
                  <RentalStatus>진행중</RentalStatus>
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <a href="#" style={{ color: '#2563eb', fontWeight: 500 }}>
                  상세 보기 &gt;
                </a>
              </div>
            </RentalInfoRow>
          </CurrentRentalBox>

          <HistoryBox>
            <SectionTitle>
              대여 이력{' '}
              <span style={{ float: 'right', color: '#2563eb', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                전체 보기 &gt;
              </span>
            </SectionTitle>
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
                <tr>
                  <td>R-10025</td>
                  <td>아반떼</td>
                  <td>2023-10-15</td>
                  <td>2023-10-18</td>
                  <td>
                    <RentalStatus>진행중</RentalStatus>
                  </td>
                </tr>
                <tr>
                  <td>R-9876</td>
                  <td>투싼</td>
                  <td>2023-09-10</td>
                  <td>2023-09-15</td>
                  <td>
                    <RentalStatus status="done">완료</RentalStatus>
                  </td>
                </tr>
                <tr>
                  <td>R-8765</td>
                  <td>아반떼</td>
                  <td>2023-08-05</td>
                  <td>2023-08-08</td>
                  <td>
                    <RentalStatus status="done">완료</RentalStatus>
                  </td>
                </tr>
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
  background: ${({ status }) => (status === 'done' ? '#6366f1' : '#10b981')};
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
