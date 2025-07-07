import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import api from '@/libs/axios';
import CustomerCreateModal from './CustomerCreateModal.tsx';
import {
  DashboardContainer,
  TitleContainer,
  FilterContainer,
  FilterWrap,
  FilterContent,
  TableContainer,
} from '@/components/layout/DashboardLayout.styles';
import { StatCard } from '@/components/ui/card/StatCard';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { BasicButton } from '@/components/ui/button/BasicButton';
import { Text } from '@/components/ui/text/Text';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { Pagination } from '@/components/ui/table/pagination/Pagination';

interface CustomerApiResponse {
  id: number;
  customerName: string;
  phoneNumber: string;
  licenseNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
  birthday: string | null;
  status: 'ACTIVE' | 'WITHDRAWN';
  email: string;
  createdAt: string;
  customerType: 'INDIVIDUAL' | 'CORPORATE';
}

interface CustomerTableData {
  id: number;
  name: string;
  phone: string;
  birth: string;
  address: string;
  email: string;
  license: string;
  joinDate: string;
  status: '활성' | '비활성';
  type: 'INDIVIDUAL' | 'CORPORATE';
  index?: number;
}

const statusMap: Record<string, CustomerTableData['status']> = {
  ACTIVE: '활성',
  WITHDRAWN: '비활성',
};

const statusApiMap = {
  활성: 'ACTIVE',
  비활성: 'WITHDRAWN',
};

const transformCustomerData = (data: CustomerApiResponse): CustomerTableData => ({
  id: data.id,
  name: data.customerName,
  phone: data.phoneNumber,
  birth: data.birthday || '-',
  address: data.zipCode ? `${data.address} ${data.detailAddress} (${data.zipCode})` : '-',
  email: data.email,
  license: data.licenseNumber,
  joinDate: data.createdAt.split('T')[0],
  status: statusMap[data.status] ?? '비활성',
  type: data.customerType,
});

const HeaderContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--color-gray300);
`;

const TableHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TabButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ selected }) => (selected ? 'var(--color-primary)' : 'var(--color-gray300)')};
  background: ${({ selected }) => (selected ? 'var(--color-primary)' : 'var(--color-white)')};
  color: ${({ selected }) => (selected ? 'var(--color-white)' : 'var(--color-gray800)')};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:not(:last-child) {
    margin-right: 8px;
  }

  &:hover {
    border-color: var(--color-primary);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const STATUS_OPTIONS = [
  { label: '전체', value: '전체' },
  { label: '활성', value: '활성' },
  { label: '비활성', value: '비활성' },
];

const statusBadgeMap = {
  활성: 'primary',
  비활성: 'gray',
};

const personalTableHeaders = [
  { label: '번호', key: 'index', width: '60px' },
  { label: '이름', key: 'name', width: '100px' },
  { label: '연락처', key: 'phone', width: '130px' },
  { label: '생년월일', key: 'birth', width: '110px' },
  { label: '이메일', key: 'email', width: 'flex', minWidth: '180px' },
  { label: '운전면허번호', key: 'license', width: '160px' },
  { label: '가입일자', key: 'joinDate', width: '110px' },
  { label: '회원 상태', key: 'status', width: '110px', type: 'badge', valueToBadgeColorMap: statusBadgeMap },
];

const corporateTableHeaders = [
  { label: '번호', key: 'index', width: '60px' },
  { label: '이름', key: 'name', width: '120px' },
  { label: '연락처', key: 'phone', width: '130px' },
  { label: '이메일', key: 'email', width: '200px' },
  { label: '주소', key: 'address', width: 'flex', minWidth: '200px' },
  { label: '운전면허번호', key: 'license', width: '160px' },
  { label: '가입일자', key: 'joinDate', width: '110px' },
  { label: '회원 상태', key: 'status', width: '110px', type: 'badge', valueToBadgeColorMap: statusBadgeMap },
];

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 400;

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [filters, setFilters] = useState({ status: '전체', keyword: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState<CustomerTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [summary, setSummary] = useState({ total: 0, individual: 0, corporate: 0, renting: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/api/v1/customers/summary');
        setSummary(response.data.data);
      } catch (err) {
        console.error('고객 요약 정보 조회 실패:', err);
      }
    };
    fetchSummary();
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/v1/customers', {
        params: {
          size: 1000,
          sort: 'createdAt,DESC',
          status: filters.status !== '전체' ? statusApiMap[filters.status as keyof typeof statusApiMap] : undefined,
          keyword: filters.keyword || undefined,
        },
      });
      const customerList = response.data?.data?.list;
      if (customerList && Array.isArray(customerList)) {
        setCustomers(
          customerList.map(transformCustomerData).map((data, idx) => ({
            ...data,
            index: customerList.length - idx,
          }))
        );
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err as Error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const handleTypeSelect = useCallback((value: 'INDIVIDUAL' | 'CORPORATE') => {
    setType(value);
    setCurrentPage(1);
    setFilters({ status: '전체', keyword: '' });
  }, []);

  const handleStatusSelect = useCallback((value: string | number) => {
    setFilters(f => ({ ...f, status: String(value) }));
    setCurrentPage(1);
  }, []);

  const handleKeywordChange = useCallback((value: string) => {
    setFilters(f => ({ ...f, keyword: value }));
  }, []);

  const handleSearchClick = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setCurrentPage(p);
  }, []);

  const filteredData = useMemo(() => {
    const data = customers
      .filter(c => c.type === type)
      .filter(
        c =>
          (filters.status === '전체' || c.status === filters.status) &&
          (filters.keyword === '' ||
            c.name.includes(filters.keyword) ||
            c.phone.includes(filters.keyword) ||
            c.email.includes(filters.keyword))
      );
    return data;
  }, [customers, type, filters]);

  // filters.keyword가 바뀔 때만 디바운스로 fetch
  useEffect(() => {
    debouncedFetch();
  }, [filters.keyword]);

  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        console.log(filters.keyword);
        fetchCustomers();
      }, DEBOUNCE_DELAY),
    [fetchCustomers]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const tableHeaders = type === 'INDIVIDUAL' ? personalTableHeaders : corporateTableHeaders;

  const tableMessage = isLoading
    ? '데이터를 불러오는 중입니다...'
    : error
      ? '데이터 로딩에 실패했습니다.'
      : '표시할 데이터가 없습니다.';

  return (
    <DashboardContainer>
      <TitleContainer>
        <Text type="heading">사용자 관리</Text>
        <BasicButton color="primary" onClick={() => setIsCreateModalOpen(true)}>
          + 사용자 추가
        </BasicButton>
      </TitleContainer>

      <HeaderContainer>
        <StatCard label="총 고객 수" count={summary.total} unit="명" unitColor="blue" />
        <StatCard label="개인 고객" count={summary.individual} unit="명" unitColor="green" />
        <StatCard label="법인 고객" count={summary.corporate} unit="명" unitColor="yellow" />
        <StatCard label="현재 대여 중" count={summary.renting} unit="명" unitColor="red" />
      </HeaderContainer>

      <FilterContainer>
        <FilterWrap>
          <FilterContent>
            <Dropdown
              width="120px"
              id="status"
              label="회원 상태"
              options={STATUS_OPTIONS}
              value={filters.status}
              onSelect={handleStatusSelect}
            />
            <TextInput
              width="220px"
              type="text"
              id="keyword-input"
              label="검색어"
              placeholder="이름, 연락처, 이메일"
              value={filters.keyword}
              onChange={handleKeywordChange}
              onEnter={handleSearchClick}
              maxLength={20}
            />
          </FilterContent>
          <BasicButton onClick={handleSearchClick}>검색</BasicButton>
        </FilterWrap>
      </FilterContainer>

      <TableContainer>
        <TableHeaderRow>
          <Text type="subheading2">고객 목록</Text>
          <div>
            <TabButton selected={type === 'INDIVIDUAL'} onClick={() => handleTypeSelect('INDIVIDUAL')}>
              개인
            </TabButton>
            <TabButton selected={type === 'CORPORATE'} onClick={() => handleTypeSelect('CORPORATE')}>
              법인
            </TabButton>
          </div>
        </TableHeaderRow>
        <BasicTable<CustomerTableData>
          tableHeaders={tableHeaders}
          data={pagedData}
          message={tableMessage}
          onRowClick={row => {
            navigate(`/customers/${row.id}`);
          }}
        />
        {totalPages > 1 && (
          <PaginationContainer>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageBlockSize={10}
            />
          </PaginationContainer>
        )}
      </TableContainer>
      {isCreateModalOpen && (
        <CustomerCreateModal
          key={type}
          type={type}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCustomers}
        />
      )}
    </DashboardContainer>
  );
};

export default CustomerListPage;
