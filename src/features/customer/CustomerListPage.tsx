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
import { formatDateOnly } from '@/utils/date';

interface CustomerTableData {
  id: number;
  name: string;
  phone: string;
  birth: string;
  address: string;
  email: string;
  license: string;
  joinDate: string;
  createdAt: string;
  status: '활성' | '비활성';
  type: 'INDIVIDUAL' | 'CORPORATE';
}

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

const STATUS_OPTIONS = [
  { label: '전체', value: '전체' },
  { label: '활성', value: '활성' },
  { label: '비활성', value: '비활성' },
];

const statusLabelMap = {
  active: '활성',
  withdrawn: '비활성',
};

const statusApiMap = {
  활성: 'ACTIVE',
  비활성: 'WITHDRAWN',
};

const personalTableHeaders = [
  { label: '이름', key: 'customerName', width: '13%' },
  { label: '연락처', key: 'phoneNumber', width: '15%' },
  { label: '생년월일', key: 'birthday', width: '15%' },
  { label: '이메일', key: 'email', width: '28%' },
  { label: '가입일자', key: 'createdAtFormatted', width: '15%' },
  {
    label: '회원 상태',
    key: 'status',
    width: 'auto',
    type: 'badge',
    valueToBadgeColorMap: {
      활성: 'green',
      비활성: 'gray',
    },
  },
];

const corporateTableHeaders = [
  { label: '이름', key: 'customerName', width: '10%' },
  { label: '연락처', key: 'phoneNumber', width: '13%' },
  { label: '이메일', key: 'email', width: '25%' },
  { label: '주소', key: 'address', width: '30%' },
  { label: '가입일자', key: 'createdAtFormatted', width: '12%' },
  {
    label: '회원 상태',
    key: 'status',
    width: 'auto',
    type: 'badge',
    valueToBadgeColorMap: {
      활성: 'green',
      비활성: 'gray',
    },
  },
];

const DEBOUNCE_DELAY = 400;

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [filters, setFilters] = useState({ status: '전체', keyword: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [customers, setCustomers] = useState<CustomerTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [summary, setSummary] = useState({ total: 0, individual: 0, corporate: 0, renting: 0 });

  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/customers/summary');
      setSummary(response.data.data);
    } catch (err) {
      console.error('고객 요약 정보 조회 실패:', err);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const statusParam = filters.status !== '전체' ? statusApiMap[filters.status as '활성' | '비활성'] : undefined;

    try {
      const response = await api.get('/api/v1/customers', {
        params: {
          sort: 'createdAt,DESC',
          type,
          status: statusParam,
          keyword: filters.keyword || undefined,
          page: currentPage - 1,
          size: 10,
        },
      });
      const data = response.data?.data;

      const formattedCustomers = (data?.list ?? []).map((customer: CustomerTableData) => ({
        ...customer,
        status: statusLabelMap[customer.status.toLowerCase() as keyof typeof statusLabelMap] || customer.status,
        createdAtFormatted: formatDateOnly(customer.createdAt),
      }));

      setCustomers(formattedCustomers);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      setError(err as Error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, type, currentPage]);

  useEffect(() => {
    fetchCustomers();
  }, [filters.status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const refreshData = useCallback(() => {
    fetchSummaryData();
    fetchCustomers();
  }, [fetchSummaryData, fetchCustomers]);

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

  useEffect(() => {
    debouncedFetch();
  }, [filters.keyword]);

  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        fetchCustomers();
      }, DEBOUNCE_DELAY),
    [fetchCustomers]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

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
              width="250px"
              id="status"
              label="회원 상태"
              options={STATUS_OPTIONS}
              value={filters.status}
              onSelect={handleStatusSelect}
            />
            <TextInput
              width="250px"
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
          data={customers}
          message={tableMessage}
          onRowClick={row => {
            navigate(`/customers/${row.id}`);
          }}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageBlockSize={10}
        />
      </TableContainer>
      {isCreateModalOpen && (
        <CustomerCreateModal
          key={type}
          type={type}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refreshData}
        />
      )}
    </DashboardContainer>
  );
};

export default CustomerListPage;
